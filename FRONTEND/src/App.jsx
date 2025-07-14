import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./authSlice";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import AdminDelete from "./components/AdminDelete";
import Admin from "./pages/Admin";

const App = () => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Home></Home> : <Navigate to="/signup" />}
      ></Route>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login></Login>}
      ></Route>
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" /> : <Signup></Signup>}
      ></Route>
      <Route
        path="/admin"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <Admin />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/admin/create"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminPanel />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/admin/delete"
        element={
          isAuthenticated & (user?.role === "admin") ? (
            <AdminDelete />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
    </Routes>
  );
};

export default App;
