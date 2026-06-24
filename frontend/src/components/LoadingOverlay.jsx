const LoadingOverlay = ({ message = "Loading..." }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      padding: "2rem",
    }}
  >
    <div
      style={{
        padding: "1.5rem 2rem",
        borderRadius: "16px",
        background: "white",
        boxShadow: "0 28px 80px rgba(15, 23, 42, 0.08)",
        textAlign: "center",
      }}
    >
      <p style={{ margin: 0, fontSize: "1.1rem", color: "#334155" }}>{message}</p>
    </div>
  </div>
);

export default LoadingOverlay;
