import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./ApplyVerification.css";

function ApplyVerification() {
  const navigate = useNavigate();

  const [instruments, setInstruments] = useState([]);

  const [formData, setFormData] = useState({
    instrumentId: "",
    verificationType: "periodic",
    preferredDate: "",
    location: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = async () => {
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
        `${API_URL}/instruments/user/${user.id}`,
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
          data.message || "Unable to load instruments"
        );
      }

      setInstruments(data.instruments || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            instrumentId: formData.instrumentId,
            verificationType: formData.verificationType,
            preferredDate: formData.preferredDate,
            location: formData.location,
            remarks: formData.remarks,
          }),
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
            "Application submission failed"
        );
      }

      setMessage(
        `Application submitted successfully! Application ID: ${
          data.application?.application_number ||
          data.applicationNumber ||
          "Generated"
        }`
      );

      setTimeout(() => {
        navigate("/applications");
      }, 1500);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="apply-page">
        <div className="apply-card">
          <h2>Loading Instruments...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-card">
        <div className="apply-header">
          <Link
            to="/dashboard"
            className="back-link"
          >
            ← Back to Dashboard
          </Link>

          <div className="apply-icon">📝</div>

          <h1>Apply for Verification</h1>

          <p>
            Submit your registered instrument for legal
            metrology verification.
          </p>
        </div>

        {instruments.length === 0 ? (
          <div className="empty-state">
            <h2>No Instruments Registered</h2>

            <p>
              You need to register an instrument before
              applying for verification.
            </p>

            <Link
              to="/register-instrument"
              className="submit-btn"
            >
              Register Instrument →
            </Link>
          </div>
        ) : (
          <form
            className="apply-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label>Select Instrument</label>

              <select
                name="instrumentId"
                value={formData.instrumentId}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select your instrument
                </option>

                {instruments.map((instrument) => (
                  <option
                    key={instrument.id}
                    value={instrument.id}
                  >
                    {instrument.type} —{" "}
                    {instrument.serial_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Verification Type</label>

              <select
                name="verificationType"
                value={formData.verificationType}
                onChange={handleChange}
                required
              >
                <option value="initial">
                  Initial Verification
                </option>

                <option value="periodic">
                  Periodic Verification
                </option>

                <option value="reverification">
                  Re-verification
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Preferred Verification Date
              </label>

              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Inspection Location</label>

              <input
                type="text"
                name="location"
                placeholder="Enter inspection location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Additional Remarks</label>

              <textarea
                name="remarks"
                placeholder="Enter any additional information"
                value={formData.remarks}
                onChange={handleChange}
                rows="4"
              />
            </div>

            {message && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  borderRadius: "8px",
                  background:
                    message.includes("successfully")
                      ? "#e8f7ee"
                      : "#fdecec",
                  color:
                    message.includes("successfully")
                      ? "#16733c"
                      : "#b42318",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting
                ? "Submitting Application..."
                : "Submit Verification Application →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ApplyVerification;