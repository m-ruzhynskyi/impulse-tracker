import logo from "../../assets/img/jyskLogo.png";
import getUser from "../../functions/getUser";
import "../../styles/global/header.css";
import Menu from "./Menu";
import {Link} from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <Link to={'/'}><img src={logo} className="header__logo" alt="Jysk logo" /></Link>
      {getUser() && <Menu />}
    </header>
  );
}
