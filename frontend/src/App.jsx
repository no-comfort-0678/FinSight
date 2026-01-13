import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./app.css";

import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/signup/Signup";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import Transaction from "./pages/transaction/Transaction";
import Split from "./pages/split/Split";
import Notifs from "./pages/notification/Notifs";
import NotFound from "./pages/notfound/NotFound";
import Navbar from "./components/navbar/navbar";
import Profile from "./pages/auth/profile/profile";
function App() {
  const { user } = useAuth();

  return (
    <>
      <img src="/bgimg.png" alt="bg-img" id="bg-img" />
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/transactions/entry"
          element={user ? <Transaction page="entry" /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/transactions/payments"
          element={user ? <Transaction page="payments" /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/split"
          element={user ? <Split /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/notifications"
          element={user ? <Notifs /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" replace />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
