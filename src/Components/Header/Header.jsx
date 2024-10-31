import logo from "../../assets/img/jyskLogo.png";
import getUser from "../../functions/getUser";
import "../../styles/global/header.css";
import Menu from "./Menu";

export default function Header() {
  return (
    <header className="header">
      <img src={logo} className="header__logo" alt="Jysk logo" />
      {getUser() && <Menu />}
    </header>
  );
}
