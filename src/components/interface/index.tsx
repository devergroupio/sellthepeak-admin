import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
window.onload = () => {
  const target = document.getElementById("ebay_app_container");
  ReactDOM.render(<App />, target);
};
