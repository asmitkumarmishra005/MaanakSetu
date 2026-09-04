const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

/* =========================
   CREATE APPLICATION
========================= */

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      instrumentId,
      verificationType,
      preferredDate,
      inspectionLocation,
      remarks,
    } = req.body;

    if (
      !userId ||
      !instrumentId ||
      !verificationType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User, instrument and verification type are required",
      });
    }

    const applicationNumber =
      `MS-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

    const result = await pool.query(
      `INSERT INTO applications
       (
         application_number,
         user_id,
         instrument_id,
         verification_type,
         preferred_date,
         inspection_location,
         remarks,
         status
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,'submitted')
       RETURNING *`,
      [
        applicationNumber,
        userId,
        instrumentId,
        verificationType,
        preferredDate || null,
        inspectionLocation || null,
        remarks || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Verification application submitted",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Application error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
});

/* =========================
   USER APPLICATIONS
========================= */

router.get("/user/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         a.*,
         i.instrument_type,
         i.manufacturer,
         i.model_number,
         i.serial_number
       FROM applications a
       JOIN instruments i
         ON a.instrument_id = i.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.userId]
    );

    res.json({
      success: true,
      applications: result.rows,
    });
  } catch (error) {
    console.error("Applications fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
});

/* =========================
   GET ALL APPLICATIONS
   FOR OFFICERS / ADMIN
========================= */

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         a.*,
         u.full_name AS applicant_name,
         u.email AS applicant_email,
         i.instrument_type,
         i.manufacturer,
         i.model_number,
         i.serial_number,
         i.location
       FROM applications a
       JOIN users u
         ON a.user_id = u.id
       JOIN instruments i
         ON a.instrument_id = i.id
       ORDER BY a.created_at DESC`
    );

    res.json({
      success: true,
      applications: result.rows,
    });
  } catch (error) {
    console.error("All applications error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
});

/* =========================
   UPDATE APPLICATION STATUS
========================= */

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "submitted",
      "under_review",
      "assigned",
      "inspection_scheduled",
      "inspection_completed",
      "verified",
      "rejected",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const result = await pool.query(
      `UPDATE applications
       SET status = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application status updated",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Status update error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update application",
    });
  }
});

module.exports = router;