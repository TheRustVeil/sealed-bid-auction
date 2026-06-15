import { createBrowserRouter, useRouteError } from "react-router-dom";
import { Landing } from "../pages/Landing/Landing";
import { Dashboard } from "../pages/operator/Dashboard";
import { CreateDistribution } from "../pages/operator/CreateDistribution";
import { DistributionDetail } from "../pages/operator/DistributionDetail";
import { CheckAllocation } from "../pages/recipient/CheckAllocation";
import { MyAllocations } from "../pages/recipient/MyAllocations";
import { VerifyProof } from "../pages/recipient/VerifyProof";
import { Discover } from "../pages/discover/Discover";
import { Profile } from "../pages/profile/Profile";

function RouteError() {
  const error = useRouteError();
  return (
    <div style={{ padding: '2rem', color: '#fff', background: '#0f0f1a', minHeight: '100vh', fontFamily: 'monospace' }}>
      <h2 style={{ color: '#f87171' }}>Something went wrong</h2>
      <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>
        {error?.message ?? String(error)}
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
      >
        Reload
      </button>
    </div>
  );
}

const errorElement = <RouteError />;

export const router = createBrowserRouter([
  { path: "/", element: <Landing />, errorElement },
  { path: "/operator", element: <Dashboard />, errorElement },
  { path: "/operator/create", element: <CreateDistribution />, errorElement },
  { path: "/operator/distribution/:id", element: <DistributionDetail />, errorElement },
  { path: "/recipient", element: <CheckAllocation />, errorElement },
  { path: "/recipient/allocations", element: <MyAllocations />, errorElement },
  { path: "/recipient/verify/:id", element: <VerifyProof />, errorElement },
  { path: "/discover", element: <Discover />, errorElement },
  { path: "/profile", element: <Profile />, errorElement },
]);
