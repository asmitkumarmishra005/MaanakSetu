import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    instruments: 0,
    certificates: 0,
    expiring: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("maanaksetu_token");
    const savedUser = localStorage.getItem("maanaksetu_user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(savedUser);
    setUser(currentUser);

    loadDashboardData(currentUser.id, token);
  }, [navigate]);

  const loadDashboardData = async (userId, token) => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [instrumentsResponse, applicationsResponse, certificatesResponse] =
        await Promise.all([
          fetch(`${API_URL}/instruments/user/${userId}`, {
            headers,
          }),
          fetch(`${API_URL}/applications/user/${userId}`, {
            headers,
          }),
          fetch(`${API_URL}/certificates/user/${userId}`, {
            headers,
          }),
        ]);

      const instrumentsData = await instrumentsResponse.json();
      const applicationsData = await applicationsResponse.json();
      const certificatesData = await certificatesResponse.json();

      const instruments = instrumentsData.instruments || [];
      const applications = applicationsData.applications || [];
      const certificates = certificatesData.certificates || [];

      const pending = applications.filter(
        (application) =>
          application.status !== "verified" &&
          application.status !== "rejected"
      ).length;

      const today = new Date();

      const expiring = certificates.filter((certificate) => {
        if (!certificate.valid_until) return false;

        const expiryDate = new Date(certificate.valid_until);
        const difference =
          (expiryDate - today) / (1000 * 60 * 60 * 24);

        return difference >= 0 && difference <= 30;
      }).length;

      setStats({
        pending,
        instruments: instruments.length,
        certificates: certificates.length,
        expiring,
      });
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("maanaksetu_token");
    localStorage.removeItem("maanaksetu_user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-content">
          <h2>Loading Dashboard...</h2>
          <p>Fetching your MaanakSetu data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>MaanakSetu</h1>
          <p>Legal Metrology Verification Portal</p>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>
            Welcome, {user?.full_name || "User"} 👋
          </h2>

          <p>
            Manage your instruments, verification applications
            and digital certificates from one place.
          </p>
        </div>

        <section className="stats-grid">
          <div className="stat-card">
            <span>📋</span>
            <h3>{stats.pending}</h3>
            <p>Pending Applications</p>
          </div>

          <div className="stat-card">
            <span>⚖️</span>
            <h3>{stats.instruments}</h3>
            <p>Registered Instruments</p>
          </div>

          <div className="stat-card">
            <span>📜</span>
            <h3>{stats.certificates}</h3>
            <p>Certificates</p>
          </div>

          <div className="stat-card">
            <span>⏰</span>
            <h3>{stats.expiring}</h3>
            <p>Expiring Soon</p>
          </div>
        </section>

        <section className="actions-section">
          <h2>Quick Actions</h2>

          <div className="action-grid">
            <Link
              to="/register-instrument"
              className="action-card"
            >
              <div className="action-icon">⚖️</div>

              <div>
                <h3>Register Instrument</h3>
                <p>
                  Add a weighing or measuring instrument.
                </p>
              </div>

              <span>→</span>
            </Link>

            <Link
              to="/apply-verification"
              className="action-card"
            >
              <div className="action-icon">📝</div>

              <div>
                <h3>Apply for Verification</h3>
                <p>
                  Submit an instrument for verification.
                </p>
              </div>

              <span>→</span>
            </Link>

            <Link
              to="/applications"
              className="action-card"
            >
              <div className="action-icon">📊</div>

              <div>
                <h3>Track Applications</h3>
                <p>
                  Check your application status.
                </p>
              </div>

              <span>→</span>
            </Link>

            <Link
              to="/certificates"
              className="action-card"
            >
              <div className="action-icon">📜</div>

              <div>
                <h3>My Certificates</h3>
                <p>
                  View your digital certificates.
                </p>
              </div>

              <span>→</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;