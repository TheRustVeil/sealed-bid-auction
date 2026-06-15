import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// StrictMode removed: React 19 StrictMode double-invokes effects in dev,
// causing a second reconciliation pass that races with MetaMask's DOM
// mutations and triggers the insertBefore crash.
createRoot(document.getElementById("root")).render(<App />);
