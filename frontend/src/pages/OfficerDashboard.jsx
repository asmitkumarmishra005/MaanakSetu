import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./OfficerDashboard.css";

function OfficerDashboard() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setMessage("");

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

    if (
      user.role !== "officer" &&
      user.role !== "admin" &&
      user.role !== "gatc"
    ) {
      setMessage(
        "Access denied. Officer privileges are required."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/applications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
          data.message || "Failed to load applications"
        );
      }

      if (!Array.isArray(data.applications)) {
        throw new Error(
          "Invalid applications data received from server"
        );
      }

      setApplications(data.applications);
    } catch (error) {
      console.error("Officer dashboard error:", error);
      setMessage(
        error.message ||
          "Unable to load verification applications."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) =>
      application.status === "submitted" ||
      application.status === "pending" ||
      application.status === "under_review" ||
      application.status === "assigned" ||
      application.status === "inspection_scheduled" ||
      application.status === "pending_inspection"
  ).length;

  const completedApplications = applications.filter(
    (application) =>
      application.status === "inspection_completed"
  ).length;

  const verifiedApplications = applications.filter(
    (application) =>
      application.status === "verified"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("maanaksetu_token");
    localStorage.removeItem("maanaksetu_user");

    navigate("/login");
  };

  const formatStatus = (status) => {
    if (!status) {
      return "pending";
    }

    return status.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="officer-page">
        <div className="officer-container">
          <h2>Loading Officer Dashboard...</h2>
          <p>
            Fetching verification applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="officer-page">
      <header className="officer-header">
        <div>
          <h1>⚖ MaanakSetu</h1>
          <p>Officer Verification Portal</p>
        </div>

        <div className="officer-header-actions">
          <Link
            to="/inspection"
            className="inspection-link"
          >
            🔍 Inspection Portal
          </Link>

          <button
            className="officer-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="officer-container">
        <section className="officer-welcome">
          <div>
            <h2>Officer Dashboard</h2>

            <p>
              Review applications and complete official
              instrument inspections.
            </p>
          </div>

          <Link
            to="/inspection"
            className="start-inspection-btn"
          >
            Start Inspection →
          </Link>
        </section>

        {message && (
          <div className="officer-message">
            {message}
          </div>
        )}

        <section className="officer-stats">
          <div className="officer-stat-card">
            <span>📋</span>
            <strong>{totalApplications}</strong>
            <p>Total Applications</p>
          </div>

          <div className="officer-stat-card">
            <span>⏳</span>
            <strong>{pendingApplications}</strong>
            <p>Pending Inspection</p>
          </div>

          <div className="officer-stat-card">
            <span>🔍</span>
            <strong>{completedApplications}</strong>
            <p>Inspection Completed</p>
          </div>

          <div className="officer-stat-card">
            <span>✅</span>
            <strong>{verifiedApplications}</strong>
            <p>Verified</p>
          </div>
        </section>

        <section className="officer-applications">
          <div className="section-heading">
            <div>
              <h2>Verification Applications</h2>

              <p>
                Applications available for officer
                inspection.
              </p>
            </div>

            <button
              type="button"
              className="refresh-btn"
              onClick={loadApplications}
            >
              ↻ Refresh
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="empty-officer">
              <div>📋</div>

              <h3>No Applications Found</h3>

              <p>
                No verification applications have been
                submitted yet.
              </p>

              <p>
                Submit an application from a Business/User
                account first.
              </p>
            </div>
          ) : (
            <div className="officer-table-wrapper">
              <table className="officer-table">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Applicant</th>
                    <th>Instrument</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <strong>
                          {application.application_number ||
                            "Application N/A"}
                        </strong>

                        <small>
                          {application.verification_type ||
                            "Verification"}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {application.applicant_name ||
                            "Applicant"}
                        </strong>

                        <small>
                          {application.applicant_email ||
                            "Email N/A"}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {application.instrument_type ||
                            "Instrument N/A"}
                        </strong>

                        <small>
                          {application.manufacturer ||
                            "Manufacturer N/A"}
                        </small>

                        <small>
                          Serial:{" "}
                          {application.serial_number ||
                            "N/A"}
                        </small>
                      </td>

                      <td>
                        {application.inspection_location ||
                          application.location ||
                          "Not specified"}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${(
                            application.status ||
                            "pending"
                          ).replace(/_/g, "-")}`}
                        >
                          {formatStatus(
                            application.status
                          )}
                        </span>
                      </td>

                      <td>
                        {application.status ===
                        "inspection_completed" ? (
                          <span className="completed-label">
                            ✓ Completed
                          </span>
                        ) : application.status ===
                          "verified" ? (
                          <span className="completed-label">
                            ✓ Verified
                          </span>
                        ) : (
                          <Link
                            to={`/inspection?applicationId=${application.id}`}
                            className="inspect-btn"
                          >
                            Inspect →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default OfficerDashboard;