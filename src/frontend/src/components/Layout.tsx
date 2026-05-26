import { Link, Outlet, useNavigate } from "react-router-dom";
import { clearToken, getUserFromToken } from "../lib/auth";

export default function Layout({ title }: { title: string }) {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const onLogout = () => {
    clearToken();
    navigate("/", { replace: true });
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <Link to="/" style={styles.brandLink}>
            PMS
          </Link>
          <span style={styles.title}>{title}</span>
        </div>

        <div style={styles.right}>
          {user ? (
            <>
              <span style={styles.user}>
                {user.role} • {user.email}
              </span>
              <button onClick={onLogout} style={styles.button}>
                Logout
              </button>
            </>
          ) : null}
        </div>
      </header>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0b1220", color: "#e6edf3" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    position: "sticky",
    top: 0,
    backdropFilter: "blur(8px)",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandLink: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: 10,
    background: "rgba(56,189,248,0.15)",
  },
  title: { opacity: 0.9 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  user: { fontSize: 12, opacity: 0.85 },
  button: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
  },
  main: { maxWidth: 1100, margin: "0 auto", padding: 20 },
};

