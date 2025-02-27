import React, { useEffect, useState } from "react";
import "../../styles/user/settings/editAndUserController/editAndUserController.css";
import { Button, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { db, auth } from "../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ImpulseEdit() {
  const [impulsesInfo, setImpulsesInfo] = useState([{ name: "", key: "" }]);
  const [previousImpulses, setPreviousImpulses] = useState([]);
  const [disableButton, setDisableButton] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const impulseDocRef = doc(db, "info/workers/data", "workers");
        const impulseDoc = await getDoc(impulseDocRef);

        if (impulseDoc.exists()) {
          const data = impulseDoc.data();
          const impulsesArray = Object.entries(data).map(([name, key]) => ({
            name,
            key,
          }));
          setImpulsesInfo(impulsesArray);
          setPreviousImpulses(impulsesArray);
        }
      } catch (error) {
        console.error("Помилка при завантаженні даних:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const updatedImpulses = [...impulsesInfo];
    updatedImpulses[index] = { ...updatedImpulses[index], [name]: value };
    setImpulsesInfo(updatedImpulses);
  };

  const addNewImpulse = () => {
    if (impulsesInfo.length >= 4) return;
    setImpulsesInfo((prev) => [...prev, { name: "", key: "" }]);
  };

  const handleSave = async () => {
    try {
      const filteredImpulses = impulsesInfo.filter(
        (impulse) => impulse.name && impulse.key,
      );

      if (filteredImpulses.length === 0) {
        setSnackbarSeverity("error");
        setSnackbarMessage("Немає даних для збереження!");
        setSnackbarOpen(true);
        return;
      }

      const dataToSave = filteredImpulses.reduce((acc, impulse) => {
        acc[impulse.name] = impulse.key;
        return acc;
      }, {});

      const impulseDocRef = doc(db, "info/workers/data", "workers");
      await setDoc(impulseDocRef, dataToSave);

      for (const impulse of filteredImpulses) {
        const email = `${impulse.key}@email.com`;
        const password = impulse.key;
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log(`Користувач ${email} створений`);
        } catch (error) {
          if (error.code !== "auth/email-already-in-use") throw error;
        }
      }

      setPreviousImpulses(filteredImpulses);
      setSnackbarSeverity("success");
      setSnackbarMessage("Дані успішно збережено!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Помилка при збереженні даних!");
      setSnackbarOpen(true);
      console.error("Помилка:", error);
    }
  };

  useEffect(() => {
    const isDisabled =
      impulsesInfo.length === 1 &&
      impulsesInfo.some((impulse) => !impulse.name || !impulse.key);
    setDisableButton(isDisabled);
  }, [impulsesInfo]);

  return (
    <div className="edit-form__wrapper">
      <div className="edit-form">
        <div className="edit-form__groups__wrapper">
          {impulsesInfo.map(({ name, key }, index) => (
            <div className="edit-form__group" key={index}>
              <input
                type="text"
                className="edit-form__group__input"
                placeholder="Ім'я..."
                name="name"
                value={name}
                onChange={(e) => handleInputChange(e, index)}
              />
              <input
                type="number"
                className="edit-form__group__input"
                placeholder="ID..."
                name="key"
                value={key}
                onChange={(e) => handleInputChange(e, index)}
              />
            </div>
          ))}
        </div>
        <div className="edit-form__button-wrapper">
          <Button
            className="edit-form__button__add"
            variant="contained"
            onClick={addNewImpulse}
          >
            Додати ще
          </Button>
          <Button
            className="edit-form__button__save"
            disabled={disableButton}
            variant="contained"
            onClick={handleSave}
          >
            Зберегти
          </Button>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}
