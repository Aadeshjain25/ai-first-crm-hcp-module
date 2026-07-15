import axios from "axios";

// Match the backend host to whichever hostname the frontend is opened from
// during local development, while still allowing an explicit VITE_API_URL.
const inferredHost =
  typeof window !== "undefined" && window.location?.hostname
    ? window.location.hostname
    : "127.0.0.1";

const baseURL =
  import.meta.env.VITE_API_URL || `http://${inferredHost}:8000`;

const api = axios.create({ baseURL });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      (error?.message === "Network Error"
        ? "Network error: check that the FastAPI backend is running and CORS allows this frontend origin."
        : error?.message) ||
      "Something went wrong while contacting the server.";

    // Normalize every failure to a plain string message so components never
    // have to guess whether it's a network error, a validation error, or a
    // backend 500 with a FastAPI `detail` field.
    return Promise.reject(new Error(detail));
  }
);

export default api;

// --- Named, route-centralizing helpers -------------------------------------
// Components should prefer these over calling api.get/post with inline
// route strings, so a backend route rename only touches this file.

export const getInteractions = () => api.get("/interactions/");
export const getInteraction = (id) => api.get(`/interactions/${id}`);
export const createInteraction = (interaction) =>
  api.post("/interactions/", interaction);

export const logInteractionFromChat = (message) =>
  api.post("/chat/", { message });

export const editInteractionFromChat = (currentData, message) =>
  api.post("/edit-chat/", { current_data: currentData, message });

export const getInteractionSummary = (interaction) =>
  api.post("/summary/", { interaction });

export const getInteractionFollowUps = (interaction) =>
  api.post("/follow-up/", { interaction });

export const getInteractionInsights = (interaction) =>
  api.post("/insights/", { interaction });
