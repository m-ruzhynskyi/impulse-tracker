import React, { useEffect, useState } from "react";
import "../../styles/user/settings/editAndUserController/editAndUserController.css";
import { Button, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { db } from "../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ImpulseEdit() {
  const [impulsesInfo, setImpulsesInfo] = useState([{ name: "", price: "" }]);
  const [disableButton, setDisableButton] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const impulseDocRef = doc(db, "info/impulse/data", "impulses");
        const impulseDoc = await getDoc(impulseDocRef);

        if (impulseDoc.exists()) {
          const data = impulseDoc.data();
          const impulsesArray = Object.entries(data).map(([name, price]) => ({
            name,
            price,
          }));
          setImpulsesInfo(impulsesArray);
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (event, id) => {
    const { name, value } = event.target;
    const updatedImpulses = [...impulsesInfo];
    updatedImpulses[id] = { ...updatedImpulses[id], [name]: value };
    setImpulsesInfo(updatedImpulses);
  };

  const addNewImpulse = () => {
    if (impulsesInfo.length >= 4) return;
    setImpulsesInfo((prev) => [...prev, { name: "", price: "" }]);
  };

  const handleSave = async () => {
    try {
      const filteredImpulses = impulsesInfo.filter(
        (impulse) => impulse.name && impulse.price,
      );

      const dataToSave = filteredImpulses.reduce((acc, impulse) => {
        acc[impulse.name] = impulse.price;
        return acc;
      }, {});

      const impulseDocRef = doc(db, "info/impulse/data", "impulses");
      await setDoc(impulseDocRef, dataToSave);

      setSnackbarSeverity("success");
      setSnackbarMessage("Дані успішно збережено!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Помилка при збереженні даних!");
      setSnackbarOpen(true);
      console.error("Ошибка при сохранении данных:", error);
    }
  };

  useEffect(() => {
    const isDisabled =
      impulsesInfo.length === 1 &&
      impulsesInfo.some((impulse) => !impulse.name || !impulse.price);
    setDisableButton(isDisabled);
  }, [impulsesInfo]);

  return (
    <div className="edit-form__wrapper">
      <div className="edit-form">
        <div className="edit-form__groups__wrapper">
          {impulsesInfo.map(({ name, price }, index) => (
            <div className="edit-form__group" key={index}>
              <input
                type="text"
                className="edit-form__group__input"
                placeholder="Назва..."
                name="name"
                value={name}
                onChange={(e) => handleInputChange(e, index)}
              />
              <input
                type="number"
                className="edit-form__group__input"
                placeholder="Ціна..."
                name="price"
                value={price}
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
