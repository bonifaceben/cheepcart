import { List, Search, Moon, Sun } from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

export default function AdminHeader({ toggleSidebar, toggleDarkMode, darkMode }) {
  const { user } = useAuth();

  return (
    <div className="admin-header">

      <div className="admin-header-left">
        <button onClick={toggleSidebar} className="menu-toggle">
          <List size={22} />
        </button>

        <img src={logo} alt="CheepCart" className="admin-logo" />
      </div>

      <div className="admin-search">
        <Search size={16} />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="admin-header-right">

        <button className="icon-btn" onClick={toggleDarkMode}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="admin-user">
          {user?.name ? `Hi, ${user.name}` : "Admin"}
        </div>

      </div>

    </div>
  );
}