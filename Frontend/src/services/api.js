import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (import.meta.env.PROD && configuredApiUrl) {
  let parsedApiUrl;
  try {
    parsedApiUrl = new URL(configuredApiUrl);
  } catch {
    throw new Error("VITE_API_URL must be the public backend origin.");
  }

  if (parsedApiUrl.protocol !== "https:" || parsedApiUrl.origin !== configuredApiUrl) {
    throw new Error("In production, VITE_API_URL must be an HTTPS origin without a path or trailing slash.");
  }
}

export const api = axios.create({
  baseURL: configuredApiUrl || (import.meta.env.DEV ? "http://localhost:3000" : undefined),
  withCredentials: true,
});
