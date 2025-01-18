import { Link, useNavigate } from "react-router-dom";
import "./Menu.scss";
import { menu } from "../../data"; // Adjust the import path as necessary
import { useAuth } from "../AuthContext"; // Adjust the import path as necessary

const Menu = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get the logout function from context

  const handleLogout = () => {
    logout(); // Call the logout function
    navigate("/login"); // Redirect to the login page
  };

  return (
    <div className="menu">
      {menu.map((item) => (
        <div className="item" key={item.id}>
          <span className="title">{item.title}</span>
          {item.listItems.map((listItem) => (
            <div key={listItem.id}>
              {listItem.title === "Logout" ? (
                <span className="listItem" onClick={handleLogout}>
                  <img src={listItem.icon} alt="" />
                  <span className="listItemTitle">{listItem.title}</span>
                </span>
              ) : (
                <Link to={listItem.url} className="listItem">
                  <img src={listItem.icon} alt="" />
                  <span className="listItemTitle">{listItem.title}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;
