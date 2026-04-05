import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./app.css";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectectedRoute";
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
  const { user,authLoading } = useAuth();


  if (authLoading) {
    return <div>Loading...</div>;
  }


  return (
    <>
      <Navbar />


      <Routes>
  <Route
  path="/"
  element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
/>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />


  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </ProtectedRoute>
    }
  />


  <Route
    path="/home"
    element={
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    }
  />


  <Route
    path="/transactions/entry"
    element={
      <ProtectedRoute>
        <Transaction page="entry" />
      </ProtectedRoute>
    }
  />


  <Route
    path="/transactions/payments"
    element={
      <ProtectedRoute>
        <Transaction page="payments" />
      </ProtectedRoute>
    }
  />

  <Route
    path="/transactions"
    element={
      <ProtectedRoute>
        <AppLayout>
          <Transaction page="history" />
        </AppLayout>
      </ProtectedRoute>
    }
  />


  <Route
    path="/split"
    element={
      <ProtectedRoute>
        <Split />
      </ProtectedRoute>
    }
  />


  <Route
    path="/notifications"
    element={
      <ProtectedRoute>
        <Notifs />
      </ProtectedRoute>
    }
  />


  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />


  <Route path="*" element={<NotFound />} />
</Routes>
</>
  );
}


export default App;
