import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  return (
    <div className="login-page">

      <div className="login-card">

        {/* Left branding */}
        <div className="login-brand">

          <div className="login-brand-icon">
            ⚖
          </div>

          <h1>MaanakSetu</h1>

          <p>
            Digital Legal Metrology
            Verification & Certification
          </p>

          <div className="login-brand-info">
            <div>✓ Secure Digital Verification</div>
            <div>✓ QR-Based Certificates</div>
            <div>✓ Transparent Tracking</div>
          </div>

        </div>

        {/* Login form */}
        <div className="login-form-section">

          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Sign in to continue to your account
          </p>

          <form>

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
            />

            <div className="login-options">

              <label className="login-remember">
                <input type="checkbox" />
                Remember me
              </label>

              <a href="#" className="login-forgot">
                Forgot password?
              </a>

            </div>

            <button type="submit">
              Sign In
            </button>

          </form>

          <p className="login-switch">
            Don't have an account?{" "}
            <Link to="/register">
              Create Account
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;