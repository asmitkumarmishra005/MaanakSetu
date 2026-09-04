const express = require("express");
const crypto = require("crypto");
const QRCode = require("qrcode");

const { pool } = require("../config/db");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/auth");

const router = express.Router();

/*
========================================
GENERATE UNIQUE CERTIFICATE NUMBER
========================================
*/
const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `MS/${year}/${random}`;
};

/*
========================================
GENERATE UNIQUE VERIFICATION CODE
========================================
*/
const generateVerificationCode = () => {
  return crypto
    .randomBytes(8)
    .toString("hex")
    .toUpperCase();
};

/*
========================================
CREATE CERTIFICATE
POST /api/certificates/generate/:inspectionId
========================================
Only authorized officers/admins can generate certificates.
Certificate can only be generated for PASS inspection.
========================================
*/
router.post(
  "/generate/:inspectionId",
  authenticateToken,
  authorizeRoles("officer", "gatc", "admin"),
  async (req, res) => {
    try {
      const { inspectionId } = req.params;

      /*
      ----------------------------------------
      Get inspection + application + instrument
      ----------------------------------------
      */
      const inspectionResult = await pool.query(
        `
        SELECT
          i.id AS inspection_id,
          i.application_id,
          i.officer_id,
          i.inspection_date,
          i.result,
          i.observations,
          i.measured_values,
          i.remarks,

          a.application_number,
          a.user_id,
          a.verification_type,

          ins.instrument_type,
          ins.manufacturer,
          ins.model_number,
          ins.serial_number,
          ins.capacity_range,
          ins.location

        FROM inspections i

        INNER JOIN applications a
          ON i.application_id = a.id

        INNER JOIN instruments ins
          ON a.instrument_id = ins.id

        WHERE i.id = $1
        `,
        [inspectionId]
      );

      if (inspectionResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Inspection not found",
        });
      }

      const inspection = inspectionResult.rows[0];

      /*
      ----------------------------------------
      Check inspection result
      ----------------------------------------
      */
      if (inspection.result !== "pass") {
        return res.status(400).json({
          success: false,
          message:
            "Certificate can only be generated for a PASS inspection",
        });
      }

      /*
      ----------------------------------------
      Prevent duplicate certificate
      ----------------------------------------
      */
      const existingCertificate = await pool.query(
        `
        SELECT *
        FROM certificates
        WHERE inspection_id = $1
        LIMIT 1
        `,
        [inspectionId]
      );

      if (existingCertificate.rows.length > 0) {
        return res.status(200).json({
          success: true,
          message: "Certificate already exists",
          certificate: existingCertificate.rows[0],
        });
      }

      /*
      ----------------------------------------
      Generate certificate details
      ----------------------------------------
      */

      const certificateNumber =
        generateCertificateNumber();

      const verificationCode =
        generateVerificationCode();

      const validFrom = new Date();

      /*
      Legal-metrology validity can later be
      configured according to instrument/type/rules.
      For MVP we use 1 year.
      */

      const validUntil = new Date(validFrom);

      validUntil.setFullYear(
        validUntil.getFullYear() + 1
      );

      /*
      ----------------------------------------
      Public verification URL
      ----------------------------------------
      */

      const frontendBase =
        "https://asmitkumarmishra005.github.io/MaanakSetu";

      const verificationUrl =
        `${frontendBase}/#/verify/${verificationCode}`;

      /*
      ----------------------------------------
      Generate QR code
      ----------------------------------------
      */

      const qrCodeDataUrl =
        await QRCode.toDataURL(verificationUrl);

      /*
      ----------------------------------------
      Store certificate
      ----------------------------------------
      */

      const certificateResult = await pool.query(
        `
        INSERT INTO certificates
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

        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          'valid'
        )

        RETURNING *
        `,
        [
          certificateNumber,
          inspection.application_id,
          inspection.inspection_id,
          req.user.id,
          validFrom,
          validUntil,
          verificationCode,
        ]
      );

      /*
      ----------------------------------------
      Update application status
      ----------------------------------------
      */

      await pool.query(
        `
        UPDATE applications
        SET
          status = 'verified',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [inspection.application_id]
      );

      /*
      ----------------------------------------
      Update instrument status
      ----------------------------------------
      */

      await pool.query(
        `
        UPDATE instruments
        SET
          status = 'verified',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = (
          SELECT instrument_id
          FROM applications
          WHERE id = $1
        )
        `,
        [inspection.application_id]
      );

      /*
      ----------------------------------------
      Response
      ----------------------------------------
      */

      return res.status(201).json({
        success: true,
        message:
          "Certificate generated successfully",

        certificate:
          certificateResult.rows[0],

        verificationUrl,

        qrCode: qrCodeDataUrl,

        instrument: {
          type: inspection.instrument_type,
          manufacturer:
            inspection.manufacturer,
          model:
            inspection.model_number,
          serialNumber:
            inspection.serial_number,
          capacity:
            inspection.capacity_range,
        },

        validity: {
          from: validFrom,
          until: validUntil,
        },
      });
    } catch (error) {
      console.error(
        "Certificate generation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to generate certificate",
      });
    }
  }
);

/*
========================================
GET MY CERTIFICATES
GET /api/certificates/my
========================================
========================================
*/
router.get(
  "/my",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT
          c.*,
          a.application_number,

          ins.instrument_type,
          ins.manufacturer,
          ins.model_number,
          ins.serial_number

        FROM certificates c

        INNER JOIN applications a
          ON c.application_id = a.id

        INNER JOIN instruments ins
          ON a.instrument_id = ins.id

        WHERE a.user_id = $1

        ORDER BY c.created_at DESC
        `,
        [req.user.id]
      );

      return res.json({
        success: true,
        certificates: result.rows,
      });
    } catch (error) {
      console.error(
        "Get certificates error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch certificates",
      });
    }
  }
);

