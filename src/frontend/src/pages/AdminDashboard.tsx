import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Field from "../components/Field";
import { Input } from "../components/Input";
import Pagination from "../components/Pagination";
import { api, apiErrorMessage } from "../lib/api";

type Seller = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  country: string;
  state: string;
  skills: string[];
  created_at: string;
};

export default function AdminDashboard() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
    state: "",
    skillsCsv: "",
    password: "",
  });
  const skills = useMemo(
    () =>
      form.skillsCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [form.skillsCsv]
  );

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createOk, setCreateOk] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const loadSellers = async (p = page) => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await api.get("/admin/list_seller", { params: { page: p, limit } });
      setSellers(res.data?.data ?? []);
      const total = Number(res.data?.total ?? 0);
      const pages = Math.max(1, Math.ceil(total / limit));
      setTotalPages(pages);
    } catch (err) {
      setListError(apiErrorMessage(err));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadSellers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateOk(null);
    try {
      await api.post("/admin/create_seller", {
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        country: form.country,
        state: form.state,
        skills,
        password: form.password,
      });
      setCreateOk("Seller created successfully.");
      setForm({
        name: "",
        email: "",
        mobile: "",
        country: "",
        state: "",
        skillsCsv: "",
        password: "",
      });
      await loadSellers(1);
      setPage(1);
    } catch (err) {
      setCreateError(apiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Admin Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: 16 }}>
        <Card>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Create Seller</h2>
          <form onSubmit={onCreateSeller} style={{ display: "grid", gap: 10 }}>
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Email">
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="Mobile No">
              <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Country">
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
              </Field>
              <Field label="State">
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
              </Field>
            </div>
            <Field label="Skills" hint="comma-separated (e.g. React, Node, SQL)">
              <Input value={form.skillsCsv} onChange={(e) => setForm({ ...form, skillsCsv: e.target.value })} />
            </Field>
            <Field label="Password">
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </Field>
            {createError ? <div style={errStyle}>{createError}</div> : null}
            {createOk ? <div style={okStyle}>{createOk}</div> : null}
            <button type="submit" style={btnStyle} disabled={creating}>
              {creating ? "Creating..." : "Create Seller"}
            </button>
          </form>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Sellers</h2>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>

          {listError ? <div style={{ ...errStyle, marginTop: 12 }}>{listError}</div> : null}

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {loadingList ? <div style={{ opacity: 0.7 }}>Loading...</div> : null}
            {sellers.map((s) => (
              <div key={s.id} style={rowStyle}>
                <div style={{ display: "grid" }}>
                  <strong>{s.name}</strong>
                  <span style={muted}>{s.email}</span>
                </div>
                <div style={{ display: "grid", textAlign: "right" }}>
                  <span style={muted}>{s.mobile}</span>
                  <span style={muted}>
                    {s.country}, {s.state}
                  </span>
                </div>
              </div>
            ))}
            {!loadingList && sellers.length === 0 ? <div style={{ opacity: 0.7 }}>No sellers found.</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "rgba(56,189,248,0.92)",
  border: "none",
  color: "#081018",
  fontWeight: 900,
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

const okStyle: React.CSSProperties = {
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.35)",
  color: "#bbf7d0",
  padding: "10px 12px",
  borderRadius: 12,
  fontSize: 13,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
};

const muted: React.CSSProperties = { opacity: 0.75, fontSize: 12 };

