import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API_URL from "../api";

function CertificateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCertificate();
  }, [id]);

  const loadCertificate = async () => {
    const token = localStorage.getItem("maanaksetu_token");
    const savedUser = localStorage.getItem("maanaksetu_user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/certificates/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("maanaksetu_token");
        localStorage.removeItem("maanaksetu_user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load certificate"
        );
      }

      setCertificate(data.certificate || data);
    } catch (error) {
      console.error("Certificate loading error:", error);
      setMessage(
        error.message || "Unable to load certificate."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading Certificate...</h2>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Certificate Not Found</h2>
        <p>{message}</p>

        <Link to="/certificates">
          ← Back to Certificates
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <Link to="/certificates">
            ← My Certificates
          </Link>

          <button
            type="button"
            onClick={handlePrint}
          >
            🖨 Print Certificate
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "42px" }}>⚖</div>

          <h1>MaanakSetu</h1>

          <h2>
            Digital Verification Certificate
          </h2>

          <p>
            Legal Metrology Verification & Certification
          </p>
        </div>

        <hr />

        <div
          style={{
            margin: "25px 0",
            textAlign: "center",
          }}
        >
          <p>Certificate Number</p>

          <h2>
            {certificate.certificate_number || "N/A"}
          </h2>

          <strong
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "8px 18px",
              borderRadius: "20px",
              background:
                certificate.status === "revoked"
                  ? "#fdecec"
                  : "#e8f7ee",
              color:
                certificate.status === "revoked"
                  ? "#b42318"
                  : "#16733c",
            }}
          >
            {certificate.status === "revoked"
              ? "REVOKED"
              : "VALID"}
          </strong>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <div>
            <strong>Instrument</strong>
            <p>
              {certificate.instrument_type || "N/A"}
            </p>
          </div>

          <div>
            <strong>Manufacturer</strong>
            <p>
              {certificate.manufacturer || "N/A"}
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
              {certificate.serial_number || "N/A"}
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
              {formatDate(certificate.valid_until)}
            </p>
          </div>
        </div>

        <hr />

        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
          }}
        >
          <h3>Official Verification</h3>

          {certificate.qr_code ||
          certificate.qrCode ? (
            <img
              src={
                certificate.qr_code ||
                certificate.qrCode
              }
              alt="Certificate QR Code"
              style={{
                width: "220px",
                height: "220px",
                marginTop: "15px",
              }}
            />
          ) : (
            <p>QR code unavailable</p>
          )}

          <p style={{ marginTop: "15px" }}>
            Scan the QR code to verify this certificate.
          </p>

          {certificate.verification_code && (
            <p>
              <strong>Verification Code:</strong>{" "}
              {certificate.verification_code}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateDetails;