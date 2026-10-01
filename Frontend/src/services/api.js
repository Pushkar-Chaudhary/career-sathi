import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const api = axios.create({
  baseURL: import.meta.env.DEV ? configuredApiUrl || "http://localhost:3000" : undefined,
  withCredentials: true,
});
