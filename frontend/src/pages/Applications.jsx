import { Link } from "react-router-dom";
import "./Applications.css";

function Applications() {
  const applications = [
    {
      id: "MS-2026-0001",
      instrument: "Electronic Weighing Scale",
      serial: "EWS-458921",
      date: "02 Sep 2026",
      status: "Under Review",
    },
    {
      id: "MS-2026-0002",
      instrument: "Platform Scale",
      serial: "PS-782341",
      date: "28 Aug 2026",
      status: "Verified",
    },
  ];

  return (
    <div className="applications-page">

      <div className="applications-container">

        <Link to="/dashboard" className="applications-back">
          ← Dashboard
        </Link>

        <div className="applications-heading">
          <div>
            <h1>My Applications</h1>
            <p>
              Track your Legal Metrology verification applications.
            </p>
          </div>

          <Link
            to="/apply-verification"
            className="new-application-btn"
          >
            + New Application
          </Link>
        </div>

        <div className="applications-summary">

          <div>
            <span>📋</span>
            <strong>2</strong>
            <p>Total Applications</p>
          </div>

          <div>
            <span>⏳</span>
            <strong>1</strong>
            <p>Under Review</p>
          </div>

          <div>
            <span>✓</span>
            <strong>1</strong>
            <p>Verified</p>
          </div>

          <div>
            <span>✕</span>
            <strong>0</strong>
            <p>Rejected</p>
          </div>

        </div>

        <div className="applications-card">

          <h2>Application History</h2>

          {applications.map((application) => (

            <div
              className="application-item"
              key={application.id}
            >

              <div className="application-icon">
                ⚖️
              </div>

              <div className="application-info">

                <h3>{application.instrument}</h3>

                <p>
                  Application ID: <strong>{application.id}</strong>
                </p>

                <p>
                  Serial Number: {application.serial}
                </p>

                <p>
                  Submitted: {application.date}
                </p>

              </div>

              <div className="application-status">

                <span
                  className={
                    application.status === "Verified"
                      ? "status verified"
                      : "status review"
                  }
                >
                  {application.status}
                </span>

                <button>
                  View Details
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Applications;