import { HashRouter, Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InstrumentRegistration from "./pages/InstrumentRegistration";
import ApplyVerification from "./pages/ApplyVerification";
import Applications from "./pages/Applications";
import Certificates from "./pages/Certificates";
import OfficerDashboard from "./pages/OfficerDashboard";
import Inspection from "./pages/Inspection";

function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-logo">
          ⚖ MaanakSetu
        </div>

        <div className="home-nav">
          <Link to="/login">Sign In</Link>
          <Link to="/register">Register</Link>
        </div>
      </header>

      <main className="home-content">
        <section className="hero-section">
          <div className="hero-badge">
            ⚖ Digital Legal Metrology Platform
          </div>

          <h1>
            Making Instrument
            <br />
            Verification <span>Simple & Transparent</span>
          </h1>

          <p>
            MaanakSetu digitizes the complete legal metrology
            verification and certification process — from
            application to inspection and digital certificates.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="primary-btn">
              Sign In →
            </Link>

            <Link to="/register" className="secondary-btn">
              Create Account
            </Link>
          </div>
        </section>

        <section className="features-section">
          <div className="feature-card">
            <div>⚖️</div>
            <h3>Instrument Registration</h3>
            <p>
              Register weighing and measuring instruments
              digitally.
            </p>
          </div>

          <div className="feature-card">
            <div>📝</div>
            <h3>Online Applications</h3>
            <p>
              Submit and track verification applications
              online.
            </p>
          </div>

          <div className="feature-card">
            <div>🔍</div>
            <h3>Officer Inspection</h3>
            <p>
              Record physical inspection results digitally.
            </p>
          </div>

          <div className="feature-card">
            <div>📜</div>
            <h3>Digital Certificates</h3>
            <p>
              Generate secure certificates with QR
              verification.
            </p>
          </div>
        </section>

        <section className="portal-section">
          <h2>Access Portal</h2>

          <div className="portal-buttons">
            <Link to="/dashboard">
              👤 User Dashboard
            </Link>

            <Link to="/officer-dashboard">
              🔍 Officer Portal
            </Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>
          © 2026 MaanakSetu — Digital Legal Metrology
          Verification Platform
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/register-instrument"
          element={<InstrumentRegistration />}
        />

        <Route
          path="/apply-verification"
          element={<ApplyVerification />}
        />

        <Route
          path="/applications"
          element={<Applications />}
        />

        <Route
          path="/certificates"
          element={<Certificates />}
        />

        <Route
          path="/officer-dashboard"
          element={<OfficerDashboard />}
        />

        <Route
          path="/inspection"
          element={<Inspection />}
        />

        <Route
          path="*"
          element={<Home />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;