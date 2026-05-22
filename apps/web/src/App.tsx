import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import AccountBinding from "./pages/AccountBinding.js";
import ApiKeys from "./pages/ApiKeys.js";
import McpSetup from "./pages/McpSetup.js";
import AppLayout from "./components/AppLayout.js";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/account/bind" element={<AccountBinding />} />
          <Route path="/account/keys" element={<ApiKeys />} />
          <Route path="/mcp-setup" element={<McpSetup />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
