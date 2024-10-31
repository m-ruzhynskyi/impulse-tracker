import LoginPage from "./common/loginPage/LoginPage";
import Header from "./Components/Header/Header";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { auth } from "./firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import AdminMain from "./admin/AdminMain";
import UserMain from "./user/UserMain";

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
        <Route path="/" element={user === '000000' ? <AdminMain/>:<UserMain/> }/>
      </Routes>
    </>
  );
}

export default App;
