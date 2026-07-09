import { z } from "zod";
import { router, protectedProcedure } from "./index";
import { reflections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateReflection } from "@/lib/gemini";
import { reflectionRatelimit } from "@/lib/ratelimit";
import { TRPCError } from "@trpc/server";

export const reflectionsRouter = router({
  generate: protectedProcedure
    .input(z.object({
      entryId: z.string(),
      entryText: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { success } = await reflectionRatelimit.limit(ctx.session.user.id);
      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You've reached your daily reflection limit. Come back tomorrow.",
        });
      }

      const text = await generateReflection(input.entryText);

      const [reflection] = await ctx.db.insert(reflections).values({
        userId: ctx.session.user.id,
        entryId: input.entryId,
        text,
      }).returning();

      return reflection;
    }),

  respond: protectedProcedure
    .input(z.object({
      id: z.string(),
      response: z.enum(["resonates", "missed"]),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [reflection] = await ctx.db
        .update(reflections)
        .set({ response: input.response, feedback: input.feedback, reviewed: true })
        .where(eq(reflections.id, input.id))
        .returning();
      return reflection;
    }),

  getByEntry: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(reflections)
        .where(eq(reflections.entryId, input.entryId));
    }),
});
