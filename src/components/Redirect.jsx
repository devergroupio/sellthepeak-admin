import Router from "next/router";
import { useEffect } from "react";

export default ({ force = false, to }) => {
  useEffect(() => {
    if (force) {
      window.location.href = to;
    } else {
      Router.push(to);
    }
  }, []);
  return <></>;
};
