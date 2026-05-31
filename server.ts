import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing and API handlers first
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Custom middleware to handle SPA routing fallback for requests that do not match assets or API.
  // This is especially critical for paths like "/@slug" because Vite's fallback ignores paths starting with "/@" (treating them as Vite internals)
  app.use((req, res, next) => {
    const isApi = req.path.startsWith("/api");
    const isStaticAsset = req.path.includes(".") || req.path.startsWith("/assets");
    const isViteInternal = req.path.startsWith("/@vite") || req.path.startsWith("/@fs") || req.path.startsWith("/@id") || req.path.startsWith("/@react-refresh");
    
    if (!isApi && !isStaticAsset && !isViteInternal) {
      req.url = "/index.html";
    }
    next();
  });

  // Vite middleware for development, and static file server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from the dist folder
    app.use(express.static(distPath, {
      maxAge: "1d",
    }));

    // Fallback all unspecified routes to index.html for React Router to handle
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Vite Full-stack Server] running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
  process.exit(1);
});
