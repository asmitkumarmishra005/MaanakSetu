const express = require("express");
const { pool } = require("../config/db");

const router = express.Router();

/* =========================
   REGISTER INSTRUMENT
========================= */

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      instrumentType,
      manufacturer,
      modelNumber,
      serialNumber,
      capacityRange,
      yearOfManufacture,
      location,
    } = req.body;

    if (
      !userId ||
      !instrumentType ||
      !manufacturer ||
      !serialNumber
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User, instrument type, manufacturer and serial number are required",
      });
    }

    const existing = await pool.query(
      `SELECT id FROM instruments
       WHERE serial_number = $1`,
      [serialNumber]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Instrument with this serial number already exists",
      });
    }

    const result = await pool.query(
      `INSERT INTO instruments
       (
         user_id,
         instrument_type,
         manufacturer,
         model_number,
         serial_number,
         capacity_range,
         year_of_manufacture,
         location,
         status
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'registered')
       RETURNING *`,
      [
        userId,
        instrumentType,
        manufacturer,
        modelNumber || null,
        serialNumber,
        capacityRange || null,
        yearOfManufacture || null,
        location || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Instrument registered successfully",
      instrument: result.rows[0],
    });
  } catch (error) {
    console.error("Instrument registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to register instrument",
    });
  }
});

/* =========================
   GET USER INSTRUMENTS
========================= */

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM instruments
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      instruments: result.rows,
    });
  } catch (error) {
    console.error("Get instruments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch instruments",
    });
  }
});

/* =========================
   GET SINGLE INSTRUMENT
========================= */

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM instruments
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Instrument not found",
      });
    }

    res.json({
      success: true,
      instrument: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch instrument",
    });
  }
});

module.exports = router;