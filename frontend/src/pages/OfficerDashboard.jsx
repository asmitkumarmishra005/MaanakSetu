import { Link } from "react-router-dom";
import "./OfficerDashboard.css";

function OfficerDashboard() {
  const applications = [
    {
      id: "MS-2026-0001",
      applicant: "Rajesh Kumar",
      instrument: "Electronic Weighing Scale",
      serial: "EWS-458921",
      location: "Kolkata, West Bengal",
      submitted: "02 Sep 2026",
      status: "Pending Inspection",
    },
    {
      id: "MS-2026-0002",
      applicant: "Sharma Traders",
      instrument: "Platform Scale",
      serial: "PS-782341",
      location: "Howrah, West Bengal",
      submitted: "01 Sep 2026",
      status: "Pending Inspection",
    },
    {
      id: "MS-2026-0003",
      applicant: "Amit Enterprises",
      instrument: "Electronic Balance",
      serial: "EB-391284",
      location: "Salt Lake, Kolkata",
      submitted: "30 Aug 2026",
      status: "Inspection Completed",
    },
  ];

  return (
    <div className="officer-page">

      {/* HEADER */}
      <header className="officer-header">

        <div>
          <h1>⚖ MaanakSetu</h1>

          <p>
            Legal Metrology Officer Portal
          </p>
        </div>

        <div className="officer-profile">
          <div className="officer-avatar">
            👨‍💼
          </div>

          <div>
            <strong>Officer</strong>
            <span>LMO Department</span>
          </div>

          <Link to="/" className="officer-logout">
            Logout
          </Link>
        </div>

      </header>

      {/* CONTENT */}
      <main className="officer-content">

        <div className="officer-welcome">

          <div>
            <Link to="/" className="officer-back">
              ← Home
            </Link>

            <h2>Officer Dashboard</h2>

            <p>
              Manage assigned verification applications,
              inspections and certification decisions.
            </p>
          </div>

        </div>

        {/* STATS */}
        <section className="officer-stats">

          <div className="officer-stat">
            <span>📋</span>
            <strong>12</strong>
            <p>Assigned Applications</p>
          </div>

          <div className="officer-stat">
            <span>⏳</span>
            <strong>5</strong>
            <p>Pending Inspection</p>
          </div>

          <div className="officer-stat">
            <span>🔍</span>
            <strong>4</strong>
            <p>Inspections Completed</p>
          </div>

          <div className="officer-stat">
            <span>📜</span>
            <strong>3</strong>
            <p>Certificates Issued</p>
          </div>

        </section>

        {/* APPLICATIONS */}
        <section className="officer-applications">

          <div className="officer-section-heading">

            <div>
              <h2>Assigned Applications</h2>

              <p>
                Applications requiring officer action
              </p>
            </div>

            <button>
              Filter
            </button>

          </div>

          <div className="officer-table">

            <div className="officer-table-header">

              <span>Application</span>
              <span>Instrument</span>
              <span>Location</span>
              <span>Status</span>
              <span>Action</span>

            </div>

            {applications.map((application) => (

              <div
                className="officer-table-row"
                key={application.id}
              >

                <div className="officer-application-id">

                  <strong>
                    {application.id}
                  </strong>

                  <small>
                    {application.applicant}
                  </small>

                </div>

                <div>

                  <strong>
                    {application.instrument}
                  </strong>

                  <small>
                    Serial: {application.serial}
                  </small>

                </div>

                <div>

                  <span>
                    {application.location}
                  </span>

                  <small>
                    Submitted: {application.submitted}
                  </small>

                </div>

                <div>

                  <span
                    className={
                      application.status ===
                      "Inspection Completed"
                        ? "officer-status completed"
                        : "officer-status pending"
                    }
                  >
                    {application.status}
                  </span>

                </div>

                <div>

                  {application.status ===
                  "Inspection Completed" ? (

                    <button className="view-btn">
                      View Report
                    </button>

                  ) : (

                    <Link
                      to="/inspection"
                      className="inspect-btn"
                    >
                      Start Inspection →
                    </Link>

                  )}

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  );
}

export default OfficerDashboard;