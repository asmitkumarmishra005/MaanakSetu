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
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === "officer") {
        return <Navigate to="/officer-dashboard" replace />;
      }

      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER ONLY */}
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

        <Route
          path="/certificates"
          element={
            <ProtectedRoute allowedRoles={["user", "officer", "gatc", "admin"]}>
              <Certificates />
            </ProtectedRoute>
          }
        />

        {/* OFFICER ONLY */}
        <Route
          path="/officer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["officer", "gatc", "admin"]}>
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inspection"
          element={
            <ProtectedRoute allowedRoles={["officer", "gatc", "admin"]}>
              <Inspection />
            </ProtectedRoute>
          }
        />

        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;