export default function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label style={styles.label}>
      <div style={styles.labelRow}>
        <span style={styles.labelText}>{label}</span>
        {hint ? <span style={styles.hint}>{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

const styles: Record<string, React.CSSProperties> = {
  label: { display: "grid", gap: 8 },
  labelRow: { display: "flex", justifyContent: "space-between", gap: 10 },
  labelText: { fontSize: 13, opacity: 0.9 },
  hint: { fontSize: 12, opacity: 0.6 },
};

