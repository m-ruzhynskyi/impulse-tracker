import "../../styles/menu/manu.css";
import menuController from "../../functions/menuController";
import {getAuth, signOut} from "firebase/auth";
import {NavLink, useNavigate} from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();
  const authInstance = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(authInstance);
      menuController();
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="menu">
      <nav role="navigation">
        <div id="menuToggle">
          <input
            type="checkbox"
            id="menuCheckbox"
            onChange={(e) => menuController(false, e.target.checked)}
          />

          <span></span>
          <span></span>
          <span></span>

          <ul id="menu">
            <li>
              <NavLink to={"/"} onClick={() => menuController(true)}>
                Трекер
              </NavLink>
            </li>
            <li>
              <NavLink to={"/leaders"} onClick={() => menuController(true)}>
                Лідери
              </NavLink>
            </li>
            <li>
              <NavLink to={"/stat"} onClick={() => menuController(true)}>
                Статистика
              </NavLink>
            </li>
            <li>
              <NavLink to={"/complexes"} onClick={() => menuController(true)}>
                Комплекси
              </NavLink>
            </li>
            <li>
              <NavLink to={"/plan"} onClick={() => menuController(true)}>
                План
              </NavLink>
            </li>
            <li>
              <NavLink to={"/settings"} onClick={() => menuController(true)}>
                Налаштування
              </NavLink>
            </li>
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Вихід
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
