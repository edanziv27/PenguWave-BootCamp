import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import EventsPage from "./pages/EventsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

// Skip the login modal during local development.
const DEBUG_BYPASS_AUTH = false;

function App() {
  // Show the login modal on first visit. Computed once as initial state to
  // avoid a setState-in-effect cascade.
  const [showLogin, setShowLogin] = useState(
    () => !DEBUG_BYPASS_AUTH && sessionStorage.getItem("login-dismissed") !== "true"
  );

  const handleCloseLogin = () => {
    sessionStorage.setItem("login-dismissed", "true");
    setShowLogin(false);
  };

  return (
    <>
      <Navbar onLoginClick={() => setShowLogin(true)} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {showLogin && <LoginModal onClose={handleCloseLogin} />}
    </>
  );
}

export default App;
