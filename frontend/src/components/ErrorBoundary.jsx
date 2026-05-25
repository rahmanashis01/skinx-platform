import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              width: "100%",
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              textAlign: "center",
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 20px",
                background: "linear-gradient(135deg, #ff5252 0%, #f44336 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={40} color="#fff" />
            </div>

            {/* Error Title */}
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1a202c",
                marginBottom: "10px",
              }}
            >
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p
              style={{
                fontSize: "16px",
                color: "#4a5568",
                marginBottom: "30px",
                lineHeight: "1.6",
              }}
            >
              We encountered an unexpected error. Don't worry, your data is
              safe. Please try refreshing the page or go back to the home page.
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  padding: "15px 20px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <RefreshCw size={18} />
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  flex: 1,
                  padding: "15px 20px",
                  background: "#fff",
                  color: "#667eea",
                  border: "2px solid #667eea",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.background = "#f7fafc";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <Home size={18} />
                Go Home
              </button>
            </div>

            {/* Developer Information */}
            {isDev && this.state.error && (
              <details
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#f7fafc",
                  borderRadius: "10px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#2d3748",
                    marginBottom: "10px",
                  }}
                >
                  🔍 Developer Info (Click to expand)
                </summary>

                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    background: "#fff",
                    borderRadius: "5px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#e53e3e" }}>Error:</strong>
                    <pre
                      style={{
                        marginTop: "5px",
                        padding: "10px",
                        background: "#fff5f5",
                        borderRadius: "5px",
                        overflow: "auto",
                        fontSize: "12px",
                        color: "#c53030",
                      }}
                    >
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  {this.state.errorInfo && (
                    <div>
                      <strong style={{ color: "#2d3748" }}>
                        Component Stack:
                      </strong>
                      <pre
                        style={{
                          marginTop: "5px",
                          padding: "10px",
                          background: "#f7fafc",
                          borderRadius: "5px",
                          overflow: "auto",
                          fontSize: "11px",
                          color: "#4a5568",
                          maxHeight: "200px",
                        }}
                      >
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Help Text */}
            <p
              style={{
                marginTop: "20px",
                fontSize: "13px",
                color: "#718096",
              }}
            >
              If the problem persists, please contact support or check the
              browser console for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
