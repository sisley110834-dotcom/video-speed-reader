import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import { RootLayout, RootErrorBoundary, NotFound } from "@/pages/Root";
import { RequireAuth } from "@/components/RequireAuth";
import Index from "@/pages/Index";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import AppPage from "@/pages/AppPage";

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { path: "/", element: <Index /> },
      { path: "/signin", element: <SignIn /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/sign-in", element: <Navigate to="/signin" replace /> },
      { path: "/sign-up", element: <Navigate to="/signup" replace /> },
      {
        element: <RequireAuth />,
        children: [{ path: "/app", element: <AppPage /> }],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
