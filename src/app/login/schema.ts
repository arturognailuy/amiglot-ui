import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
