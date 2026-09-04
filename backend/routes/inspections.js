const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

/* =========================
   CREATE INSPECTION
========================= */

router.post("/", async (req, res) => {
  try {
    const {
      applicationId,
      officerId,
      inspectionDate,
      observations,
      measuredValues,
      remarks,
      result,
    } = req.body;

    if (!applicationId || !officerId) {
      return res.status(400).json({
        success: false,
        message: "Application and officer are required",
      });
    }

    const inspectionResult = await pool.query(
      `INSERT INTO inspections
       (
         application_id,
         officer_id,
         inspection_date,
         observations,
         measured_values,
         remarks,
         result
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        applicationId,
        officerId,
        inspectionDate || new Date(),
        observations || null,
        JSON.stringify(measuredValues || {}),
        remarks || null,
        result || "pending",
      ]
    );

    await pool.query(
      `UPDATE applications
       SET status = 'inspection_completed',
           updated_at = NOW()
       WHERE id = $1`,
      [applicationId]
    );

    res.status(201).json({
      success: true,
      message: "Inspection recorded successfully",
      inspection: inspectionResult.rows[0],
    });
  } catch (error) {
    console.error("Inspection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to record inspection",
    });
  }
});

/* =========================
   GET INSPECTION
========================= */

router.get("/:applicationId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         ins.*,
         u.full_name AS officer_name
       FROM inspections ins
       JOIN users u
         ON ins.officer_id = u.id
       WHERE ins.application_id = $1
       ORDER BY ins.created_at DESC`,
      [req.params.applicationId]
    );

    res.json({
      success: true,
      inspections: result.rows,
    });
  } catch (error) {
    console.error("Inspection fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inspection",
    });
  }
});

module.exports = router;