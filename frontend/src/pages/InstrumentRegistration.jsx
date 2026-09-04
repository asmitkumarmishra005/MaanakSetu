import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InstrumentRegistration.css";

function InstrumentRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    instrumentType: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    capacity: "",
    yearOfManufacture: "",
    location: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("maanaksetu_token");
    const savedUser = localStorage.getItem("maanaksetu_user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(savedUser);

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/instruments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            instrumentType: formData.instrumentType,
            manufacturer: formData.manufacturer,
            model: formData.model,
            serialNumber: formData.serialNumber,
            capacity: formData.capacity,
            yearOfManufacture: formData.yearOfManufacture,
            location: formData.location,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Instrument registration failed"
        );
      }

      setMessage("Instrument registered successfully! 🎉");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="instrument-page">
      <div className="instrument-card">
        <div className="instrument-header">
          <Link to="/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>

          <div className="instrument-icon">⚖️</div>

          <h1>Register Instrument</h1>

          <p>
            Register your weighing or measuring instrument
            with MaanakSetu.
          </p>
        </div>

        <form
          className="instrument-form"
          onSubmit={handleSubmit}
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Instrument Type</label>

              <select
                name="instrumentType"
                value={formData.instrumentType}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select instrument type
                </option>
                <option value="Electronic Weighing Scale">
                  Electronic Weighing Scale
                </option>
                <option value="Platform Scale">
                  Platform Scale
                </option>
                <option value="Electronic Balance">
                  Electronic Balance
                </option>
                <option value="Retail Weighing Scale">
                  Retail Weighing Scale
                </option>
                <option value="Measuring Instrument">
                  Measuring Instrument
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>Manufacturer</label>

              <input
                type="text"
                name="manufacturer"
                placeholder="e.g. Essae"
                value={formData.manufacturer}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Model Number</label>

              <input
                type="text"
                name="model"
                placeholder="Enter model number"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Serial Number</label>

              <input
                type="text"
                name="serialNumber"
                placeholder="Enter unique serial number"
                value={formData.serialNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity / Range</label>

              <input
                type="text"
                name="capacity"
                placeholder="e.g. 30 kg"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Year of Manufacture</label>

              <input
                type="number"
                name="yearOfManufacture"
                placeholder="e.g. 2026"
                min="1900"
                max="2100"
                value={formData.yearOfManufacture}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Instrument Location</label>

            <input
              type="text"
              name="location"
              placeholder="Enter installation/location address"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          {message && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "8px",
                background: message.includes("successfully")
                  ? "#e8f7ee"
                  : "#fdecec",
                color: message.includes("successfully")
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
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register Instrument →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default InstrumentRegistration;