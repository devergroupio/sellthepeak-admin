import React from "react";

const theadTable = ["", "AUTH", 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, "TOTAL"];

const DisplayPSA = ({ data, chartFirst }) => {
  if (!data) {
    return <div></div>;
  }
  const { psa_link, psa_data, psa_line } = data;
  if (!psa_data) {
    return <div></div>;
  }
  return (
    <div className="table_container">
      <h5 style={{ textAlign: "center", margin: "15px 0 -15px 0" }}>
        PSA POPULATION REPORT
      </h5>
      <table className="table_psa">
        <thead>
          <tr className={chartFirst ? "" : "blue"}>
            {theadTable.map((thead) => (
              <th key={thead}>{thead}</th>
            ))}
          </tr>
        </thead>
        <tbody dangerouslySetInnerHTML={{ __html: psa_data }} />
      </table>
    </div>
  );
};

export default DisplayPSA;
