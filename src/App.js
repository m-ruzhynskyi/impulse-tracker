import LoginPage from "./Components/loginPage/LoginPage";
import Header from "./Components/Header/Header";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import UserMain from "./user/UserMain";
import Statistic from "./user/Statistic";
import Plan from "./user/Plan";
import Settings from "./user/Settings";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser.email.split("@")[0]);
      else navigate("/login");
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="loader">Завантаження...</div>;
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={user ? <UserMain /> : <LoginPage />} />
        <Route path="/stat" element={user ? <Statistic /> : <LoginPage />} />
        <Route path="/plan" element={user ? <Plan /> : <LoginPage />} />
        <Route path="/settings" element={user ? <Settings /> : <LoginPage />} />
      </Routes>
    </>
  );
}

export default App;
