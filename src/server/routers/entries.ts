import { z } from "zod";
import { router, protectedProcedure } from "./index";
import { entries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const entriesRouter = router({
  create: protectedProcedure
    .input(z.object({
      text: z.string().min(1),
      wordCount: z.number().default(0),
      lineCount: z.number().default(0),
      durationMs: z.number().default(0),
      inputMode: z.enum(["keyboard", "pen", "voice"]).default("keyboard"),
      prompt: z.string().optional(),
      excludeFromReflection: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const [entry] = await ctx.db.insert(entries).values({
        userId: ctx.session.user.id,
        ...input,
      }).returning();
      return entry;
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db
        .select()
        .from(entries)
        .where(eq(entries.userId, ctx.session.user.id))
        .orderBy(desc(entries.createdAt));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(entries)
        .where(eq(entries.id, input.id));
      return { success: true };
    }),
});