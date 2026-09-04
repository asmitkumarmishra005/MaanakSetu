import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
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
        "http://localhost:5000/api/auth/register",
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
        throw new Error(
          data.message || "Registration failed"
        );
      }

      localStorage.setItem("maanaksetu_token", data.token);
      localStorage.setItem(
        "maanaksetu_user",
        JSON.stringify(data.user)
      );

      setMessage("Account created successfully! 🎉");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
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

        <div className="auth-form-section">
          <h2>Create Account</h2>

          <p className="form-subtitle">
            Register to access MaanakSetu
          </p>

          <form onSubmit={handleSubmit}>
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />

            <label>Account Type</label>

            <select
              className="account-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">
                Business / User
              </option>

              <option value="officer">
                LMO Officer
              </option>
            </select>

            {message && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  borderRadius: "8px",
                  background:
                    message.includes("successfully")
                      ? "#e8f7ee"
                      : "#fdecec",
                  color:
                    message.includes("successfully")
                      ? "#16733c"
                      : "#b42318",
                  fontSize: "14px",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
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