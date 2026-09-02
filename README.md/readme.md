# ⚖️ MaanakSetu

### Digital Legal Metrology Verification & Certification Platform

MaanakSetu is a digital platform designed to simplify and modernize the **verification, certification, and lifecycle management of weighing and measuring instruments** under Legal Metrology.

The platform connects businesses/users, Legal Metrology Officers (LMOs), Government Approved Test Centres (GATCs), and administrators through a secure digital workflow.

---

## 🎯 Problem Statement

The current verification and certification process for weighing and measuring instruments can involve:

* Manual paperwork
* Physical document handling
* Difficulty tracking applications
* Delayed certificate verification
* Limited visibility of application status
* Difficulty monitoring certificate validity and expiry

MaanakSetu aims to bring this workflow into a **centralized digital system**.

---

## 💡 Our Solution

MaanakSetu provides a complete digital workflow:

```text
Business / User
      ↓
Register Instrument
      ↓
Submit Verification Application
      ↓
Application Scheduling
      ↓
LMO / GATC Assigned
      ↓
Physical Instrument Verification
      ↓
Officer Records Observations
      ↓
PASS / FAIL
      ↓
Digital Certificate
      ↓
QR Code Verification
```

> **Important:** MaanakSetu does not replace the physical verification of instruments. The authorized officer/Test Centre performs the physical inspection, while MaanakSetu digitizes the application, scheduling, inspection records, certification, and tracking process.

---

## 👥 User Roles

### 👤 Business / User

* Register account
* Register weighing/measuring instruments
* Submit verification applications
* Track application status
* View certificates
* Download certificates
* Verify certificates using QR codes

### 👨‍💼 Legal Metrology Officer

* View assigned applications
* Schedule inspections
* Record inspection observations
* Enter measurement/readings
* Upload inspection photographs
* Submit verification results
* Approve or reject applications

### 🏢 GATC

* Manage assigned testing/verification activities
* Record test results
* Upload supporting documents
* Submit verification reports

### 🛡️ Administrator

* Manage users and officers
* Assign applications
* Monitor verification activities
* Manage certificates
* Monitor expiry and system activity
* Access dashboards and reports

---

## ✨ Key Features

* 🔐 Secure role-based authentication
* 📝 Online verification applications
* 📋 Instrument registration and lifecycle tracking
* 📅 Inspection scheduling
* 👨‍💼 Officer assignment
* 📸 Digital inspection records
* 📊 Verification observations and results
* 📜 Digital verification certificates
* 🔳 QR-based certificate verification
* ⏰ Certificate validity and expiry tracking
* 🔔 Expiry notifications
* 📈 Admin dashboards
* 📱 Responsive interface
* 📄 Certificate download and printing

---

## 🔳 QR Certificate Verification

Each approved certificate can contain a unique QR code.

A user can scan the QR code to access a public verification page showing information such as:

```text
Certificate Status : VALID
Certificate ID     : MS-XXXXXX
Instrument Type    : Weighing Instrument
Issue Date         : DD/MM/YYYY
Valid Until        : DD/MM/YYYY
```

The system can also indicate:

```text
VALID
EXPIRED
REVOKED
```

This helps improve transparency and makes certificate verification easier.

---

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* React Router
* CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Authentication

* JWT-based authentication
* Role-based access control

### Additional Technologies

* QR Code generation
* PDF certificate generation
* REST APIs

---

## 📁 Project Structure

```text
MaanakSetu/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Login.css
│   │   │   ├── Register.jsx
│   │   │   └── Register.css
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── backend/
│
├── .gitignore
└── README.md
```

---

## 🚀 Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/asmitkumarmishra005/MaanakSetu.git
```

### 2. Open the project

```bash
cd MaanakSetu
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

### 4. Start the frontend

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

## 🔮 Planned Development

The project is being developed incrementally.

### Phase 1 — Frontend

* Authentication UI
* Registration
* Dashboards
* Application forms
* Instrument management

### Phase 2 — Backend

* REST APIs
* Authentication
* User management
* Application management
* Role-based authorization

### Phase 3 — Database

* PostgreSQL integration
* User records
* Instrument records
* Applications
* Inspections
* Certificates

### Phase 4 — Verification System

* Officer workflow
* Inspection observations
* PASS/FAIL results
* Digital certificates
* QR verification

### Phase 5 — Advanced Features

* Notifications
* Expiry alerts
* Analytics dashboards
* PDF generation
* Mobile/PWA support
* Audit logs

---

## 🎯 Vision

**MaanakSetu aims to make Legal Metrology verification more transparent, trackable, accessible, and digitally manageable.**

> **From application to verification — one digital bridge.**

---

## 👨‍💻 Project Status

🚧 **Currently under development**

This project is being developed as part of **Smart India Hackathon (SIH) 2026**.

---
