import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    lazy: () => import("./pages/index"),
  },
  {
    path: "/forms/new",
    lazy: () => import("./pages/forms.new"),
  },
  {
    path: "/forms/:id",
    lazy: () => import("./pages/forms.$id"),
  },
  { path: "/forms/:id/edit", lazy: () => import("./pages/forms.$id.edit") },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
