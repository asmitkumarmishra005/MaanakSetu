import { Link } from "react-router-dom";
import "./Certificates.css";

function Certificates() {
  const certificates = [
    {
      id: "CERT-MS-2026-0001",
      instrument: "Electronic Weighing Scale",
      manufacturer: "Essae",
      model: "DS-215",
      serial: "EWS-458921",
      issued: "05 Sep 2026",
      validUntil: "04 Sep 2027",
      status: "Valid",
    },
    {
      id: "CERT-MS-2026-0002",
      instrument: "Platform Scale",
      manufacturer: "A&D",
      model: "FG-60KAL",
      serial: "PS-782341",
      issued: "20 Aug 2026",
      validUntil: "19 Aug 2027",
      status: "Valid",
    },
  ];

  return (
    <div className="certificates-page">

      {/* HEADER */}
      <header className="certificates-header">

        <div>
          <h1>⚖ MaanakSetu</h1>
          <p>Digital Legal Metrology Certificates</p>
        </div>

        <Link to="/dashboard" className="certificates-dashboard">
          Dashboard
        </Link>

      </header>

      {/* CONTENT */}
      <main className="certificates-container">

        <Link to="/dashboard" className="certificates-back">
          ← Back to Dashboard
        </Link>

        <div className="certificates-heading">

          <div>
            <h2>My Certificates</h2>

            <p>
              View and manage your Legal Metrology verification
              certificates.
            </p>
          </div>

          <div className="certificate-count">
            <span>📜</span>
            <strong>{certificates.length}</strong>
            <small>Certificates</small>
          </div>

        </div>

        {/* CERTIFICATES */}
        <section className="certificate-list">

          {certificates.map((certificate) => (

            <div
              className="certificate-card"
              key={certificate.id}
            >

              <div className="certificate-top">

                <div className="certificate-icon">
                  📜
                </div>

                <div className="certificate-title">

                  <h3>
                    {certificate.instrument}
                  </h3>

                  <p>
                    Certificate No.{" "}
                    <strong>{certificate.id}</strong>
                  </p>

                </div>

                <span className="certificate-status">
                  ✓ {certificate.status}
                </span>

              </div>

              <div className="certificate-details">

                <div>
                  <span>Manufacturer</span>
                  <strong>{certificate.manufacturer}</strong>
                </div>

                <div>
                  <span>Model Number</span>
                  <strong>{certificate.model}</strong>
                </div>

                <div>
                  <span>Serial Number</span>
                  <strong>{certificate.serial}</strong>
                </div>

                <div>
                  <span>Issued On</span>
                  <strong>{certificate.issued}</strong>
                </div>

                <div>
                  <span>Valid Until</span>
                  <strong>{certificate.validUntil}</strong>
                </div>

              </div>

              <div className="certificate-actions">

                <button className="view-certificate-btn">
                  View Certificate
                </button>

                <button className="download-certificate-btn">
                  ↓ Download PDF
                </button>

                <button className="verify-certificate-btn">
                  🔲 Verify
                </button>

              </div>

            </div>

          ))}

        </section>

        {/* EMPTY / INFORMATION AREA */}
        <section className="certificate-info">

          <div className="info-icon">
            🔐
          </div>

          <div>
            <h3>Secure Digital Certificates</h3>

            <p>
              Every MaanakSetu certificate contains a unique
              certificate number and QR verification mechanism
              to help verify its authenticity.
            </p>
          </div>

        </section>

      </main>

    </div>
  );
}

export default Certificates;