import { Link, useLocation } from "react-router-dom";
import CurrentUserBadge from "./CurrentUserBadge";

interface NavbarProps {
  onLoginClick: () => void;
}

export default function Navbar({ onLoginClick }: NavbarProps) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/events" style={{ textDecoration: "none", color: "inherit" }}>
          PenguWave 🐧
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/events" className={location.pathname.startsWith("/events") ? "active" : ""}>
          Events
        </Link>
        <Link to="/users" className={location.pathname === "/users" ? "active" : ""}>
          Users
        </Link>
        <Link to="/settings" className={location.pathname === "/settings" ? "active" : ""}>
          Settings
        </Link>
        <CurrentUserBadge onClick={onLoginClick} />
      </div>
    </nav>
  );
}
