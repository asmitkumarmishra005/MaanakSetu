const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const {
  testDatabaseConnection,
} = require("./config/db");

const authRoutes = require("./routes/auth");
const instrumentRoutes = require("./routes/instruments");
const applicationRoutes = require("./routes/applications");
const inspectionRoutes = require("./routes/inspections");
const certificateRoutes = require("./routes/certificates");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://asmitkumarmishra005.github.io",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MaanakSetu Backend API is running",
    version: "1.0.0",
  });
});

/* =========================
   HEALTH
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MaanakSetu API is healthy",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   DATABASE
========================= */

app.get("/api/database", async (req, res) => {
  const connected = await testDatabaseConnection();

  if (connected) {
    return res.json({
      success: true,
      message: "Database connection successful",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Database connection failed",
  });
});

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);

app.use(
  "/api/instruments",
  instrumentRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/inspections",
  inspectionRoutes
);

app.use(
  "/api/certificates",
  certificateRoutes
);

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================
   START SERVER
========================= */

const startServer = async () => {
  await testDatabaseConnection();

  app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("       MAANAKSETU BACKEND");
    console.log("======================================");
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log("");
  });
};

startServer();