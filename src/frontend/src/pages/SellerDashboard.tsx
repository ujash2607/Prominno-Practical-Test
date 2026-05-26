import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Field from "../components/Field";
import { Input, Textarea } from "../components/Input";
import Pagination from "../components/Pagination";
import { api, apiErrorMessage } from "../lib/api";

type Brand = {
  id?: number;
  brand_name: string;
  detail?: string;
  image_url?: string | null;
  price: number | string;
};

type Product = {
  id: number;
  product_name: string;
  product_description: string;
  created_at: string;
  product_brands: Array<{
    id: number;
    brand_name: string;
    detail: string;
    image_url: string | null;
    price: number;
  }>;
  pdf_url?: string;
};

export default function SellerDashboard() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = async (p = page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/seller/list_products", { params: { page: p, limit } });
      setProducts(res.data?.data ?? []);
      const meta = res.data?.meta;
      const total = Number(meta?.total ?? res.data?.total ?? 0);
      const pages = Number(meta?.totalPages ?? Math.max(1, Math.ceil(total / limit)));
      setTotalPages(pages);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createOk, setCreateOk] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [brands, setBrands] = useState<Array<Brand & { imageFile?: File | null }>>([
    { brand_name: "", detail: "", price: "", imageFile: null },
  ]);

  const brandsPayload: Brand[] = useMemo(
    () =>
      brands.map((b) => ({
        brand_name: b.brand_name,
        detail: b.detail ?? "",
        price: Number(b.price),
      })),
    [brands]
  );

  const onAddBrand = () => setBrands((prev) => [...prev, { brand_name: "", detail: "", price: "", imageFile: null }]);
  const onRemoveBrand = (idx: number) => setBrands((prev) => prev.filter((_, i) => i !== idx));

  const onCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateOk(null);

    try {
      const files = brands.map((b) => b.imageFile).filter(Boolean) as File[];
      if (files.length !== brands.length) {
        setCreateError("Please attach an image for each brand.");
        return;
      }

      const fd = new FormData();
      fd.append("product_name", productName);
      fd.append("product_description", productDescription);
      fd.append("brands", JSON.stringify(brandsPayload));
      brands.forEach((b) => {
        if (b.imageFile) fd.append("images", b.imageFile);
      });

      await api.post("/seller/create_product", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCreateOk("Product created successfully.");
      setProductName("");
      setProductDescription("");
      setBrands([{ brand_name: "", detail: "", price: "", imageFile: null }]);
      await loadProducts(1);
      setPage(1);
    } catch (err) {
      setCreateError(apiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/seller/delete_product/${id}`);
      await loadProducts(page);
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  const onViewPdf = async (id: number) => {
    try {
      const res = await api.get(`/seller/view_pdf/${id}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 22 }}>Seller Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1.35fr", gap: 16 }}>
        <Card>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Add Product</h2>
          <form onSubmit={onCreateProduct} style={{ display: "grid", gap: 10 }}>
            <Field label="Product Name">
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} required />
            </Field>
            <Field label="Product Description">
              <Textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required />
            </Field>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong>Brands</strong>
              <button type="button" style={ghostBtn} onClick={onAddBrand}>
                + Add brand
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {brands.map((b, idx) => (
                <div key={idx} style={brandBox}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: 13, opacity: 0.9 }}>Brand #{idx + 1}</strong>
                    {brands.length > 1 ? (
                      <button type="button" style={dangerBtn} onClick={() => onRemoveBrand(idx)}>
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <Field label="Brand Name">
                    <Input
                      value={b.brand_name}
                      onChange={(e) =>
                        setBrands((prev) => prev.map((x, i) => (i === idx ? { ...x, brand_name: e.target.value } : x)))
                      }
                      required
                    />
                  </Field>
                  <Field label="Detail">
                    <Input
                      value={b.detail ?? ""}
                      onChange={(e) =>
                        setBrands((prev) => prev.map((x, i) => (i === idx ? { ...x, detail: e.target.value } : x)))
                      }
                      required
                    />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Field label="Price">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={b.price}
                        onChange={(e) =>
                          setBrands((prev) => prev.map((x, i) => (i === idx ? { ...x, price: e.target.value } : x)))
                        }
                        required
                      />
                    </Field>
                    <Field label="Image">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setBrands((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, imageFile: e.target.files?.[0] ?? null } : x
                            )
                          )
                        }
                        required
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            {createError ? <div style={errStyle}>{createError}</div> : null}
            {createOk ? <div style={okStyle}>{createOk}</div> : null}

            <button type="submit" style={btnStyle} disabled={creating}>
              {creating ? "Saving..." : "Save Product"}
            </button>
          </form>
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>My Products</h2>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </div>

          {error ? <div style={{ ...errStyle, marginTop: 12 }}>{error}</div> : null}
          {loading ? <div style={{ marginTop: 12, opacity: 0.7 }}>Loading...</div> : null}

          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {products.map((p) => (
              <div key={p.id} style={productCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{p.product_name}</strong>
                    <div style={{ opacity: 0.8, fontSize: 12, marginTop: 6 }}>{p.product_description}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <button style={ghostBtn} onClick={() => onViewPdf(p.id)} type="button">
                      View PDF
                    </button>
                    <button style={dangerBtn} onClick={() => onDelete(p.id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {p.product_brands?.map((b) => (
                    <div key={b.id} style={brandRow}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {b.image_url ? (
                          <img
                            src={b.image_url}
                            alt={b.brand_name}
                            width={44}
                            height={44}
                            style={{ borderRadius: 10, objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.08)" }} />
                        )}
                        <div style={{ display: "grid" }}>
                          <span style={{ fontWeight: 700 }}>{b.brand_name}</span>
                          <span style={{ opacity: 0.7, fontSize: 12 }}>{b.detail}</span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800 }}>₹ {Number(b.price).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!loading && products.length === 0 ? <div style={{ opacity: 0.7 }}>No products found.</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "rgba(34,197,94,0.92)",
  border: "none",
  color: "#081018",
  fontWeight: 900,
  padding: "10px 12px",
  borderRadius: 12,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  fontWeight: 800,
  padding: "8px 10px",
  borderRadius: 10,
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  background: "rgba(239,68,68,0.15)",
  border: "1px solid rgba(239,68,68,0.35)",
  color: "#fecaca",
  fontWeight: 900,
  padding: "8px 10px",
  borderRadius: 10,
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

const brandBox: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
};

const productCard: React.CSSProperties = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
};

const brandRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 10,
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

