import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Inspection.css";

function Inspection() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [formData, setFormData] = useState({
    observations: "",
    measuredValues: "",
    remarks: "",
    result: "pass",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/applications"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load applications"
        );
      }

      setApplications(data.applications || []);
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

  const selectApplication = (application) => {
    setSelectedApplication(application);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedApplication) {
      setMessage("Please select an application first.");
      return;
    }

    const token = localStorage.getItem("maanaksetu_token");
    const savedUser = localStorage.getItem("maanaksetu_user");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(savedUser);

    if (
      user.role !== "officer" &&
      user.role !== "admin" &&
      user.role !== "gatc"
    ) {
      setMessage(
        "Only an authorized officer can submit an inspection."
      );
      return;
    }

    setSubmitting(true);
    setMessage("");

    let measuredValues = {};

    if (formData.measuredValues.trim()) {
      try {
        measuredValues = JSON.parse(
          formData.measuredValues
        );
      } catch {
        setMessage(
          'Measured Values must be valid JSON. Example: {"error":"0.02","capacity":"30 kg"}'
        );
        setSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/inspections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            applicationId: selectedApplication.id,
            officerId: user.id,
            inspectionDate: new Date()
              .toISOString()
              .split("T")[0],
            observations: formData.observations,
            measuredValues,
            remarks: formData.remarks,
            result: formData.result,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Inspection submission failed"
        );
      }

      setMessage(
        `Inspection completed successfully! Result: ${formData.result.toUpperCase()}`
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === selectedApplication.id
            ? {
                ...application,
                status: "inspection_completed",
              }
            : application
        )
      );

      setSelectedApplication(null);

      setFormData({
        observations: "",
        measuredValues: "",
        remarks: "",
        result: "pass",
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="inspection-page">
        <div className="inspection-container">
          <h2>Loading Applications...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="inspection-page">
      <header className="inspection-header">
        <div>
          <h1>⚖ MaanakSetu</h1>
          <p>Officer Inspection Portal</p>
        </div>

        <Link
          to="/officer-dashboard"
          className="inspection-back"
        >
          ← Officer Dashboard
        </Link>
      </header>

      <main className="inspection-container">
        <div className="inspection-title">
          <span>🔍</span>
          <div>
            <h2>Instrument Inspection</h2>
            <p>
              Verify the instrument and record official
              inspection results.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={
              message.includes("successfully")
                ? "inspection-message success"
                : "inspection-message error"
            }
          >
            {message}
          </div>
        )}

        <section className="inspection-section">
          <h3>1. Select Application</h3>

          {applications.length === 0 ? (
            <div className="empty-inspection">
              No verification applications found.
            </div>
          ) : (
            <div className="application-list">
              {applications.map((application) => (
                <button
                  type="button"
                  key={application.id}
                  className={`application-item ${
                    selectedApplication?.id ===
                    application.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    selectApplication(application)
                  }
                >
                  <div>
                    <strong>
                      {application.application_number}
                    </strong>

                    <p>
                      {application.instrument_type ||
                        "Instrument"}
                    </p>

                    <small>
                      {application.location || "Location not specified"}
                    </small>
                  </div>

                  <span>
                    {application.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedApplication && (
          <section className="inspection-section">
            <h3>2. Application Details</h3>

            <div className="application-details">
              <div>
                <span>Application Number</span>
                <strong>
                  {selectedApplication.application_number}
                </strong>
              </div>

              <div>
                <span>Instrument</span>
                <strong>
                  {selectedApplication.instrument_type ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>Verification Type</span>
                <strong>
                  {selectedApplication.verification_type ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {selectedApplication.location ||
                    "N/A"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {selectedApplication && (
          <form
            className="inspection-section inspection-form"
            onSubmit={handleSubmit}
          >
            <h3>3. Inspection Results</h3>

            <label>
              Observations
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                placeholder="Enter physical inspection observations..."
                rows="5"
                required
              />
            </label>

            <label>
              Measured Values
              <textarea
                name="measuredValues"
                value={formData.measuredValues}
                onChange={handleChange}
                placeholder='Example: {"error":"0.02 kg","capacity":"30 kg","accuracy":"Within permissible limit"}'
                rows="5"
              />
            </label>

            <label>
              Officer Remarks
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter final inspection remarks..."
                rows="4"
              />
            </label>

            <label>
              Inspection Result

              <select
                name="result"
                value={formData.result}
                onChange={handleChange}
              >
                <option value="pass">
                  PASS — Instrument Verified
                </option>

                <option value="fail">
                  FAIL — Instrument Not Verified
                </option>
              </select>
            </label>

            <button
              type="submit"
              className="inspection-submit"
              disabled={submitting}
            >
              {submitting
                ? "Submitting Inspection..."
                : "Submit Official Inspection →"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default Inspection;