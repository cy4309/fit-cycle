import { lazy, Suspense } from "react";
import "@/assets/styles/app.css";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { router_path } from "@/routers";
import BaseLayout from "@/layouts/BaseLayout";
import ProtectedRoute from "@/routers/ProtectedRoute";
import Home from "@/pages/Home";
// import Auth from "@/pages/AuthQuery";
// import Auth from "@/pages/AuthAsyncThunk";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useSelector } from "react-redux";
import { RootState } from "@/stores/store";

const AuthQuery = lazy(() => import("@/pages/AuthQuery"));
const AuthAsyncThunk = lazy(() => import("@/pages/AuthAsyncThunk"));
const Error = lazy(() => import("@/pages/Error"));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingIndicator />}>{children}</Suspense>
);

const App: React.FC = () => {
  const mode = useSelector((state: RootState) => state.authMode.mode);
  const AuthComponent = mode === "query" ? AuthQuery : AuthAsyncThunk;

  const routers = createBrowserRouter([
    {
      path: router_path.auth || "/auth",
      element: (
        <SuspenseWrapper>
          <AuthComponent />
        </SuspenseWrapper>
      ),
    },
    {
      element: (
        <BaseLayout>
          <SuspenseWrapper>
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          </SuspenseWrapper>
        </BaseLayout>
      ),
      children: [
        {
          index: true,
          path: router_path.index,
          element: <Home key="Home" />,
        },
        {
          path: router_path.error,
          element: <Error key="Error" />,
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={routers} />
    </>
  );
};

export default App;
