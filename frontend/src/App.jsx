import VerifyCertificate from "./pages/VerifyCertificate";
import CertificateDetails from "./pages/CertificateDetails";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InstrumentRegistration from "./pages/InstrumentRegistration";
import ApplyVerification from "./pages/ApplyVerification";
import Applications from "./pages/Applications";
import Certificates from "./pages/Certificates";
import OfficerDashboard from "./pages/OfficerDashboard";
import Inspection from "./pages/Inspection";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("maanaksetu_token");
  const savedUser = localStorage.getItem("maanaksetu_user");

  if (!token || !savedUser) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(savedUser);

    if (
      allowedRoles &&
      !allowedRoles.includes(user.role)
    ) {
      if (
        user.role === "officer" ||
        user.role === "gatc" ||
        user.role === "admin"
      ) {
        return (
          <Navigate
            to="/officer-dashboard"
            replace
          />
        );
      }

      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("maanaksetu_token");
    localStorage.removeItem("maanaksetu_user");

    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <HashRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================
            USER ROUTES
        ========================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register-instrument"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <InstrumentRegistration />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply-verification"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ApplyVerification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Applications />
            </ProtectedRoute>
          }
        />

        {/* =========================
            CERTIFICATES
        ========================= */}

        <Route
          path="/certificates"
          element={
            <ProtectedRoute
              allowedRoles={[
                "user",
                "officer",
                "gatc",
                "admin",
              ]}
            >
              <Certificates />
            </ProtectedRoute>
          }
        />
        <Route
  path="/certificates/:id"
  element={
    <ProtectedRoute
      allowedRoles={[
        "user",
        "officer",
        "gatc",
        "admin",
      ]}
    >
      <CertificateDetails />
    </ProtectedRoute>
  }
/>

        {/* =========================
            OFFICER ROUTES
        ========================= */}

        <Route
          path="/officer-dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "officer",
                "gatc",
                "admin",
              ]}
            >
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inspection"
          element={
            <ProtectedRoute
              allowedRoles={[
                "officer",
                "gatc",
                "admin",
              ]}
            >
              <Inspection />
            </ProtectedRoute>
          }
        />

        {/* =========================
            UNKNOWN ROUTE
        ========================= */}
<Route
  path="/verify/:code"
  element={<VerifyCertificate />}
/>
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </HashRouter>
  );
}

export default App;