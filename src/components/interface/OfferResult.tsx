import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import { CS_CONFIG } from "~@/utils";

const OfferResult = (props) => {
  const { data } = props;
  const [loading, setLoading] = useState(true);
  const [dataMock, setDataMock] = useState<any>({});
  const [errorMock, setErrorMock] = useState(false);
  const fetchData = () => {
    axios
      .get(`${CS_CONFIG.API_INTERFACE_ENDPOINT}/bestOffer/${data.id}`)
      .then((result) => {
        const up = {
          error: result.data.error,
          offerPrice: result.data.payload.offerPrice,
          link: result.data.payload.link,
        };
        if (up.offerPrice === null) {
          setErrorMock(true);
        }
        setDataMock(up);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setErrorMock(true);
      });
  };
  return (
    <>
      {!errorMock && loading && fetchData()}
      {loading ? (
        <>
          <p className="price offer">
            Sale Price:{" "}
            <span className="price-big">${data.price.toFixed(2)}</span>
          </p>
          <p className="ebay-shipping-price">
            Shipping:{" "}
            <span>
              {data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
            </span>
          </p>
          <p className="text-offer">
            Best Offer Sale - Loading Actual Sold Price
          </p>
          <Spinner className="spinner-offer" animation="border" />
        </>
      ) : !dataMock.error && !errorMock ? (
        <>
          {/* <p className="price offer">
            Sale Price:{" "}
            <span className="price-big">${data.price.toFixed(2)}</span>
          </p> */}
          <p
            className="result-offer"
            style={{ display: "flex", alignItems: "center" }}
          >
            <span style={{ color: "#333" }}>Sale Price: </span>
            <a href={dataMock.link} style={{ fontSize: 25 }} target="_blank">
              ${dataMock.offerPrice}
            </a>
            <span
              style={{ width: 60, fontSize: 12, marginLeft: 10, color: "#333" }}
            >
              Best Offer Accepted
            </span>
          </p>
          <p className="ebay-shipping-price">
            Shipping:{" "}
            <span>
              {data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
            </span>
          </p>
        </>
      ) : (
        <>
          <p className="price offer">
            Sale Price:{" "}
            <span className="price-big">${data.price.toFixed(2)}</span>
          </p>
          <p className="ebay-shipping-price">
            Shipping:{" "}
            <span>
              {data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
            </span>
          </p>
          <p className="text-offer">Unknow Offer Price</p>
        </>
      )}
    </>
  );
};
export default OfferResult;
