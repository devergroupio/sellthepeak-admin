import React, { useState, useEffect, useReducer } from "react";
import { FETCH_COMMON_EXCLUDE_LIST } from "~@/graphql/query";
import "./style.scss";
import { useApolloClient } from "@apollo/react-hooks";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { format } from "date-fns";
import { Container, Form, Row, Col, Button, Spinner } from "react-bootstrap";
import LazyLoad from "react-lazyload";
import OfferResult from "./OfferResult";
import CommonExclude from "./CommonExclude";
import { Formik, Field, ErrorMessage } from "formik";
import _ from "lodash";
import { CS_CONFIG } from "~@/utils";

const reducerCommonExclude = (listCommonExclude, action) => {
  switch (action.type) {
    case "SET_LIST_COMMON_EXCLUDE": {
      return action.payload.map((exclude) => ({
        ...exclude,
        exclude_words: exclude.exclude_words.map((word) => ({
          label: word,
          isChecked: false,
        })),
      }));
    }
    case "CHECK_EXCLUDE": {
      const { type, label } = action.payload;
      return listCommonExclude.map((exclude) => {
        if (exclude.type === type) {
          return {
            ...exclude,
            exclude_words: exclude.exclude_words.map((word) => {
              if (word.label === label)
                return {
                  ...word,
                  isChecked: true,
                };
              else return word;
            }),
          };
        }
        return exclude;
      });
    }
    case "DECHECK_EXCLUDE": {
      const { type, label } = action.payload;
      return listCommonExclude.map((exclude) => {
        if (exclude.type === type) {
          return {
            ...exclude,
            exclude_words: exclude.exclude_words.map((word) => {
              if (word.label === label)
                return {
                  ...word,
                  isChecked: false,
                };
              else return word;
            }),
          };
        }
        return exclude;
      });
    }
    case "SELECT_ALL": {
      return listCommonExclude.map((exclude) => ({
        ...exclude,
        exclude_words: exclude.exclude_words.map((word) => ({
          ...word,
          isChecked: true,
        })),
      }));
    }
    case "DE_SELECT_ALL": {
      return listCommonExclude.map((exclude) => ({
        ...exclude,
        exclude_words: exclude.exclude_words.map((word) => ({
          ...word,
          isChecked: false,
        })),
      }));
    }
    default:
      return listCommonExclude;
  }
};

