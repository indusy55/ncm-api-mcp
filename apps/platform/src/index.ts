import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { getEnv } from "./config.js";

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

const env = getEnv();
const app = await createApp();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Platform server running at http://localhost:${info.port}`);
  },
);
