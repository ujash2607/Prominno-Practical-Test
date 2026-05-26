export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        ...styles.input,
        ...(props.style || {}),
      }}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        ...styles.input,
        minHeight: 90,
        resize: "vertical",
        ...(props.style || {}),
      }}
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    outline: "none",
  },
};

