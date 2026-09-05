
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
      JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("maanaksetu_token");
      localStorage.removeItem("maanaksetu_user");
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

      const loadedCertificate =
        data.certificate || data;

      setCertificate(loadedCertificate);
    } catch (error) {
      console.error(
        "Certificate loading error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load certificate."
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

  const getVerificationCode = () => {
    return (
      certificate?.verification_code ||
      certificate?.verificationCode ||
      certificate?.verification_code_value ||
      ""
    );
  };

  const getVerificationUrl = () => {
    const verificationCode =
      getVerificationCode();

    if (!verificationCode) {
      return "";
    }

    return `${window.location.origin}${window.location.pathname}#/verify/${encodeURIComponent(
      verificationCode
    )}`;
  };

  /*
   * If the backend already returns qrCode, use it.
   * Otherwise generate a QR image from the verification URL.
   */
  const getQrSource = () => {
    if (
      certificate?.qrCode
    ) {
      return certificate.qrCode;
    }

    if (
      certificate?.qr_code
    ) {
      return certificate.qr_code;
    }

    const verificationUrl =
      getVerificationUrl();

    if (!verificationUrl) {
      return "";
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      verificationUrl
    )}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleVerify = () => {
    const verificationUrl =
      getVerificationUrl();

    if (!verificationUrl) {
      setMessage(
        "Verification code is unavailable."
      );
      return;
    }

    window.open(
      verificationUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Loading Certificate...</h2>
          <p>
            Fetching your digital certificate.
          </p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px",
          textAlign: "center",
          background: "#f4f7fb",
        }}
      >
        <h2>Certificate Not Found</h2>

        <p>
          {message ||
            "The requested certificate could not be found."}
        </p>

        <Link to="/certificates">
          ← Back to Certificates
        </Link>
      </div>
    );
  }

  const qrSource = getQrSource();
  const verificationCode =
    getVerificationCode();

  const status =
    certificate.status === "revoked"
      ? "REVOKED"
      : certificate.valid_until &&
        new Date(certificate.valid_until) <
          new Date()
      ? "EXPIRED"
      : "VALID";

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
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        {/* Top navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/certificates">
            ← My Certificates
          </Link>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {verificationCode && (
              <button
                type="button"
                onClick={handleVerify}
              >
                🔍 Verify Online
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
            >
              🖨 Print Certificate
            </button>
          </div>
        </div>

        {/* Header */}
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "46px",
            }}
          >
            ⚖
          </div>

          <h1>MaanakSetu</h1>

          <h2>
            Digital Verification Certificate
          </h2>

          <p>
            Legal Metrology Verification &
            Certification
          </p>
        </div>

        <hr />

        {/* Certificate number and status */}
        <div
          style={{
            margin: "25px 0",
            textAlign: "center",
          }}
        >
          <p>Certificate Number</p>

          <h2>
            {certificate.certificate_number ||
              "N/A"}
          </h2>

          <strong
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "8px 18px",
              borderRadius: "20px",
              background:
                status === "VALID"
                  ? "#e8f7ee"
                  : "#fdecec",
              color:
                status === "VALID"
                  ? "#16733c"
                  : "#b42318",
            }}
          >
            {status}
          </strong>
        </div>

        {/* Certificate details */}
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
        </div>

        <hr
          style={{
            margin: "35px 0",
          }}
        />

        {/* QR verification */}
        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
          }}
        >
          <h3>
            Official Verification
          </h3>

          {qrSource ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <div
                style={{
                  padding: "14px",
                  background: "#ffffff",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  display: "inline-block",
                }}
              >
                <img
                  src={qrSource}
                  alt="Certificate Verification QR Code"
                  width="240"
                  height="240"
                  style={{
                    display: "block",
                  }}
                />
              </div>

              <p
                style={{
                  marginTop: "18px",
                  fontWeight: "600",
                }}
              >
                Scan the QR code to verify
                this certificate.
              </p>

              {verificationCode && (
                <p>
                  <strong>
                    Verification Code:
                  </strong>{" "}
                  {verificationCode}
                </p>
              )}

              {getVerificationUrl() && (
                <p
                  style={{
                    fontSize: "13px",
                    wordBreak: "break-all",
                    color: "#666",
                    maxWidth: "700px",
                  }}
                >
                  {getVerificationUrl()}
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                padding: "20px",
                borderRadius: "10px",
                background: "#fff7e6",
                color: "#8a5a00",
                marginTop: "20px",
              }}
            >
              <p>
                QR code unavailable because
                the certificate has no verification
                code.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            paddingTop: "20px",
            borderTop: "1px solid #ddd",
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
          }}
        >
          <p>
            This certificate is digitally issued
            through MaanakSetu.
          </p>

          <p>
            Verification should be performed using
            the QR code or verification code above.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CertificateDetails;

