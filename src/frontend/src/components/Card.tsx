export default function Card({ children }: { children: React.ReactNode }) {
  return <div style={styles.card}>{children}</div>;
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 16,
    padding: 16,
  },
};

