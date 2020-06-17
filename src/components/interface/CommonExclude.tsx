import React, { useState } from "react";
import ExcludeItem from "./ExcludeItem";

const CommonExclude = ({ onCommonExclude, listCommonExclude, selectAll }) => {
  return (
    <>
      {listCommonExclude &&
        listCommonExclude.map((item) => (
          <ExcludeItem
            key={item.id}
            exclude={item}
            onCommonExclude={onCommonExclude}
            selectAll={selectAll}
          />
        ))}
    </>
  );
};

export default CommonExclude;
