
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API_URL from "../api";

function VerifyCertificate() {
  const { code } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    verifyCertificate();
  }, [code]);

  const verifyCertificate = async () => {
    if (!code) {
      setError("Verification code is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/certificates/verify/${encodeURIComponent(code)}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Certificate could not be verified."
        );
      }

      setCertificate(data.certificate || data);
    } catch (err) {
      console.error("Certificate verification error:", err);

      setError(
        err.message || "Unable to verify certificate."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const isRevoked =
    certificate?.status === "revoked";

  const isExpired =
    certificate?.valid_until &&
    new Date(certificate.valid_until) < new Date();

  const isValid =
    certificate &&
    !isRevoked &&
    !isExpired;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
          background: "#f4f7fb",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Verifying Certificate...</h2>
          <p>Please wait while we check the official record.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <div style={{ fontSize: "42px" }}>⚖</div>

          <h1>MaanakSetu</h1>

          <p>
            Public Certificate Verification
          </p>
        </div>

        {error ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: "55px" }}>❌</div>

            <h2>Certificate Not Verified</h2>

            <p>{error}</p>

            <p>
              Verification Code:
              <strong> {code}</strong>
            </p>

            <Link to="/login">
              ← Back to MaanakSetu
            </Link>
          </div>
        ) : (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "40px",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  fontSize: "60px",
                }}
              >
                {isValid ? "✅" : "⚠️"}
              </div>

              <h2>
                {isValid
                  ? "VALID CERTIFICATE"
                  : isRevoked
                  ? "CERTIFICATE REVOKED"
                  : "CERTIFICATE EXPIRED"}
              </h2>

              <p>
                {isValid
                  ? "This certificate has been successfully verified against the MaanakSetu digital record."
                  : "This certificate is not currently valid."}
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                borderRadius: "12px",
                background: isValid
                  ? "#e8f7ee"
                  : "#fdecec",
                marginBottom: "30px",
                textAlign: "center",
              }}
            >
              <strong>
                Certificate Number
              </strong>

              <h2 style={{ margin: "8px 0 0" }}>
                {certificate.certificate_number ||
                  "N/A"}
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <strong>Instrument</strong>
                <p>
                  {certificate.instrument_type ||
                    "N/A"}
                </p>
              </div>

              <div>
                <strong>Manufacturer</strong>
                <p>
                  {certificate.manufacturer ||
                    "N/A"}
                </p>
              </div>

              <div>
                <strong>Model</strong>
                <p>
                  {certificate.model ||
                    certificate.model_number ||
                    "N/A"}
                </p>
              </div>

              <div>
                <strong>Serial Number</strong>
                <p>
                  {certificate.serial_number ||
                    "N/A"}
                </p>
              </div>

              <div>
                <strong>Issued On</strong>
                <p>
                  {formatDate(
                    certificate.issued_at ||
                      certificate.issued_on
                  )}
                </p>
              </div>

              <div>
                <strong>Valid Until</strong>
                <p>
                  {formatDate(
                    certificate.valid_until
                  )}
                </p>
              </div>

              <div>
                <strong>Verification Code</strong>
                <p>{code}</p>
              </div>

              <div>
                <strong>Status</strong>
                <p>
                  {isValid
                    ? "Valid"
                    : isRevoked
                    ? "Revoked"
                    : "Expired"}
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "35px",
                paddingTop: "25px",
                borderTop: "1px solid #ddd",
                textAlign: "center",
              }}
            >
              <p>
                This verification result is provided by
                MaanakSetu's digital verification system.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyCertificate;

