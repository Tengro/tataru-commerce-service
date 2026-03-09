import { createBrowserRouter } from "react-router-dom"
import { App } from "./App"
import { DashboardPage } from "./pages/dashboard"
import { CraftingPage } from "./pages/crafting"
import { GatherPage } from "./pages/gather"
import { HunterPage } from "./pages/hunter"
import { VendorPage } from "./pages/vendor"
import { WorkshopPage } from "./pages/workshop"
import { NotFoundPage } from "./pages/not-found"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "crafting", element: <CraftingPage /> },
      { path: "gather", element: <GatherPage /> },
      { path: "hunter", element: <HunterPage /> },
      { path: "vendor", element: <VendorPage /> },
      { path: "workshop", element: <WorkshopPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
