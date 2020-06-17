import React, { useState, useCallback, useEffect } from "react";
import ReactTable from "react-table-v6";
import { Button, Modal } from "react-bootstrap";
import { useApolloClient } from "@apollo/react-hooks";
import OfferResult from "../interface/OfferResult";
import { format } from "date-fns";
import { FETCH_MORE_DEFINED_ITEM } from "~@/graphql/query";
import { INSERT_DELETE_REQUESTION } from "~@/graphql/mutation";

const TableInfinite = (props) => {
  const gqlClient = useApolloClient();
  const [dataTable, setDataTable] = useState([]);
  const [isHasMore, setIsHasMore] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [selectDeleteItemId, setSelectDeleteItemId] = useState({});
  const [visibleModal, setVisibleModal] = useState(false);

  useEffect(() => {
    fetchMoreItem();
  }, []);

  const fetchMoreItem = useCallback(async () => {
    setLoadingTable(true);
    const { data, errors } = await gqlClient.query({
      query: FETCH_MORE_DEFINED_ITEM,
      variables: {
        limit: 20,
        list_id: props.defineId,
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
    // const newData = dataTable.concat(convertData);
    setDataTable([...dataTable, ...convertData]);
  }, [dataTable, isHasMore, loadingTable]);

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
              <span>
                {data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
              </span>
            </p>
            {/* <p className="text-bids">
              Auction --> Numbers of Bids: {data.bids}{" "}
            </p> */}
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
      default:
        // "FIXED"
        return (
          <>
            <p className="price fixed">
              Sale Price: <span>${data.price.toFixed(2)}</span>
            </p>
            <p className="ebay-shipping-price">
              Shipping:{" "}
              <span>
                {" "}
                {data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
              </span>
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
    }
  };
  // This is ma

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
      });
  };

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
        <div className="item-detail-box" style={{ paddingTop: 0 }}>
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
        showPageSizeOptions={false}
        showPagination={false}
        minRows={1}
        pageSize={dataTable.length}
        data={dataTable}
        resolveData={(data) => data.map((row) => row)}
        // TheadComponent={TheadComponent}
        className="r_table_ebay r_table_ebay_modal"
        loading={loadingTable}
      />
      {isHasMore && (
        <Button
          style={{ margin: "10px 0", float: "right" }}
          onClick={fetchMoreItem}
        >
          Load More
        </Button>
      )}
    </>
  );
};
export default TableInfinite;
