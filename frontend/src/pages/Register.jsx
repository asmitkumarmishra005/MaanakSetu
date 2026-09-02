import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* Left branding section */}
        <div className="auth-brand">
          <div className="brand-icon">⚖</div>

          <h1>MaanakSetu</h1>

          <p>
            Digital Legal Metrology
            Verification & Certification
          </p>

          <div className="brand-info">
            <div>✓ Secure Digital Verification</div>
            <div>✓ QR-Based Certificates</div>
            <div>✓ Transparent Tracking</div>
          </div>
        </div>

        {/* Right registration section */}
        <div className="auth-form-section">

          <h2>Create Account</h2>

          <p className="form-subtitle">
            Register to access MaanakSetu
          </p>

          <form>

            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
            />

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
            />

            <label>Phone Number</label>

            <input
              type="tel"
              placeholder="Enter your phone number"
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
            />

            <label>Account Type</label>

            <select className="account-select">
              <option value="business">
                Business / User
              </option>

              <option value="officer">
                LMO Officer
              </option>
            </select>

            <button type="submit">
              Create Account
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">
              Sign In
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;