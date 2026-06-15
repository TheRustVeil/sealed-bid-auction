import { Suspense, Component } from "react";
import { RouterProvider } from "react-router-dom";
import { Providers } from "./app/providers";
import { router } from "./app/router";
import { NotificationToast } from "./components/ui/NotificationToast";
import { useNotifications } from "./hooks/useNotifications";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#fff', background: '#0f0f1a', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#f87171' }}>Something went wrong</h2>
          <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>{this.state.error.message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function InnerApp() {
  const { toasts, dismiss } = useNotifications();
  return (
    <>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
      <NotificationToast toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <InnerApp />
      </Providers>
    </ErrorBoundary>
  );
}
