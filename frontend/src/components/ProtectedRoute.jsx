

const ProtectedRoute = ({ children }) => {
  // Completely disabled protection for development 
  // so all routes are freely accessible.
  return children;
};

export default ProtectedRoute;
