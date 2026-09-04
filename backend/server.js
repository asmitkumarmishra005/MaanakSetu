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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://asmitkumarmishra005.github.io",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS policy: Origin not allowed")
      );
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
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

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MaanakSetu Backend API is running",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "MaanakSetu API is healthy",
    timestamp: new Date().toISOString(),
  });
});

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

app.use("/api/auth", authRoutes);
app.use("/api/instruments", instrumentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/certificates", certificateRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (error.message?.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "CORS origin not allowed",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const startServer = async () => {
  await testDatabaseConnection();

  app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("       MAANAKSETU BACKEND");
    console.log("======================================");
    console.log(`Server running on port ${PORT}`);
    console.log("");
  });
};

startServer();