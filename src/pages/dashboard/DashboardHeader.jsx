import { List, PersonCircle } from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";
import "./dashboard-header.css";

export default function DashboardHeader({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <div className="cc-dash-header">

      {/* 🔥 LEFT: MENU BUTTON + TITLE */}
      <div className="cc-dash-left">

        {/* MOBILE TOGGLE */}
        <button className="menu-btn" onClick={onMenuClick}>
          <List size={22} />
        </button>

        <h4>My Dashboard</h4>

      </div>

      {/* 🔥 RIGHT: USER */}
      <div className="cc-dash-right">

        <PersonCircle size={24} />

        <span>
          {user?.name?.split(" ")[0]}
        </span>

      </div>

    </div>
  );
}