import { createBrowserRouter } from "react-router-dom"
import { App } from "./App"
import { DashboardPage } from "./pages/dashboard"
import { CraftPage } from "./pages/craft"
import { VendorPage } from "./pages/vendor"
import { CrossWorldPage } from "./pages/cross-world"
import { DiscoverPage } from "./pages/discover"
import { GatherPage } from "./pages/gather"
import { NotFoundPage } from "./pages/not-found"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "craft", element: <CraftPage /> },
      { path: "vendor", element: <VendorPage /> },
      { path: "cross-world", element: <CrossWorldPage /> },
      { path: "discover", element: <DiscoverPage /> },
      { path: "gather", element: <GatherPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
