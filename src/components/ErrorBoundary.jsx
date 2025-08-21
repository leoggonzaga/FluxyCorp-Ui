
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error captured:", error, info);
  }

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === "development";
      return (
        <div className="flex flex-col justify-center items-center h-screen p-8">
          <h1 className="text-3xl text-red-600 font-bold">Ops, algo deu errado</h1>
          {isDev && (
            <pre className="bg-gray-100 text-left p-4 mt-4 rounded w-full max-w-lg">
              {this.state.error?.message}
            </pre>
          )}
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
