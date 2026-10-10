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
          <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mb-4 text-3xl shadow-xl shadow-red-950/50">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-white mb-2">Display Recovery</h2>
          <p className="text-xs text-neutral-400 max-w-sm mb-3">
            An issue prevented this view from rendering. Tap below to refresh with a clean slate.
          </p>
          {this.state.error?.message && (
            <p className="text-[11px] font-mono text-red-400/90 bg-red-950/40 border border-red-900/60 px-3 py-2 rounded-lg max-w-xs mb-4 break-words">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="py-2.5 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-950/50 active:scale-95 transition-all"
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
