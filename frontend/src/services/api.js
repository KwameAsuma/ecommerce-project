import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // CRITICAL: This tells the browser to automatically attach the HttpOnly cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to automatically handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login if not already there, EXCEPT when checking initial auth state
      // This prevents public pages (like Landing Page) from aggressively kicking guests to /login
      if (
        window.location.pathname !== "/login" && 
        error.config && 
        !error.config.url.includes("/auth/me")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
