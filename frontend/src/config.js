const apiBaseUrl =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");

export const getApiUrl = (path) => {
  if (!apiBaseUrl) {
    throw new Error("Set REACT_APP_API_URL to the deployed backend URL.");
  }

  return `${apiBaseUrl.replace(/\/$/, "")}${path}`;
};
