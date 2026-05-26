import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLogin from "./pages/AdminLogin";
import SellerLogin from "./pages/SellerLogin";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import Home from "./pages/Home";
import { getUserFromToken } from "./lib/auth";

function RequireRole({
  role,
  children,
}: {
  role: "admin" | "seller";
  children: JSX.Element;
}): JSX.Element {
  const user = getUserFromToken();
  if (!user) return <Navigate to={role === "admin" ? "/admin/login" : "/seller/login"} replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout title="Product Management System" />}>
        <Route path="/" element={<Home />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />

        <Route path="/seller/login" element={<SellerLogin />} />
        <Route
          path="/seller"
          element={
            <RequireRole role="seller">
              <SellerDashboard />
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
