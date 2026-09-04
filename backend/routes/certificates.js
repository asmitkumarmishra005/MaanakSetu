const express = require("express");
const crypto = require("crypto");
const { pool } = require("../config/db");

const router = express.Router();

/* =========================
   CREATE CERTIFICATE
========================= */

router.post("/", async (req, res) => {
  try {
    const {
      applicationId,
      inspectionId,
      issuedBy,
      validFrom,
      validUntil,
    } = req.body;

    if (
      !applicationId ||
      !inspectionId ||
      !issuedBy ||
      !validFrom ||
      !validUntil
    ) {
      return res.status(400).json({
        success: false,
        message: "Required certificate information is missing",
      });
    }

    const certificateNumber =
      `CERT-MS-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

    const verificationCode =
      crypto.randomBytes(16).toString("hex");

    const result = await pool.query(
      `INSERT INTO certificates
       (
         certificate_number,
         application_id,
         inspection_id,
         issued_by,
         valid_from,
         valid_until,
         verification_code,
         status
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,'valid')
       RETURNING *`,
      [
        certificateNumber,
        applicationId,
        inspectionId,
        issuedBy,
        validFrom,
        validUntil,
        verificationCode,
      ]
    );

    await pool.query(
      `UPDATE applications
       SET status = 'verified',
           updated_at = NOW()
       WHERE id = $1`,
      [applicationId]
    );

    res.status(201).json({
      success: true,
      message: "Certificate issued successfully",
      certificate: result.rows[0],
    });
  } catch (error) {
    console.error("Certificate creation error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to issue certificate",
    });
  }
});

/* =========================
   USER CERTIFICATES
========================= */

router.get("/user/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         c.*,
         i.instrument_type,
         i.manufacturer,
         i.model_number,
         i.serial_number
       FROM certificates c
       JOIN applications a
         ON c.application_id = a.id
       JOIN instruments i
         ON a.instrument_id = i.id
       WHERE a.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.params.userId]
    );

    res.json({
      success: true,
      certificates: result.rows,
    });
  } catch (error) {
    console.error("Certificates fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
    });
  }
});

/* =========================
   PUBLIC QR VERIFICATION
========================= */

router.get("/verify/:verificationCode", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         c.certificate_number,
         c.valid_from,
         c.valid_until,
         c.status,
         c.verification_code,
         i.instrument_type,
         i.manufacturer,
         i.model_number,
         i.serial_number,
         u.full_name AS applicant_name
       FROM certificates c
       JOIN applications a
         ON c.application_id = a.id
       JOIN instruments i
         ON a.instrument_id = i.id
       JOIN users u
         ON a.user_id = u.id
       WHERE c.verification_code = $1`,
      [req.params.verificationCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
        valid: false,
      });
    }

    const certificate = result.rows[0];

    const today = new Date();
    const expiryDate = new Date(
      certificate.valid_until
    );

    let status = certificate.status;

    if (
      status === "valid" &&
      today > expiryDate
    ) {
      status = "expired";

      await pool.query(
        `UPDATE certificates
         SET status = 'expired'
         WHERE verification_code = $1`,
        [req.params.verificationCode]
      );
    }

    res.json({
      success: true,
      valid: status === "valid",
      certificate: {
        ...certificate,
        status,
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error.message);

    res.status(500).json({
      success: false,
      message: "Certificate verification failed",
    });
  }
});

/* =========================
   REVOKE CERTIFICATE
========================= */

router.patch("/:id/revoke", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE certificates
       SET status = 'revoked'
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.json({
      success: true,
      message: "Certificate revoked successfully",
      certificate: result.rows[0],
    });
  } catch (error) {
    console.error("Certificate revoke error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to revoke certificate",
    });
  }
});

module.exports = router;