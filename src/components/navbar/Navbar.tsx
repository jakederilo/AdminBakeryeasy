import "./navbar.scss";
import { useAuth } from "../AuthContext"; // Adjust path as needed

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="navbar">
      <div className="logo bg-white">
        <img src="/chief.svg" width="24" height="24" alt="" className="icon" />
        <span>Bakery Easy</span>
      </div>
      <div className="icons">
        <div className="user">
          <img src="noavatar.png" alt="User Avatar" />
          <span>{user?.name || "Guest"}</span>{" "}
          {/* Show logged-in user's name */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
