import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./Applications.css";

function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
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
        `${API_URL}/applications/user/${user.id}`,
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
            "Failed to load applications"
        );
      }

      setApplications(data.applications || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "verified":
        return "status-verified";

      case "rejected":
      case "failed":
        return "status-rejected";

      case "inspection_completed":
        return "status-completed";

      case "under_review":
      case "assigned":
      case "pending_inspection":
        return "status-review";

      default:
        return "status-pending";
    }
  };

  const total = applications.length;

  const pending = applications.filter(
    (application) =>
      application.status !== "verified" &&
      application.status !== "rejected"
  ).length;

  const verified = applications.filter(
    (application) =>
      application.status === "verified"
  ).length;

  const rejected = applications.filter(
    (application) =>
      application.status === "rejected" ||
      application.status === "failed"
  ).length;

  if (loading) {
    return (
      <div className="applications-page">
        <div className="applications-container">
          <h2>Loading Applications...</h2>
          <p>
            Fetching your verification applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <header className="applications-header">
        <div>
          <h1>⚖ MaanakSetu</h1>
          <p>
            Legal Metrology Verification Portal
          </p>
        </div>

        <Link
          to="/dashboard"
          className="applications-back"
        >
          ← Dashboard
        </Link>
      </header>

      <main className="applications-container">
        <div className="applications-title">
          <div>
            <h2>My Applications</h2>

            <p>
              Track the status of your instrument
              verification applications.
            </p>
          </div>

          <div className="application-actions">
            <button
              type="button"
              className="refresh-btn"
              onClick={loadApplications}
            >
              ↻ Refresh
            </button>

            <Link
              to="/apply-verification"
              className="new-application-btn"
            >
              + New Application
            </Link>
          </div>
        </div>

        {message && (
          <div className="applications-message">
            {message}
          </div>
        )}

        <section className="application-summary">
          <div className="summary-card">
            <span>📋</span>
            <strong>{total}</strong>
            <p>Total Applications</p>
          </div>

          <div className="summary-card">
            <span>⏳</span>
            <strong>{pending}</strong>
            <p>In Progress</p>
          </div>

          <div className="summary-card">
            <span>✅</span>
            <strong>{verified}</strong>
            <p>Verified</p>
          </div>

          <div className="summary-card">
            <span>❌</span>
            <strong>{rejected}</strong>
            <p>Rejected</p>
          </div>
        </section>

        <section className="applications-list-section">
          <div className="section-heading">
            <div>
              <h2>Application History</h2>

              <p>
                All applications submitted from your
                account.
              </p>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="empty-applications">
              <div>📋</div>

              <h3>No Applications Yet</h3>

              <p>
                You haven't submitted a verification
                application yet.
              </p>

              <Link
                to="/apply-verification"
                className="new-application-btn"
              >
                Apply for Verification →
              </Link>
            </div>
          ) : (
            <div className="applications-table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Instrument</th>
                    <th>Verification Type</th>
                    <th>Preferred Date</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map(
                    (application) => (
                      <tr key={application.id}>
                        <td>
                          <strong>
                            {
                              application.application_number
                            }
                          </strong>

                          <small>
                            {application.created_at
                              ? new Date(
                                  application.created_at
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "Date unavailable"}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {
                              application.instrument_type ||
                              "Instrument"
                            }
                          </strong>

                          <small>
                            Serial:{" "}
                            {application.serial_number ||
                              "N/A"}
                          </small>
                        </td>

                        <td>
                          {getStatusLabel(
                            application.verification_type
                          )}
                        </td>

                        <td>
                          {application.preferred_date
                            ? new Date(
                                application.preferred_date
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "Not specified"}
                        </td>

                        <td>
                          {application.location ||
                            "Not specified"}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(
                              application.status
                            )}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Applications;