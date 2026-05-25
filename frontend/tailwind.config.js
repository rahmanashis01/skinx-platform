/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          blue: "#1E40AF",
          darkSlate: "#1F2937",
          lightGray: "#F9FAFB",
        },
      },
    },
  },
  // Attempt to disable oklch colors for PDF compatibility
  experimental: {
    optimizeUniversalDefaults: false,
  },
  plugins: [],
}
