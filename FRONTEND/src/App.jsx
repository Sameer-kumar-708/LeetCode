import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./authSlice";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";

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

      <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
      <Route
        path="/admin"
        element={
          isAuthenticated && user?.role === "admin" ? (
            <AdminPanel />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
};

export default App;
