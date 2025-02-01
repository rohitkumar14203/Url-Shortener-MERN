import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Toast from "./components/Toast";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import ProtectedRoutes from "./components/ProtectedRoutes";
import PublicRoute from "./components/PublicRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Layout from "./layout/Layout";
import Setting from "./pages/setting/Setting";
import Links from "./pages/links/Links";
import Analytics from "./pages/analytics/Analytics";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/">
            <Route element={<PublicRoute />}>
              <Route index element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<ProtectedRoutes />}>
              <Route element={<Layout />}>
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/links"
                  element={
                    <PrivateRoute>
                      <Links />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/setting"
                  element={
                    <PrivateRoute>
                      <Setting />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <PrivateRoute>
                      <Analytics />
                    </PrivateRoute>
                  }
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
      <ToastContainer />
      <Toast />
    </Router>
  );
}

export default App;
