// import { useState } from "react";
import useLocalStorage from "./UseLocalStorage";

const defaultValue = {
  user: null,
  setUser: null,
};

const AppContext = React.createContext(defaultValue);

export const AppProvider = (props) => {
  const [login, setLogin] = useLocalStorage("loginSellThePeak", null);
  const setUser = () => {
    setLogin("ok");
  };
  const user = login;
  return (
    <AppContext.Provider value={{ ...defaultValue, user, setUser }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContext;
