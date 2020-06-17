import React, { useState } from "react";
import moment from "moment";
import { Line } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";
import { Modal } from "react-bootstrap";
import ModalSalesByDay from "./ModalSalesByDay";
import DisplayPSA from "./DisplayPSA";

const renderAnalysisTotal = (chartFirst, cardName, dataAnalysis) => {
  let sumItem = 0;
  let sumPrice = 0;
  dataAnalysis.forEach((element) => {
    sumItem += element.total_items;
    sumPrice += element.avg_price * element.total_items;
  });
  return (
    <div className="analysis_total" style={{ textAlign: "right" }}>
      <div>
        <span className="head"></span>
        <h4
          style={{ fontWeight: "bold", color: chartFirst ? "#d35400" : "blue" }}
        >
          {cardName}
        </h4>
      </div>
      <div>
        <span className="head">Total Items : </span>
        <span>{sumItem}</span>
      </div>
      {/* <div>
      <span className="head">Sum Min Price : </span>
      <span>{sumMinPrice.toFixed(2)} $</span>
    </div>
    <div>
      <span className="head">Sum Max Price : </span>
      <span>{sumMaxPrice.toFixed(2)} $</span>
    </div> */}
      <div>
        <span className="head">AVG Price : </span>
        <span>${(sumPrice / sumItem).toFixed(2)}</span>
      </div>
    </div>
  );
};

const dataSetsChart = {
  labels: [],
  datasets: [
    {
      label: "Avg price",
      fill: false,
      data: [],
      borderColor: "#d35400",
      borderWidth: 1,
    },
    {
      label: "Avg price 2",
      fill: false,
      data: [],
      borderColor: "blue",
      borderWidth: 1,
    },
  ],
};

const getDates = (startDate, endDate) => {
  startDate = moment(startDate);
  endDate = moment(endDate);
  let now = startDate,
    dates = [];
  while (now.isBefore(endDate) || now.isSame(endDate)) {
    dates.push(now.format("MM DD YYYY"));
    now.add(2, "days");
  }
  // if (!dates.includes(endDate.format("MM DD YYYY"))) {
  //   dates.push(endDate.format("MM DD YYYY"));
  // }
  return dates;
};

const serializeData = (data) => {
  // let result;
  // const dates = getDates(data.startDate, data.endDate);
  const covertData = data.map((elem) => ({
    ...elem,
    x: `${elem.month ? elem.month : 1}-${elem.day ? elem.day : 1}-${elem.year}`,
    y: elem.avg_price.toFixed(2),
  }));
  // result = dates.map((date) => {
  //   const findIndex = covertData.findIndex((item) =>
  //     moment(item.x).isSame(date, "days")
  //   );
  //   if (findIndex < 0) {
  //     return { x: date, y: 0, total_items: 0, max_price: 0, min_price: 0 };
  //   }
  //   return { ...covertData[findIndex] };
  // });
  return covertData;
};

export default (props) => {
  const { dataChart, listDefineId, infoChart, dataPSA } = props;
  const [modalShow, setModalShow] = useState(false);
  const [selectDay, setSelectDay] = useState({ defineId: "", date: "" });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    tooltips: {
      callbacks: {
        label: () => {
          return "";
        },
        afterLabel: (tooltipItem, data) => {
          const dataset =
            data["datasets"][tooltipItem.datasetIndex]["data"][
              tooltipItem["index"]
            ];
          return [
            `AVG$ ${dataset.y}`,
            `MAX$ ${dataset.max_price.toFixed(2)}`,
            `MIN$ ${dataset.min_price.toFixed(2)}`,
            `TOTAL SALES: ${dataset.total_items}`,
          ];
        },
      },
    },
    scales: {
      xAxes: [
        {
          ticks: {
            source: "labels",
            autoSkip: true,
            stepSize: 20,
          },
          bounds: "ticks",
          type: "time",
          time: {
            unit: "day",
            displayFormats: { day: "MMM DD YYYY" },
            stepSize: 20,
            autoSkip: true,
          },
          scaleLabel: {
            display: false,
            labelString: "Date",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            callback: function (value, index, values) {
              return "$" + value;
            },
          },
          scaleLabel: {
            display: false,
            labelString: "Price",
          },
        },
      ],
    },
  };
  if (!dataChart.chart1) {
    return (
      <div className="text-center mt-3">
        <Spinner className="spinner-offer" animation="border" />
      </div>
    );
  }
  if (!dataChart.chart1.length) {
    return (
      <p className="font-weight-bold text-center mt-2 border-top pt-5">
        No data. Comming soon
      </p>
    );
  }
  Object.values(dataChart).forEach((item, index) => {
    dataSetsChart.datasets[index].data = serializeData(item);
  });
  dataSetsChart.labels = getDates(infoChart.startDate, infoChart.endDate);
  return (
    <div className="mt-3">
      <Modal
        size="lg"
        show={modalShow}
        onHide={() => setModalShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Sales History: {selectDay.defineId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflow: "auto" }}>
          <ModalSalesByDay
            info={{ defineId: selectDay.defineId, date: selectDay.date }}
          />
        </Modal.Body>
      </Modal>
      <div style={{ height: "60vh" }}>
        <Line
          data={dataSetsChart}
          options={options}
          getElementAtEvent={(elems) => {
            if (elems.length) {
              const datasetIndex = elems[0]._datasetIndex;
              const indx = elems[0]._index;
              setSelectDay({
                defineId: listDefineId[datasetIndex],
                date: `${Object.values(dataChart)[datasetIndex][indx].year}-${
                  Object.values(dataChart)[datasetIndex][indx].month
                }-${Object.values(dataChart)[datasetIndex][indx].day}`,
              });
              setModalShow(true);
            }
          }}
        />
      </div>
      <div>
        {Object.values(dataPSA).length
          ? Object.values(dataPSA).map((item: any, index) => (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <DisplayPSA data={item} chartFirst={index === 0} />
                {renderAnalysisTotal(
                  index === 0,
                  item.keyword,
                  Object.values(dataChart)[index]
                )}
              </div>
            ))
          : ""}
      </div>
    </div>
  );
};
