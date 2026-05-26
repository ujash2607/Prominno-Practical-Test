import { Link } from "react-router-dom";
import Card from "../components/Card";

export default function Home() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 26 }}>Welcome</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Choose a role to continue.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>Admin</h2>
          <p style={{ opacity: 0.8 }}>Login to create sellers and manage seller listing.</p>
          <Link to="/admin/login" style={linkStyle}>
            Go to Admin Login →
          </Link>
        </Card>
        <Card>
          <h2 style={{ marginTop: 0 }}>Seller</h2>
          <p style={{ opacity: 0.8 }}>Login to add products, brands, and view PDFs.</p>
          <Link to="/seller/login" style={linkStyle}>
            Go to Seller Login →
          </Link>
        </Card>
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 8,
  color: "#7dd3fc",
  textDecoration: "none",
  fontWeight: 600,
};

