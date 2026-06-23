import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // CRITICAL: This tells the browser to automatically attach the HttpOnly cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Notice: The interceptor is completely gone! The browser handles security natively now.

export default api;
