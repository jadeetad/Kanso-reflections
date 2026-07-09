import { router } from "./index";
import { entriesRouter } from "./entries";
import { reflectionsRouter } from "./reflections";
import { profileRouter } from "./profile";

export const appRouter = router({
  entries: entriesRouter,
  reflections: reflectionsRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;