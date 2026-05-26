export default function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div style={styles.wrap}>
      <button style={styles.btn} onClick={onPrev} disabled={!canPrev}>
        Prev
      </button>
      <span style={styles.text}>
        Page {page} / {totalPages}
      </span>
      <button style={styles.btn} onClick={onNext} disabled={!canNext}>
        Next
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" },
  text: { fontSize: 12, opacity: 0.75 },
  btn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
  },
};

