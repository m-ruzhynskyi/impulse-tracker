import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global/index.css";
import { HashRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("wrapper"));
root.render(
  <HashRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </HashRouter>
);
