
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";
import "./Inspection.css";

function Inspection() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    observations: "",
    measuredValues: "",
    remarks: "",
    result: "pass",
  });

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
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
        "Only authorized officers can access inspections."
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

      const applicationList = Array.isArray(
        data.applications
      )
        ? data.applications
        : [];

      setApplications(applicationList);

      const hash = window.location.hash;
      const questionMarkIndex = hash.indexOf("?");

      if (questionMarkIndex !== -1) {
        const queryString = hash.substring(
          questionMarkIndex + 1
        );

        const params = new URLSearchParams(queryString);
        const applicationId =
          params.get("applicationId");

        if (applicationId) {
          const foundApplication =
            applicationList.find(
              (application) =>
                String(application.id) ===
                String(applicationId)
            );

          if (foundApplication) {
            setSelectedApplication(
              foundApplication
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "Applications loading error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function selectApplication(application) {
    setSelectedApplication(application);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedApplication) {
      setMessage(
        "Please select an application first."
      );
      return;
    }

    const token = localStorage.getItem(
      "maanaksetu_token"
    );

    const savedUser = localStorage.getItem(
      "maanaksetu_user"
    );

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      localStorage.removeItem(
        "maanaksetu_token"
      );
      localStorage.removeItem(
        "maanaksetu_user"
      );
      navigate("/login");
      return;
    }

    if (
      user.role !== "officer" &&
      user.role !== "admin" &&
      user.role !== "gatc"
    ) {
      setMessage(
        "You are not authorized to submit inspections."
      );
      return;
    }

    // Parse measured values
    let measuredValues = {};

    if (formData.measuredValues.trim() !== "") {
      try {
        measuredValues = JSON.parse(
          formData.measuredValues
        );
      } catch {
        setMessage(
          'Measured Values must be valid JSON. Example: {"error":"0.02 kg","capacity":"30 kg","accuracy":"Within permissible limit"}'
        );
        return;
      }
    }

    setSubmitting(true);
    setMessage("");

    try {
      // =====================================================
      // STEP 1 — SUBMIT INSPECTION
      // =====================================================

      const inspectionResponse = await fetch(
        `${API_URL}/inspections`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            applicationId:
              selectedApplication.id,

            officerId: user.id,

            inspectionDate:
              new Date().toISOString(),

            observations:
              formData.observations,

            measuredValues,

            remarks: formData.remarks,

            result: formData.result,
          }),
        }
      );

      const inspectionData =
        await inspectionResponse.json();

      if (inspectionResponse.status === 401) {
        localStorage.removeItem(
          "maanaksetu_token"
        );
        localStorage.removeItem(
          "maanaksetu_user"
        );

        navigate("/login");
        return;
      }

      if (!inspectionResponse.ok) {
        throw new Error(
          inspectionData.message ||
            "Inspection submission failed"
        );
      }

      // Get the newly-created inspection ID
      const inspectionId =
        inspectionData?.inspection?.id ||
        inspectionData?.inspectionId ||
        inspectionData?.id;

      if (!inspectionId) {
        throw new Error(
          "Inspection was saved, but the server did not return an inspection ID."
        );
      }

      // =====================================================
      // STEP 2 — AUTOMATIC CERTIFICATE GENERATION
      // =====================================================

      if (
        formData.result.toLowerCase() === "pass"
      ) {
        const certificateResponse =
          await fetch(
            `${API_URL}/certificates/generate/${inspectionId}`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },
            }
          );

        const certificateData =
          await certificateResponse.json();

        if (certificateResponse.status === 401) {
          localStorage.removeItem(
            "maanaksetu_token"
          );
          localStorage.removeItem(
            "maanaksetu_user"
          );

          navigate("/login");
          return;
        }

        if (!certificateResponse.ok) {
          throw new Error(
            certificateData.message ||
              "Inspection completed, but certificate generation failed."
          );
        }

        const certificate =
          certificateData?.certificate;

        const certificateNumber =
          certificate?.certificate_number ||
          "Generated successfully";

        const verificationUrl =
          certificateData?.verificationUrl || "";

        // Update application status in UI
        setApplications((previous) =>
          previous.map((application) =>
            application.id ===
            selectedApplication.id
              ? {
                  ...application,
                  status: "verified",
                }
              : application
          )
        );

        setMessage(
          `✅ Inspection passed and certificate generated successfully! Certificate: ${certificateNumber}`
        );

        // Useful for debugging
        console.log(
          "Certificate generated successfully:",
          certificateData
        );

        if (verificationUrl) {
          console.log(
            "Certificate verification URL:",
            verificationUrl
          );
        }
      } else {
        // =====================================================
        // FAIL — DO NOT GENERATE CERTIFICATE
        // =====================================================

        setApplications((previous) =>
          previous.map((application) =>
            application.id ===
            selectedApplication.id
              ? {
                  ...application,
                  status:
                    "inspection_completed",
                }
              : application
          )
        );

        setMessage(
          "❌ Inspection completed successfully. Result: FAIL"
        );
      }

      // =====================================================
      // STEP 3 — RESET FORM
      // =====================================================

      setSelectedApplication(null);

      setFormData({
        observations: "",
        measuredValues: "",
        remarks: "",
        result: "pass",
      });
    } catch (error) {
      console.error(
        "Inspection/certificate submission error:",
        error
      );

      setMessage(
        error.message ||
          "Inspection submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getLocation(application) {
    return (
      application.inspection_location ||
      application.location ||
      "Not specified"
    );
  }

  function formatStatus(status) {
    if (!status) {
      return "pending";
    }

    return status.replace(/_/g, " ");
  }

  if (loading) {
    return (
      <div className="inspection-page">
        <div className="inspection-container">
          <h2>Loading Applications...</h2>

          <p>
            Fetching verification applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="inspection-page">
      <header className="inspection-header">
        <div>
          <h1>⚖ MaanakSetu</h1>

          <p>
            Officer Inspection Portal
          </p>
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
              Verify the instrument and record
              official inspection results.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={
              message.includes("successfully") ||
              message.includes("generated") ||
              message.includes("Certificate:")
                ? "inspection-message success"
                : "inspection-message error"
            }
          >
            {message}
          </div>
        )}

        {/* =====================================================
            1. SELECT APPLICATION
        ===================================================== */}

        <section className="inspection-section">
          <h3>1. Select Application</h3>

          {applications.length === 0 ? (
            <div className="empty-inspection">
              <h3>
                No Verification Applications Found
              </h3>

              <p>
                Submit a verification application
                from a Business/User account first.
              </p>
            </div>
          ) : (
            <div className="application-list">
              {applications.map(
                (application) => (
                  <button
                    type="button"
                    key={application.id}
                    className={
                      selectedApplication &&
                      selectedApplication.id ===
                        application.id
                        ? "application-item selected"
                        : "application-item"
                    }
                    onClick={() =>
                      selectApplication(
                        application
                      )
                    }
                  >
                    <div>
                      <strong>
                        {
                          application.application_number
                        }
                      </strong>

                      <p>
                        {application.instrument_type ||
                          "Instrument"}
                      </p>

                      <small>
                        Applicant:{" "}
                        {application.applicant_name ||
                          "Applicant"}
                      </small>

                      <small>
                        Serial:{" "}
                        {application.serial_number ||
                          "N/A"}
                      </small>

                      <small>
                        {getLocation(
                          application
                        )}
                      </small>
                    </div>

                    <span>
                      {formatStatus(
                        application.status
                      )}
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            2. APPLICATION DETAILS
        ===================================================== */}

        {selectedApplication && (
          <section className="inspection-section">
            <h3>2. Application Details</h3>

            <div className="application-details">
              <div>
                <span>
                  Application Number
                </span>

                <strong>
                  {
                    selectedApplication.application_number
                  }
                </strong>
              </div>

              <div>
                <span>Applicant</span>

                <strong>
                  {selectedApplication.applicant_name ||
                    "N/A"}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {
                    selectedApplication.applicant_email ||
                    "N/A"
                  }
                </strong>
              </div>

              <div>
                <span>Instrument</span>

                <strong>
                  {
                    selectedApplication.instrument_type ||
                    "N/A"
                  }
                </strong>
              </div>

              <div>
                <span>Manufacturer</span>

                <strong>
                  {
                    selectedApplication.manufacturer ||
                    "N/A"
                  }
                </strong>
              </div>

              <div>
                <span>Model Number</span>

                <strong>
                  {
                    selectedApplication.model_number ||
                    "N/A"
                  }
                </strong>
              </div>

              <div>
                <span>Serial Number</span>

                <strong>
                  {
                    selectedApplication.serial_number ||
                    "N/A"
                  }
                </strong>
              </div>

              <div>
                <span>
                  Verification Type
                </span>

                <strong>
                  {
                    selectedApplication.verification_type ||
                    "N/A"
                  }
                </strong>
              </div>

              <div>
                <span>Location</span>

                <strong>
                  {getLocation(
                    selectedApplication
                  )}
                </strong>
              </div>

              <div>
                <span>Preferred Date</span>

                <strong>
                  {
                    selectedApplication.preferred_date ||
                    "N/A"
                  }
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* =====================================================
            3. INSPECTION FORM
        ===================================================== */}

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

              <small>
                Enter measured values as valid
                JSON.
              </small>
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
                ? "Submitting & Generating Certificate..."
                : "Submit Official Inspection →"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default Inspection;

