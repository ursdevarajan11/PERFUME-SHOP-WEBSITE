const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

export const getApiUrl = (path) => {
  if (!apiBaseUrl) {
    throw new Error("Set VITE_API_URL to the deployed backend URL.");
  }

  return `${apiBaseUrl.replace(/\/$/, "")}${path}`;
};
