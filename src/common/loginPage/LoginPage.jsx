import { useState } from "react";
import { loginUser } from "../../firebase/loginUser";
import "../../styles/login/login.css";

export default function LoginPage() {
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  const navigate = useNavigate();

  function validate() {
    if (!loginValue || !passwordValue) return false;

    loginUser(loginValue, passwordValue).then((res) => {
      if (res) {
        navigate("/");
      } else {
        setIsWrong(true);
        setPasswordValue("");
      }
    });
  }
  return (
    <main className="login">
      <h1 className="login__title">Authorization</h1>
      {isWrong && (
        <p className="login__error">Incorrect email or password. Please try again.</p>
      )}
      <div className="login__form">
        <div className="login__form__input-wrapper">
          <input
            className={`login__form__input-wrapper__input login__form__input-wrapper__input--login ${
              loginValue ? "has-content" : ""
            }`}
            type="number"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
          />
          <label className="login__form__input-wrapper__label">Login</label>
          <span className="login__form__input-wrapper__focus-border">
            <i></i>
          </span>
        </div>
        <div className="login__form__input-wrapper">
          <input
            className={`login__form__input-wrapper__input login__form__input-wrapper__input--password ${
              passwordValue ? "has-content" : ""
            }`}
            type="password"
            value={passwordValue}
            minLength={6}
            onChange={(e) => setPasswordValue(e.target.value)}
          />
          <label className="login__form__input-wrapper__label">Password</label>
          <span className="login__form__input-wrapper__focus-border">
            <i></i>
          </span>
        </div>
        <button className="login__form__button" onClick={validate}>
          Submit
        </button>
      </div>
    </main>
  );
}
