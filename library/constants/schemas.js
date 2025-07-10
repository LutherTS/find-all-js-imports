import * as z from "zod";

export const VisitedSetSchema = z.set(
  z.string({ error: "All values within visitedSet should be strings." }),
  { error: "visitedSet should be a Set." }
);
