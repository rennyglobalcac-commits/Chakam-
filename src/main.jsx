import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-white mb-2">Display Recovery</h2>
          <p className="text-xs text-neutral-400 max-w-sm mb-4">
            An issue prevented this view from rendering. Tap below to refresh and clear temporary cached state.
          </p>
          <button
            onClick={this.handleReset}
            className="py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 transition-all"
          >
            Reset App State & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
