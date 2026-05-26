import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Field from "../components/Field";
import { Input } from "../components/Input";
import { api, apiErrorMessage } from "../lib/api";
import { setToken, getUserFromToken } from "../lib/auth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/admin/login", { email, password });
      setToken(res.data?.token);
      const user = getUserFromToken();
      if (user?.role !== "admin") {
        setError("This account is not an admin.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
      <Card>
        <div style={{ width: 360, display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Admin Login</h2>
          <p style={{ margin: 0, opacity: 0.75, fontSize: 13 }}>
            Uses `POST /api/admin/login`
          </p>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 8 }}>
            <Field label="Email">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {error ? <div style={errStyle}>{error}</div> : null}
            <button disabled={loading} style={btnStyle} type="submit">
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(56,189,248,0.9), rgba(167,139,250,0.9))",
  border: "none",
  color: "#081018",
  fontWeight: 800,
  padding: "10px 12px",
  borderRadius: 12,
  cursor: "pointer",
};

const errStyle: React.CSSProperties = {
  background: "rgba(239,68,68,0.12)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
  padding: "10px 12px",
  borderRadius: 12,
  fontSize: 13,
};

