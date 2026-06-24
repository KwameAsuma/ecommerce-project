const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div
      style={{
        margin: "1rem 0",
        padding: "1rem",
        borderRadius: "14px",
        background: "#fef2f2",
        color: "#991b1b",
      }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
