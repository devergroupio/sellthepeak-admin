// tslint:disable-next-line:no-var-requires
const useLocalStorage = require("react-use-localstorage/dist/react-use-localstorage.cjs.production.min.js")
  .default;

export default (key, defaultValue) => {
  if (typeof window !== "undefined") {
    return useLocalStorage(key, defaultValue);
  } else {
    return [defaultValue, null];
  }
};
