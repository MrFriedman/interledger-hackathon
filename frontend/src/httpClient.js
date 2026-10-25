import axios from "axios";
import { demoClient } from "./demo/client";

// Demo mode is the default. A production Vercel build with no env vars
// never calls Express, sqlite, or the Open Payments API.
const apiUrl = (process.env.REACT_APP_API_URL || "").trim();

export const isDemoMode = apiUrl.length === 0;

const httpClient = isDemoMode
  ? demoClient
  : axios.create({
      baseURL: apiUrl,
      withCredentials: true,
    });

export default httpClient;
