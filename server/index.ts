import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAdminUser } from "./seed-admin";
import path from "path";
import fs from "fs";

const app = express();

// Serve our direct HTML file FIRST before any other middleware
app.get('/', (req, res) => {
  // If user is authenticated, redirect to dashboard
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  
  const htmlPath = path.resolve(import.meta.dirname, "..", "client", "index.html");
  try {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    // Add cache-busting headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.type('html').send(html);
  } catch (error) {
    res.status(500).send('Error loading page');
  }
});

// Serve dashboard for authenticated users
app.get('/dashboard', (req, res) => {
  console.log('Dashboard route accessed');
  console.log('Is authenticated:', req.isAuthenticated ? req.isAuthenticated() : false);
  console.log('User:', req.user);
  
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    console.log('User not authenticated, redirecting to login');
    return res.redirect('/');
  }
  
  console.log('User authenticated, serving dashboard');
  const dashboardPath = path.join(process.cwd(), 'dashboard.html');
  if (fs.existsSync(dashboardPath)) {
    res.sendFile(dashboardPath);
  } else {
    res.status(404).send('Dashboard not found');
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed admin user for authentication
  try {
    await seedAdminUser();
    log("Admin user seeded successfully");
  } catch (error) {
    log("Admin user seeding failed, fallback authentication will be used");
  }

  const server = await registerRoutes(app);



  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // TEMPORARILY DISABLE VITE to serve direct HTML
  // if (app.get("env") === "development") {
  //   await setupVite(app, server);
  // } else {
  //   serveStatic(app);
  // }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
