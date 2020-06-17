import React, { useCallback, useEffect, useState } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_SALES_CARD_BY_DAY } from "~@/graphql/query";
import ReactTable from "react-table-v6";
import { Button, Modal } from "react-bootstrap";
import { format } from "date-fns";
import { INSERT_DELETE_REQUESTION } from "~@/graphql/mutation";
import OfferResult from "../interface/OfferResult";

const priceState = (data) => {
  switch (data.soldType) {
    case "AUCTION":
      return (
        <>
          <p className="price auction">
            Sale Price:{" "}
            <a href={data.link} target="_blank">
              ${data.price.toFixed(2)}
            </a>
          </p>
          <p className="ebay-shipping-price">
            Shipping:{" "}
            <span>{data.shipping === 0 ? "FREE" : `$${data.shipping}`}</span>
          </p>
          {/* <p className="text-bids">Auction --> Numbers of Bids: {data.bids} </p> */}
        </>
      );
    case "OFFER":
      return (
        <>
          {/* <LazyLoad> */}
          <OfferResult data={data} />
          {/* </LazyLoad> */}
        </>
      );
    case "FIXED":
      return (
        <>
          <p className="price fixed">
            Sale Price: <span>${data.price.toFixed(2)}</span>
          </p>
          <p className="ebay-shipping-price">
            Shipping:{" "}
            <span> {data.shipping === 0 ? "FREE" : `$${data.shipping}`}</span>
          </p>
          {/* <p className="text-fixed">
            Fixed Price Sale - Actual Sale Price Shown
          </p>
          <a href={data.link} target="_blank">
            <Button variant="success" className="btn-fixed">
              Confirm Sale Price
            </Button>
          </a> */}
        </>
      );
    default:
      return "";
  }
};

const ModalSalesByDay = (props) => {
  const [loadingTable, setLoadingTable] = useState(true);
  const [dataTable, setDataTable] = useState([]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [selectDeleteItemId, setSelectDeleteItemId] = useState({});
  const [isHasMore, setIsHasMore] = useState(true);

  const gqlClient = useApolloClient();

  const getMoreSalesCardByDay = useCallback(async () => {
    setLoadingTable(true);
    const fromDate = `${props.info.date}T00:00:00+00:00`;
    const toDate = `${props.info.date}T23:59:00+00:00`;
    const { data, errors } = await gqlClient.query({
      query: FETCH_SALES_CARD_BY_DAY,
      variables: {
        definedId: props.info.defineId,
        fromDate,
        toDate,
        limit: 20,
        offset: dataTable.length,
      },
    });
    if (errors) return null;
    const convertData = data.defined_list_item.map((card) => ({
      id: card.item.id,
      link: card.item._data.link,
      bids: card.item.bids,
      offerPrice: card.item.offerPrice,
      pic: card.item._data.pic,
      price: {
        id: card.item.id,
        price: card.item.price,
        soldType: card.item.soldType,
        shipping: card.item.shipping,
        link: card.item._data.link,
        offerPrice: card.item.offerPrice,
      },
      shipping: card.item.shipping,
      soldDate: card.item.soldDate,
      soldType: card.item.soldType,
      title: card.item._data.title,
    }));
    if (convertData.length === 20) setIsHasMore(true);
    else setIsHasMore(false);

    setLoadingTable(false);
    setDataTable([...dataTable, ...convertData]);
  }, [dataTable, isHasMore, loadingTable]);

  useEffect(() => {
    getMoreSalesCardByDay();
  }, []);

  const columns = [
    {
      Header: "Image",
      id: "image",
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
      Header: "Description",
      id: "item-detail", // Required because our accessor is not a string
      sortable: false,
      accessor: (d) => (
        <div className="item-detail-box" style={{ paddingTop: 10 }}>
          <p className="title">
            <a
              title={d.title}
              style={{ fontSize: 12, marginLeft: 0 }}
              href={d.link}
              target="_blank"
            >
              {d.title}
            </a>
          </p>
        </div>
      ),
    },
    {
      Header: "Date",
      accessor: "soldDate",
      Cell: (props) => {
        const { original } = props;
        return (
          <p style={{ marginBottom: 0, fontSize: 15, marginTop: 50 }}>
            {original.soldDate !== "Invalid date"
              ? format(new Date(original.soldDate), "M-dd-yyyy h:mm aa")
              : original.soldDate}
          </p>
        );
      },
      sortMethod: (a, b) => {
        a = new Date(a).getTime();
        b = new Date(b).getTime();
        return b > a ? 1 : -1;
      },
    },
    {
      Header: "Price",
      accessor: "price",
      Cell: (props) => {
        const { original } = props;
        return (
          <div className="item-detail-box">{priceState(original.price)}</div>
        );
      },
      sortMethod: (a, b) => {
        a = a.price;
        b = b.price;
        return b > a ? 1 : -1;
      },
    },
    {
      Header: "",
      accessor: "report",
      Cell: (props) => {
        const { original } = props;
        return (
          <Button
            style={{ marginTop: 50, textAlign: "center" }}
            variant="warning"
            size="sm"
            className="btn-delete"
            onClick={() => {
              setSelectDeleteItemId(original.id);
              setVisibleModal(true);
            }}
          >
            Report!
          </Button>
        );
      },
      sortable: true,
    },
  ];
  // const TheadComponent = () => null;

  const onDeleteRequestion = () => {
    gqlClient
      .mutate({
        mutation: INSERT_DELETE_REQUESTION,
        variables: {
          item: {
            item_id: selectDeleteItemId,
          },
        },
      })
      .then(() => {
        setDataTable((prev) =>
          prev.filter((item) => item.id !== selectDeleteItemId)
        );
        setVisibleModal(false);
      });
  };
  return (
    <>
      <Modal show={visibleModal} onHide={() => setVisibleModal(false)}>
        <Modal.Body>Are you sure you want to report this item?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVisibleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onDeleteRequestion}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <ReactTable
        style={{
          height: "70vh",
        }}
        columns={columns}
        showPagination={false}
        showPageSizeOptions={false}
        minRows={1}
        data={dataTable}
        pageSize={dataTable.length}
        // TheadComponent={TheadComponent}
        className="r_table_ebay r_table_ebay_modal"
        loading={loadingTable}
      />
      {!loadingTable
        ? isHasMore && (
            <Button
              style={{ margin: "10px 0", float: "right" }}
              onClick={getMoreSalesCardByDay}
            >
              Load More
            </Button>
          )
        : ""}
    </>
  );
};

export default React.memo(ModalSalesByDay);
