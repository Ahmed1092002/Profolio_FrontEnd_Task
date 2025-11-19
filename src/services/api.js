const API_MODE = import.meta.env.VITE_API_MODE || "api"; 
const MOCK_API_URL =
  import.meta.env.VITE_MOCK_API_URL || "http://localhost:3001";
const BACKEND_API_URL =
  import.meta.env.VITE_API_URL || "https://your-backend-api.com/api";

export const fetchData = async (endpoint) => {
  try {
    let url;

    if (API_MODE === "api") {
      url = `${BACKEND_API_URL}/${endpoint}`;
    } else if (API_MODE === "mock") {
      url = `${MOCK_API_URL}/${endpoint}`;
    } else {
      url = `/data/${endpoint}.json`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
};

/**
 * Get current API mode
 * @returns {string} 'local', 'mock', or 'api'
 */
export const getApiMode = () => API_MODE;

/**
 * Check if using mock server
 * @returns {boolean}
 */
export const isUsingMockServer = () => API_MODE === "mock";

/**
 * Check if using production backend API
 * @returns {boolean}
 */
export const isUsingBackendAPI = () => API_MODE === "api";