/*
========================================
GET CERTIFICATE BY ID
GET /api/certificates/:id
========================================
========================================
*/
router.get(
  "/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          c.*,

          a.application_number,
          a.user_id,
          a.verification_type,

          ins.instrument_type,
          ins.manufacturer,
          ins.model_number,
          ins.serial_number,
          ins.capacity_range,
          ins.location,

          u.full_name AS issued_by_name

        FROM certificates c

        INNER JOIN applications a
          ON c.application_id = a.id

        INNER JOIN instruments ins
          ON a.instrument_id = ins.id

        INNER JOIN users u
          ON c.issued_by = u.id

        WHERE c.id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      return res.json({
        success: true,
        certificate: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Get certificate error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch certificate",
      });
    }
  }
);

/*
========================================
PUBLIC CERTIFICATE VERIFICATION
GET /api/certificates/verify/:code
========================================
NO LOGIN REQUIRED
========================================
*/
router.get(
  "/verify/:code",
  async (req, res) => {
    try {
      const { code } = req.params;

      const result = await pool.query(
        `
        SELECT
          c.certificate_number,
          c.valid_from,
          c.valid_until,
          c.verification_code,
          c.status,
          c.created_at,

          a.application_number,

          ins.instrument_type,
          ins.manufacturer,
          ins.model_number,
          ins.serial_number,
          ins.capacity_range,
          ins.location

        FROM certificates c

        INNER JOIN applications a
          ON c.application_id = a.id

        INNER JOIN instruments ins
          ON a.instrument_id = ins.id

        WHERE c.verification_code = $1
        LIMIT 1
        `,
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          verified: false,
          message:
            "Certificate not found or invalid verification code",
        });
      }

      const certificate = result.rows[0];

      /*
      ----------------------------------------
      Automatically detect expiry
      ----------------------------------------
      */

      const today = new Date();
      const validUntil =
        new Date(certificate.valid_until);

      let currentStatus =
        certificate.status;

      if (
        currentStatus === "valid" &&
        validUntil < today
      ) {
        currentStatus = "expired";

        await pool.query(
          `
          UPDATE certificates
          SET
            status = 'expired',
            updated_at = CURRENT_TIMESTAMP
          WHERE verification_code = $1
          `,
          [code]
        );
      }

      /*
      ----------------------------------------
      Public response
      ----------------------------------------
      */

      return res.json({
        success: true,

        verified:
          currentStatus === "valid",

        status: currentStatus,

        certificate: {
          certificateNumber:
            certificate.certificate_number,

          applicationNumber:
            certificate.application_number,

          validFrom:
            certificate.valid_from,

          validUntil:
            certificate.valid_until,

          verificationCode:
            certificate.verification_code,

          instrument: {
            type:
              certificate.instrument_type,

            manufacturer:
              certificate.manufacturer,

            model:
              certificate.model_number,

            serialNumber:
              certificate.serial_number,

            capacity:
              certificate.capacity_range,

            location:
              certificate.location,
          },
        },
      });
    } catch (error) {
      console.error(
        "Certificate verification error:",
        error
      );

      return res.status(500).json({
        success: false,
        verified: false,
        message:
          "Certificate verification failed",
      });
    }
  }
);

/*
========================================
REVOKE CERTIFICATE
PATCH /api/certificates/:id/revoke
========================================
========================================
*/
router.patch(
  "/:id/revoke",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        UPDATE certificates
        SET
          status = 'revoked',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      return res.json({
        success: true,
        message:
          "Certificate revoked successfully",

        certificate:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Revoke certificate error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to revoke certificate",
      });
    }
  }
);

module.exports = router;