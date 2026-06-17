import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./Layout";
import { Landing } from "../pages/Landing/Landing";
import { Dashboard } from "../pages/operator/Dashboard";
import { CreateDistribution } from "../pages/operator/CreateDistribution";
import { DistributionDetail } from "../pages/operator/DistributionDetail";
import { CheckAllocation } from "../pages/recipient/CheckAllocation";
import { MyAllocations } from "../pages/recipient/MyAllocations";
import { VerifyProof } from "../pages/recipient/VerifyProof";
import { Discover } from "../pages/discover/Discover";
import { Profile } from "../pages/profile/Profile";
import { useRouteError } from "react-router-dom";

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
  {
    element: <Layout />,
    errorElement,
    children: [
      { path: "/",                              element: <Landing /> },
      { path: "/operator",                      element: <Dashboard /> },
      { path: "/operator/create",               element: <CreateDistribution /> },
      { path: "/operator/distribution/:id",     element: <DistributionDetail /> },
      { path: "/recipient",                     element: <CheckAllocation /> },
      { path: "/recipient/allocations",         element: <MyAllocations /> },
      { path: "/recipient/verify/:id",          element: <VerifyProof /> },
      { path: "/discover",                      element: <Discover /> },
      { path: "/profile",                       element: <Profile /> },
    ],
  },
]);
