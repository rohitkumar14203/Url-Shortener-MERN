import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Toast from "./components/Toast";

import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import ProtectedRoutes from "./components/ProtectedRoutes";
import PublicRoute from "./components/PublicRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Layout from "./layout/Layout";
import Setting from "./pages/setting/Setting";
import Links from "./pages/Links/Links";
import Analytics from "./pages/Analytics/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<PublicRoute />}>
        <Route index element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoutes />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/link" element={<ProtectedRoute><Links /></ProtectedRoute>} />
          <Route path="/setting" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
          <Route path="/analytic" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        </Route>
      </Route>
    </Route>
  )
);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
      <Toast />
    </AuthProvider>
  );
};

export default App;
