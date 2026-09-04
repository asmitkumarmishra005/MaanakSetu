import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./Certificates.css";

function Certificates() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    const token = localStorage.getItem("maanaksetu_token");
    const savedUser = localStorage.getItem("maanaksetu_user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("maanaksetu_token");
      localStorage.removeItem("maanaksetu_user");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/certificates/user/${user.id}`,
        {
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
          data.message ||
            "Failed to load certificates"
        );
      }

      setCertificates(data.certificates || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCertificateStatus = (certificate) => {
    if (certificate.status === "revoked") {
      return "Revoked";
    }

    if (!certificate.valid_until) {
      return "Valid";
    }

    const expiryDate = new Date(
      certificate.valid_until
    );

    if (expiryDate < new Date()) {
      return "Expired";
    }

    return "Valid";
  };

  const getStatusClass = (status) => {
    if (status === "Valid") {
      return "status-valid";
    }

    if (status === "Expired") {
      return "status-expired";
    }

    return "status-revoked";
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleView = (certificate) => {
    const verificationId =
      certificate.certificate_number ||
      certificate.id;

    window.open(
      `${window.location.origin}${window.location.pathname}#/certificates/${verificationId}`,
      "_blank"
    );
  };

  const handleVerify = (certificate) => {
    const verificationId =
      certificate.certificate_number ||
      certificate.id;

    window.open(
      `${window.location.origin}${window.location.pathname}#/verify/${verificationId}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="certificates-page">
        <div className="certificates-container">
          <h2>Loading Certificates...</h2>

          <p>
            Fetching your digital certificates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificates-page">
      <header className="certificates-header">
        <div>
          <h1>⚖ MaanakSetu</h1>

          <p>
            Digital Legal Metrology Certificates
          </p>
        </div>

        <Link
          to="/dashboard"
          className="certificates-back"
        >
          ← Dashboard
        </Link>
      </header>

      <main className="certificates-container">
        <div className="certificates-title">
          <div>
            <h2>My Certificates</h2>

            <p>
              View and verify certificates issued for
              your instruments.
            </p>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={loadCertificates}
          >
            ↻ Refresh
          </button>
        </div>

        {message && (
          <div className="certificates-message">
            {message}
          </div>
        )}

        <section className="certificate-summary">
          <div className="summary-card">
            <span>📜</span>

            <strong>
              {certificates.length}
            </strong>

            <p>Total Certificates</p>
          </div>

          <div className="summary-card">
            <span>✅</span>

            <strong>
              {
                certificates.filter(
                  (certificate) =>
                    getCertificateStatus(
                      certificate
                    ) === "Valid"
                ).length
              }
            </strong>

            <p>Valid</p>
          </div>

          <div className="summary-card">
            <span>⏰</span>

            <strong>
              {
                certificates.filter(
                  (certificate) =>
                    getCertificateStatus(
                      certificate
                    ) === "Expired"
                ).length
              }
            </strong>

            <p>Expired</p>
          </div>

          <div className="summary-card">
            <span>🚫</span>

            <strong>
              {
                certificates.filter(
                  (certificate) =>
                    getCertificateStatus(
                      certificate
                    ) === "Revoked"
                ).length
              }
            </strong>

            <p>Revoked</p>
          </div>
        </section>

        <section className="certificates-list-section">
          <div className="section-heading">
            <div>
              <h2>Certificate Records</h2>

              <p>
                Digitally issued verification
                certificates associated with your
                account.
              </p>
            </div>
          </div>

          {certificates.length === 0 ? (
            <div className="empty-certificates">
              <div>📜</div>

              <h3>No Certificates Yet</h3>

              <p>
                A certificate will appear here after
                an authorized officer completes a
                successful verification.
              </p>

              <Link
                to="/applications"
                className="view-applications-btn"
              >
                View Applications →
              </Link>
            </div>
          ) : (
            <div className="certificate-grid">
              {certificates.map(
                (certificate) => {
                  const status =
                    getCertificateStatus(
                      certificate
                    );

                  return (
                    <article
                      className="certificate-card"
                      key={certificate.id}
                    >
                      <div className="certificate-card-top">
                        <div className="certificate-icon">
                          📜
                        </div>

                        <span
                          className={`status-badge ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="certificate-number">
                        <span>
                          Certificate Number
                        </span>

                        <strong>
                          {
                            certificate.certificate_number
                          }
                        </strong>
                      </div>

                      <div className="certificate-details">
                        <div>
                          <span>Instrument</span>

                          <strong>
                            {
                              certificate.instrument_type ||
                              "Instrument"
                            }
                          </strong>
                        </div>

                        <div>
                          <span>Manufacturer</span>

                          <strong>
                            {
                              certificate.manufacturer ||
                              "N/A"
                            }
                          </strong>
                        </div>

                        <div>
                          <span>Model</span>

                          <strong>
                            {
                              certificate.model ||
                              "N/A"
                            }
                          </strong>
                        </div>

                        <div>
                          <span>Serial Number</span>

                          <strong>
                            {
                              certificate.serial_number ||
                              "N/A"
                            }
                          </strong>
                        </div>

                        <div>
                          <span>Issued On</span>

                          <strong>
                            {formatDate(
                              certificate.issued_at ||
                                certificate.issued_on
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Valid Until</span>

                          <strong>
                            {formatDate(
                              certificate.valid_until
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="certificate-actions">
                        <button
                          type="button"
                          onClick={() =>
                            handleView(
                              certificate
                            )
                          }
                        >
                          👁 View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleVerify(
                              certificate
                            )
                          }
                        >
                          🔍 Verify
                        </button>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Certificates;