export default () => {
  const hsrClient = useApolloClient();
  const typeOptions = [
    {
      id: 1,
      value: "type-1",
      label: "Sold Items",
    },
    {
      id: 2,
      value: "type-2",
      label: "Sale Items",
    },
    {
      id: 3,
      value: "type-3",
      label: "Items For Sale - Buy It Now",
    },
    {
      id: 4,
      value: "type-4",
      label: "Items For Sale - Newly Listed",
    },
    {
      id: 5,
      value: "type-5",
      label: "Items For Sale - Ending Soon",
    },
    {
      id: 6,
      value: "type-6",
      label: "Items For Sale - Ending Soon With <5 bids",
    },
  ];
  const catOptions = [
    {
      id: 1,
      value: "all",
      label: "All Categories",
    },
    {
      id: 2,
      value: "cat-1",
      label: "Sports Mem, Cards & Fan Shop ",
    },
    {
      id: 3,
      value: "cate-2",
      label: "Toys & Hobbies",
    },
    {
      id: 4,
      value: "cate-3",
      label: "Video Games & Consoles ",
    },
    {
      id: 5,
      value: "cate-4",
      label: "Entertainment Memorabilia ",
    },
    {
      id: 6,
      value: "cate-5",
      label: "Coins & Paper Money ",
    },
    {
      id: 7,
      value: "cate-6",
      label: "Stamps ",
    },
  ];
  const subCateOptions = [
    {
      id: 1,
      value: "none",
      label: "None",
    },
    {
      id: 2,
      value: "sub-1",
      label: "Autographs-Original ",
    },
    {
      id: 3,
      value: "sub-2",
      label: "Autographs-Reprints ",
    },
    {
      id: 4,
      value: "sub-3",
      label: "Movie Memorabilia",
    },
    {
      id: 5,
      value: "sub-4",
      label: "Music Memorabilia ",
    },
    {
      id: 6,
      value: "sub-5",
      label: "Other Entertainment Mem",
    },
    {
      id: 7,
      value: "sub-6",
      label: "Television Memorabilia ",
    },
    {
      id: 8,
      value: "sub-7",
      label: "Theater Memorabilia ",
    },
    {
      id: 9,
      value: "sub-8",
      label: "Video Game Memorabilia",
    },
  ];

  const [commonExclude, setCommonExclude] = useState();
  const [selectedAllExclude, setSelectAllClude] = useState(false);
  const [listCommonExclude, dispatch] = useReducer(reducerCommonExclude, []);
  const [inputs, setInputs] = useState({
    keyword: "",
    exclude: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({
    show: false,
    run: false,
    loadTable: false,
  });
  const [dataMock, setDataMock] = useState<any>({});
  const priceState = (data) => {
    switch (data.soldType) {
      case "AUCTION":
        return (
          <>
            <p className="price auction">
              Sale Price:{" "}
              <a href={data.link} target="_blank" className="price-big">
                ${data.price.toFixed(2)}
              </a>
            </p>
            <p className="ebay-shipping-price">
              Shipping:{" "}
              <span>
                {data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
              </span>
            </p>
            <p className="text-bids">
              {"Auction --> Numbers of Bids:"} {data.bids}
            </p>
          </>
        );
      case "OFFER":
        return (
          <>
            {/* <p className="price offer">
                            Sale Price: <span>{data.price} $</span>
                        </p>
                        <p className="ebay-shipping-price">
                            Shipping: <span>{data.shipping}</span>
                        </p>
                        <p className="text-offer">Best Offer Sale - Loading Actual Sold Price</p> */}
            <LazyLoad height={762} offsetVertical={300} once={true}>
              <OfferResult data={data} />
            </LazyLoad>
          </>
        );
      case "FIXED":
        return (
          <>
            <p className="price fixed">
              Sale Price:{" "}
              <span className="price-big">${data.price.toFixed(2)}</span>
            </p>
            <p className="ebay-shipping-price">
              Shipping:{" "}
              <span>
                {" "}
                {data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
              </span>
            </p>
            <p className="text-fixed">
              Fixed Price Sale - Actual Sale Price Shown
            </p>
          </>
        );
      default:
        return "";
    }
  };
  // This is make react table not have HEADER
  const TheadComponent = (props) => null;
  const columns = [
    {
      id: "image",
      width: 400,
      sortable: false,
      Cell: (props) => {
        const { original } = props;
        return (
          <div className="img-item-wrapper">
            <a target="_blank" href={original.pic}>
              <img src={original.pic} />
            </a>
          </div>
        );
      }, // Custom cell components!
    },
    {
      id: "item-detail", // Required because our accessor is not a string
      sortable: false,
      accessor: (d) => (
        <div className="item-detail-box">
          <p className="title">
            <b>Title:</b>{" "}
            <a title={d.title} href={d.link} target="_blank">
              {d.title}
            </a>
          </p>
          {priceState(d)}
          <p className="time">
            <b>Date: </b>
            {d.soldDate !== "Invalid date"
              ? format(new Date(d.soldDate), "dd MMM yyyy h:mm aa")
              : d.soldDate}
          </p>
        </div>
      ),
      // Custom value accessors!
    },
  ];
  const countPageSize = (total, itemPerRow) => {
    if (itemPerRow < 100) return 1;
    else {
      //@ts-ignore
      if (total % itemPerRow === 0) return parseInt(total / itemPerRow);
      //@ts-ignore
      else return parseInt(total / itemPerRow) + 1;
    }
  };
  const handlePageClick = (data) => {
    let selected = data.selected;
    setCurrentPage(selected + 1);
    let excludeWords = "";
    let arrayExcludeWords = [];
    listCommonExclude.forEach((exclude) => {
      exclude.exclude_words.forEach((word) => {
        if (word.isChecked) arrayExcludeWords.push(word.label);
      });
    });
    excludeWords = arrayExcludeWords.join(", ");
    const dataPost = {
      keyword: inputs.keyword,
      exclude: inputs.exclude.length
        ? excludeWords.length
          ? `${excludeWords}, ${inputs.exclude}`
          : inputs.exclude
        : excludeWords,
      pageNumber: selected + 1,
    };
    setLoading({ show: false, run: false, loadTable: true });
    axios
      .post(`${CS_CONFIG.API_INTERFACE_ENDPOINT}/search`, dataPost)
      .then((result) => {
        setDataMock(result.data);
        setLoading({ ...loading, loadTable: false });
      });
  };
  const getCommonsExclude = () => {
    hsrClient
      .query({
        query: FETCH_COMMON_EXCLUDE_LIST,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        dispatch({
          type: "SET_LIST_COMMON_EXCLUDE",
          payload: res.data.common_exclude_list,
        });
      });
  };
  const checkCommonExclude = (type, label, isChecked) => {
    if (isChecked) {
      dispatch({
        type: "DECHECK_EXCLUDE",
        payload: {
          type,
          label,
        },
      });
    } else {
      dispatch({
        type: "CHECK_EXCLUDE",
        payload: {
          type,
          label,
        },
      });
    }
  };

  const handleSelectAllExclude = () => {
    if (!selectedAllExclude) {
      dispatch({
        type: "SELECT_ALL",
      });
    } else
      dispatch({
        type: "DE_SELECT_ALL",
      });

    setSelectAllClude(!selectedAllExclude);
  };
  useEffect(() => getCommonsExclude(), []);
  return (
    <>
      <Container className="form-ebay">
        <Formik
          initialValues={{
            keyword: "",
            exclude: "",
          }}
          validate={(values) => {
            const errors: any = {};
            if (!values.keyword) {
              errors.keyword = "This field is required";
            }
            return errors;
          }}
          onSubmit={(values) => {
            setInputs({ ...values });
            let excludeWords = "";
            let arrayExcludeWords = [];
            listCommonExclude.forEach((exclude) => {
              exclude.exclude_words.forEach((word) => {
                if (word.isChecked) arrayExcludeWords.push(word.label);
              });
            });
            excludeWords = arrayExcludeWords.join(", ");
            const data = {
              ...values,
              pageNumber: 1,
              exclude: values.exclude.length
                ? excludeWords.length
                  ? `${excludeWords}, ${values.exclude}`
                  : values.exclude
                : excludeWords,
            };
            //@ts-ignore
            setLoading({ show: false, run: true });
            axios
              .post(`${CS_CONFIG.API_INTERFACE_ENDPOINT}/search`, data)
              .then((result) => {
                setDataMock(result.data);
                setLoading({ show: false, run: false, loadTable: false });
              });
          }}
          //@ts-ignore
          handleChange={({ setSubmitting }) => {
            setSubmitting(false);
          }}
        >
          {({
            handleChange,
            handleSubmit,
            values,
            /* and other goodies */
          }) => (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              <Form.Group as={Row} controlId="formGroupEmail">
                <Form.Label column lg={{ span: 2, offset: 1 }} sm={12}>
                  Search
                </Form.Label>
                <Col lg={6} sm={12}>
                  <Form.Control
                    autoFocus
                    name="keyword"
                    type="text"
                    onChange={handleChange}
                    className="form-control"
                  />
                  <ErrorMessage
                    className="ebay-text-error "
                    name="keyword"
                    component="div"
                  />
                </Col>
                <Col lg={2} sm={12}>
                  <Button
                    variant="primary"
                    type="submit"
                    onClick={() => {
                      if (values.keyword) {
                        const eleResult = document.getElementById("result");
                        eleResult.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                          inline: "end",
                        });
                      }
                    }}
                    className="btn_search_submit  float-left"
                  >
                    SUBMIT
                  </Button>
                </Col>
              </Form.Group>
              <Form.Group as={Row} className="mt-1 mt-md-0">
                <Form.Label column lg={{ span: 2, offset: 1 }} sm={12}>
                  Manual Exclusions
                </Form.Label>
                <Col lg={7} sm={12}>
                  <Field
                    name="exclude"
                    type="text"
                    onChange={handleChange}
                    className="form-control"
                  />
                  <span className="separate-text">
                    Separate with comma why not
                  </span>
                </Col>
              </Form.Group>

              <Form.Group as={Row}>
                <Col
                  lg={{ span: 2, offset: 1 }}
                  md={3}
                  sm={12}
                  className="d-none d-md-block"
                >
                  <Form.Label>Quick Exclude List</Form.Label>
                  <Form.Check
                    checked={selectedAllExclude}
                    label="Select All"
                    id="all"
                    onChange={handleSelectAllExclude}
                  />
                </Col>
                <Col
                  className="commons_exclude_list"
                  lg={{ span: 9 }}
                  md={9}
                  sm={12}
                >
                  <div
                    className="exclude_type_wrapper d-block d-md-none"
                    style={{ alignSelf: "center" }}
                  >
                    <div className="exclude_word_wrapper">
                      <div className="column_exclude">
                        <Form.Label>Quick Choice</Form.Label>
                        <Form.Check
                          checked={selectedAllExclude}
                          label="Select All"
                          id="all"
                          onChange={handleSelectAllExclude}
                        />
                      </div>
                    </div>
                  </div>
                  <CommonExclude
                    onCommonExclude={checkCommonExclude}
                    listCommonExclude={listCommonExclude}
                    selectAll={selectedAllExclude}
                  />
                </Col>
              </Form.Group>
            </Form>
          )}
        </Formik>
      </Container>
      <a id="result">
        {dataMock.itemsPerPage && !loading.show && !loading.run ? (
          <Container className="result-wrapper">
            {dataMock.currentItems.length === 0 ? (
              <Col lg={{ span: 9, offset: 3 }}>
                <h2 className="text-left font-weight-bold ebay-text-orange">
                  Your searching is Not Found ^_^
                </h2>
              </Col>
            ) : (
              <>
                {/* <h2 className="text-center">
                                Sold eBay Items Search Results for: <span className="text-search">{currentSearch}</span>
                            </h2>
                            <h4 className="text-center">
                                Total Number of Results:
                                <span style={{ color: "orange" }}> {dataMock.totalItems}</span>
                            </h4> */}
                <h1
                  className="text-center font-italic"
                  style={{ color: "orange" }}
                >
                  Sales History
                </h1>

                {loading.loadTable ? (
                  <Container className="spinner-wrapper-paging spinner-table">
                    <h4 className="text-center w-100">
                      Loading search result ....
                    </h4>
                    <Spinner animation="border" />
                  </Container>
                ) : (
                  <div className="box-result-search d-flex flex-wrap">
                    {dataMock.currentItems.map((item) => (
                      <div key={item.id} className="box-result-search__item">
                        <p className="box-result-search__title">
                          <span
                            style={{ fontWeight: "bold", fontSize: "14px" }}
                          >
                            Title:
                          </span>{" "}
                          <a
                            title={item.title}
                            href={item.link}
                            target="_blank"
                          >
                            {item.title}
                          </a>
                        </p>
                        <div className="d-flex">
                          <div
                            className="item-detail-box p-0 text-left"
                            style={{ flex: 1 }}
                          >
                            {priceState(item)}
                            <p className="time">
                              <b>Date: </b>
                              {item.soldDate !== "Invalid date"
                                ? format(
                                    new Date(item.soldDate),
                                    "MM-dd-yyyy h:mm aa"
                                  )
                                : item.soldDate}
                            </p>
                          </div>
                          <div className="box-result-search__img">
                            <a target="_blank" href={item.pic}>
                              <img width="100%" src={item.pic} />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  // <ReactTable
                  //   data={dataMock.currentItems}
                  //   columns={columns}
                  //   showPageSizeOptions={false}
                  //   minRows={1}
                  //   defaultPageSize={dataMock.itemsPerPage}
                  //   showPagination={false}
                  //   TheadComponent={TheadComponent}
                  //   className="r_table_ebay"
                  // />
                )}
                <ReactPaginate
                  pageRangeDisplayed={2}
                  onPageChange={handlePageClick}
                  pageCount={
                    countPageSize(dataMock.totalItems, dataMock.itemsPerPage) <
                    21
                      ? countPageSize(
                          dataMock.totalItems,
                          dataMock.itemsPerPage
                        )
                      : 20
                  }
                  containerClassName="ebay_pagination"
                  activeClassName={"p-active"}
                />
              </>
            )}
          </Container>
        ) : loading.run ? (
          <Container className="ebay-spinner-wrapper">
            <h1></h1>
            <h4 className="text-center w-100">Loading search result ....</h4>
            <Spinner animation="border" />
          </Container>
        ) : null}
      </a>
    </>
  );
};

{
  /* <Form.Group as={Row} controlId="exampleForm.ControlSelect1">
            <Form.Label column lg={2} sm={12}>
              Search Type:{" "}
            </Form.Label>
            <Col lg={10} sm={12}>
              <Form.Control as="select">
                {typeOptions.map(option => (
                  <option
                    key={option.id}
                    defaultChecked={option.id === 1 && true}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Form.Group> */
}
{
  /* Category */
}
{
  /* <Form.Group as={Row} controlId="exampleForm.ControlSelect1">
            <Form.Label column lg={2} sm={12}>
              Category:
            </Form.Label>
            <Col lg={10} sm={12}>
              <Form.Control as="select">
                {catOptions.map(option => (
                  <option
                    key={option.id}
                    defaultChecked={option.id === 1 && true}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Form.Group> */
}
{
  /* Sub Categories */
}
{
  /* <Form.Group as={Row} controlId="exampleForm.ControlSelect1">
            <Form.Label column lg={2} sm={12}>
              Sub-Category:
            </Form.Label>
            <Col lg={10} sm={12}>
              <Form.Control as="select">
                {subCateOptions.map(option => (
                  <option
                    key={option.id}
                    defaultChecked={option.id === 1 && true}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </Form.Control>
            </Col>
          </Form.Group> */
}
{
  /* Exclude  */
}
{
  /* Best Offer */
}
{
  /* <Form.Group as={Row}>
          <Form.Label as="legend" column lg={2} sm={12}>
            Radios
          </Form.Label>
          <Col lg={10} sm={12}>
            <Row>
              <Form.Check
                type="radio"
                label="Yes"
                value="yes"
                name="formHorizontalRadios"
                id="formHorizontalRadios1"
              />
              <Form.Check
                type="radio"
                label="No"
                value="no"
                name="formHorizontalRadios"
                id="formHorizontalRadios2"
              />
              <span>
                <b>NOTE: </b>Only applies to
                <mark>
                  <b>SOLD</b>
                </mark>
                listings
              </span>
            </Row>
          </Col>
        </Form.Group> */
}
{
  /* <Form.Group as={Row}>
          <Form.Label column lg={2} sm={12}>
            {!toggle ? "Include Best Offers" : "Detailed Results"}
          </Form.Label>
          <div class="custom-control custom-switch">
            <input
              type="checkbox"
              class="custom-control-input"
              id="customSwitches"
              onChange={handleToggle}
            />
            <label class="custom-control-label" for="customSwitches">
              {!toggle ? "" : "Recommended for screens wider than 800px"}
            </label>
          </div>
        </Form.Group> */
}
{
  /* Modal Search  */
}
{
  /* <Col lg={{ span: 10, offset: 2 }}>
            <button type="button" onClick={handleModalSearch}>
              {modal ? "x Basic Search" : "+ Advanced Search"}
            </button>
            <div className="modal-search"></div>
          </Col> */
}

{
  /* <div className="sumary-box">
          <h4 className="text-center">Realised Sales Summary</h4>
          <table class="table table-bordered">
            <thead class="thead-dark">
              <tr>
                <th scope="col">Sum Total of 68 Recent Sales</th>
                <th scope="col">Min Sale Price</th>
                <th scope="col">Max Sale Price</th>
                <th scope="col">Avg Sale Price (68 Sales) </th>
                <th scope="col">Avg 30 Day Sale Price (68 Sales)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">$1,532.06 USD</th>
                <td>$0.99 USD</td>
                <td>$94.10 USD</td>
                <td>$22.53 USD</td>
                <td>$22.53 USD</td>
              </tr>
            </tbody>
          </table>
        </div> */
}
