import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem(
        "maanaksetu_token",
        data.token
      );

      localStorage.setItem(
        "maanaksetu_user",
        JSON.stringify(data.user)
      );

      setMessage("Login successful! 🎉");

      setTimeout(() => {
        if (data.user.role === "officer") {
          navigate("/officer-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 700);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">⚖</div>

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

        <div className="login-form-section">
          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Sign in to continue to your account
          </p>

          <form onSubmit={handleSubmit}>
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="login-options">
              <label className="login-remember">
                <input type="checkbox" />
                Remember me
              </label>

              <a
                href="#"
                className="login-forgot"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            {message && (
              <div
                style={{
                  marginBottom: "12px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: message.includes("successful")
                    ? "#e8f7ee"
                    : "#fdecec",
                  color: message.includes("successful")
                    ? "#16733c"
                    : "#b42318",
                  fontSize: "14px",
                }}
              >
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
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