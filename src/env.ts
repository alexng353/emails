import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    SENDGRID_API_KEY: z.string().optional(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
