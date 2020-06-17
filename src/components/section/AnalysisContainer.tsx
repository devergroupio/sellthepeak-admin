import React, { useState, useEffect } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { Button, Modal, ModalBody, Spinner } from "react-bootstrap";
import {
  FETCH_DAY_ANALYSIS_ITEMS,
  FETCH_NAME_CARD,
  FETCH_ID_DEFINED_LIST,
} from "~@/graphql/query";
import AnalysisChart from "./AnalysisChart";
import TableInfinite from "../interface/TableInfinite";

const InputDateSchema = Yup.object().shape({
  startDate: Yup.date().required("Start date cannot be empty."),
  endDate: Yup.string()
    .required("End time cannot be empty.")
    .test(
      "is-greater",
      "End time must be between 'start time' and now.",
      function (value) {
        const { startDate } = this.parent;
        return (
          moment(value).isSameOrAfter(startDate) &&
          moment(value).isSameOrBefore(Date.now())
        );
      }
    ),
});

export default (props) => {
  const IS_MULTI_CHART = props.multiChart;
  const initialDates = {
    startDate: moment().add(-90, "days").format("YYYY-MM-DD"),
    endDate: moment().format("YYYY-MM-DD"),
    defineId: IS_MULTI_CHART ? "" : props.defineId,
  };
  const gqlClient = useApolloClient();
  const [dataChart, setDataChart] = useState({});
  const [dataPSA, setDataPSA] = useState({});
  const [infoChart, setInfoChart] = useState({
    startDate: "",
    endDate: "",
  });
  const [listDefineId, setListDefineId] = useState([props.defineId]);
  const [listDefineIdAndName, setListDefineIdAndName] = useState([]);
  const [listDefineIdDemo, setListDefineIdDemo] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const getDataChart = async (values) => {
    gqlClient
      .query({
        query: FETCH_DAY_ANALYSIS_ITEMS,
        fetchPolicy: "no-cache",
        variables: {
          id: values.defineId,
          fromDate: `${values.startDate}T00:00:00+00:00`,
          toDate: `${values.endDate}T23:59:00+00:00`,
        },
      })
      .then((res) => {
        setInfoChart({
          startDate: values.startDate,
          endDate: values.endDate,
        });
        setListDefineId([values.defineId]);
        if (!IS_MULTI_CHART) {
          setDataChart((prev) => ({
            ...prev,
            chart1: res.data.analysis_items,
          }));
          if (res.data.defined_list[0]) {
            setDataPSA((prev) => ({
              ...prev,
              chart1: res.data.defined_list[0],
            }));
          } else {
            setDataPSA(null);
          }
        } else {
          if (values.defineId === props.defineId) {
            setDataChart((prev) => ({
              ...prev,
              chart1: res.data.analysis_items,
            }));
            if (res.data.defined_list[0]) {
              setDataPSA((prev) => ({
                ...prev,
                chart1: res.data.defined_list[0],
              }));
            } else {
              setDataPSA(null);
            }
          } else {
            setDataChart((prev) => ({
              ...prev,
              chart2: res.data.analysis_items,
            }));

            let newListDefineId = [...listDefineId];
            newListDefineId.splice(1, 1, values.defineId);
            setListDefineId(newListDefineId);

            setDataPSA((prev) => ({
              ...prev,
              chart2: res.data.defined_list[0],
            }));
          }
        }
      });
  };

  const getAllDefinedList = () => {
    gqlClient
      .query({
        query: FETCH_ID_DEFINED_LIST,
        variables: {
          id: props.defineId,
        },
      })
      .then((res) => {
        setListDefineIdDemo(res.data.defined_list);
      });
  };

  useEffect(() => {
    getDataChart({ ...initialDates, defineId: props.defineId });
    if (props.defineList) {
      [props.defineId, ...props.defineList].forEach((item) => {
        gqlClient
          .query({
            query: FETCH_NAME_CARD,
            variables: {
              id: item,
            },
          })
          .then((res) => {
            if (res.data.defined_list.length !== 0) {
              setListDefineIdAndName((prev) => [
                ...prev,
                {
                  label: res.data.defined_list[0].keyword,
                  value: item,
                },
              ]);
            }
          });
      });
    }
    if (IS_MULTI_CHART) {
      getAllDefinedList();
    }
  }, []);
  // const { loading, data } = useQuery(FETCH_ID_DEFINED_LIST);
  // if (loading) return "Loading...";
  return (
    <div className="container mt-3">
      {/* <h2 className="text-center mb-3 mt-3">Analysis</h2> */}
      <p>
        <span className="font-weight-bold">Card: </span>
        <span style={{ marginRight: 10 }}>
          {!dataPSA ? (
            "No data "
          ) : Object.values(dataPSA).length !== 0 ? (
            //@ts-ignore
            Object.values(dataPSA)[0].keyword
          ) : (
            <Spinner className="spinner-offer" animation="border" />
          )}
        </span>
        <Button
          variant="outline-secondary"
          onClick={() => setOpenModal(!openModal)}
          size="sm"
        >
          Show Card Sales History
        </Button>
      </p>
      <Formik
        initialValues={initialDates}
        validationSchema={InputDateSchema}
        onSubmit={(values) => {
          if (!IS_MULTI_CHART) {
            getDataChart({
              ...values,
            });
          } else {
            if (values.defineId) {
              getDataChart({
                ...values,
                defineId: props.defineId,
              });
              getDataChart(values);
            } else {
              getDataChart({
                ...values,
                defineId: props.defineId,
              });
            }
          }
        }}
      >
        {({ handleSubmit, handleChange, handleBlur }) => (
          <div className="row border-top pt-3">
            <div className="col-12 col-sm-6">
              {props.defineList || IS_MULTI_CHART ? (
                <>
                  <label htmlFor="defineId" className="font-weight-bold">
                    Select:&nbsp;
                  </label>
                  <Field
                    as="select"
                    onChange={(e) => {
                      e.persist = () => {};
                      handleChange(e);
                      handleSubmit();
                    }}
                    onBlur={handleBlur}
                    id="defineId"
                    name="defineId"
                    style={{
                      height: 32,
                      backgroundColor: "transparent",
                      marginBottom: 10,
                    }}
                  >
                    {IS_MULTI_CHART ? (
                      <option value="" disabled>
                        Select card other
                      </option>
                    ) : (
                      ""
                    )}
                    {!IS_MULTI_CHART
                      ? listDefineIdAndName.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))
                      : ""}
                    {IS_MULTI_CHART
                      ? listDefineIdDemo.length
                        ? listDefineIdDemo.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.keyword}
                            </option>
                          ))
                        : ""
                      : ""}
                  </Field>
                </>
              ) : (
                ""
              )}
            </div>
            <div
              className="col-12 col-sm-6 text-sm-right row justify-content-sm-end"
              style={{ margin: 0 }}
            >
              <div className="col-12-col-md-6">
                <label htmlFor="startDate" className="font-weight-bold">
                  Date range:&nbsp;
                </label>
                <Field
                  name="startDate"
                  type="date"
                  max={initialDates.endDate}
                  onChange={(e) => {
                    e.persist = () => {};
                    handleChange(e);
                    handleSubmit();
                  }}
                />
                &nbsp;
                <ErrorMessage
                  className="text-danger date-error"
                  name="startDate"
                  component="div"
                />
              </div>
              <div className="col-12-col-md-6">
                <label htmlFor="endDate" className="font-weight-bold">
                  To: &nbsp;
                </label>
                <Field
                  name="endDate"
                  type="date"
                  max={initialDates.endDate}
                  onChange={(e) => {
                    e.persist = () => {};
                    handleChange(e);
                    handleSubmit();
                  }}
                  id="endData"
                />
                <ErrorMessage
                  className="text-danger date-error"
                  name="endDate"
                  component="div"
                />
              </div>
            </div>
          </div>
        )}
      </Formik>
      <AnalysisChart
        dataChart={dataChart}
        infoChart={infoChart}
        listDefineId={listDefineId}
        dataPSA={dataPSA}
      />
      {openModal && (
        <Modal
          size="lg"
          show={openModal}
          onHide={() => setOpenModal(!openModal)}
        >
          {/* <Modal.Header closeButton>{listDefineId[0]}</Modal.Header> */}
          <ModalBody style={{ maxHeight: "80vh", overflow: "auto" }}>
            {openModal && <TableInfinite defineId={listDefineId[0]} />}
          </ModalBody>
        </Modal>
      )}
    </div>
  );
};
