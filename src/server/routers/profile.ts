import { z } from "zod";
import { router, protectedProcedure } from "./index";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const profileRouter = router({
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const [profile] = await ctx.db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, ctx.session.user.id));
      return profile ?? null;
    }),

  upsert: protectedProcedure
    .input(z.object({
      interests: z.array(z.string()).optional(),
      styles: z.array(z.string()).optional(),
      onboarded: z.boolean().optional(),
      theme: z.enum(["light", "dark"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [profile] = await ctx.db
        .insert(profiles)
        .values({ userId: ctx.session.user.id, ...input })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: { ...input, updatedAt: new Date() },
        })
        .returning();
      return profile;
    }),
});