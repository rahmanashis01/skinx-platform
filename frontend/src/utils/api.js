/**
 * API Utilities
 * Handles communication with the backend AI analysis endpoint
 */

export async function submitCheckupData(formData) {
  // TODO: Replace with actual API endpoint
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || "http://localhost:8000/api/analyze";

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API submission error:", error);
    throw error;
  }
}
