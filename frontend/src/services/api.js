import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

// Attach token to requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Handle expired / invalid token — redirect to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect if a token exists (expired session) — not on login/signup failures
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      window.location.href = "/?session=expired";
    }
    return Promise.reject(err);
  },
);

export default API;
