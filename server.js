import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to built frontend assets
const DIST_PATH = path.join(__dirname, "dist");

// Serve static assets with explicit MIME types
app.use(
  express.static(DIST_PATH, {
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(js|mjs)$/)) {
        res.setHeader("Content-Type", "application/javascript");
      }
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      }
    },
  })
);
