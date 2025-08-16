import { createServer } from "http";
import app from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  const server = createServer(app);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "127.0.0.1", () => {
    log(`Serving on http://127.0.0.1:${port}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} déjà utilisé`);
    } else {
      console.error("❌ Erreur serveur:", err);
    }
  });
})();
