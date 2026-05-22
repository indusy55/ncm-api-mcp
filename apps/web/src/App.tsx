import { Suspense, lazy } from "react";
import { CircularProgress, Box } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.js";
import ErrorBoundary from "./components/ErrorBoundary.js";
import AppLayout from "./components/AppLayout.js";

const Login = lazy(() => import("./pages/Login.js"));
const Register = lazy(() => import("./pages/Register.js"));
const Dashboard = lazy(() => import("./pages/Dashboard.js"));
const AccountBinding = lazy(() => import("./pages/AccountBinding.js"));
const ApiKeys = lazy(() => import("./pages/ApiKeys.js"));
const McpSetup = lazy(() => import("./pages/McpSetup.js"));
const Profile = lazy(() => import("./pages/Profile.js"));

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/account/bind" element={<AccountBinding />} />
            <Route path="/account/keys" element={<ApiKeys />} />
            <Route path="/mcp-setup" element={<McpSetup />} />
            <Route path="/account/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}
