import { LoadingOutlined } from "@ant-design/icons";
import React, { useState, useCallback } from "react";
import { Spin } from "antd";
import axios from "axios";
import { css } from "@emotion/core";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


const OfferResult = (props) => {
	const { data } = props;
	const [loading, setLoading] = useState(true);
	const [dataMock, setDataMock] = useState<any>({});
	const [errorMock, setErrorMock] = useState(false);
	const fetchData = useCallback(() => {
		axios
			.post(`${process.env.API_INTERFACE_ENDPOINT}/bestOffer/`, {
				item: data,
			})
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
	}, []);
	return (
		<>
			{!errorMock && loading && fetchData()}
			{loading ? (
				<>
					<p className="price offer">
						<span
							css={css`
								font-size: 14px;
								padding-right: 5px;
							`}
						>
							Sale Price:
						</span>
						<span
							css={css`
								color: #008000;
							`}
						>
							${data.price.toFixed(2)}
						</span>
					</p>
					<p className="ebay-shipping-price">
						<span
							css={css`
								font-size: 14px;
								padding-right: 5px;
							`}
						>
							Shipping:
						</span>
						<span
							css={css`
								color: #008000;
							`}
						>
							{data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
						</span>
					</p>
					<p className="">Best Offer Sale - Loading Actual Sold Price</p>
					<Spin indicator={antIcon} />
				</>
			) : !dataMock.error && !errorMock ? (
				<>
					{/* <p className="price offer">
            Sale Price:{" "}
            <span className="price-big">${data.price.toFixed(2)}</span>
          </p> */}
					<p>
						<span
							css={css`
								font-size: 14px;
								padding-right: 5px;
							`}
						>
							Sale Price:
						</span>
						<a
							href={dataMock.link}
							css={css`
								color: #008000;
								text-decoration: underline;
							`}
							target="_blank"
						>
							${dataMock.offerPrice && dataMock.offerPrice.toFixed(2)}
						</a>
					</p>
					<p>
						<small
							css={css`
								color: #232323;
							`}
						>
							( Best Offer Accepted )
						</small>
					</p>
					<p className="ebay-shipping-price">
						<span
							css={css`
								font-size: 14px;
								padding-right: 5px;
							`}
						>
							Shipping:
						</span>
						<span
							css={css`
								color: #008000;
							`}
						>
							{data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
						</span>
					</p>
				</>
			) : (
				<>
					<p className="price offer">
						<span
							css={css`
								font-size: 14px;
								padding-right: 5px;
							`}
						>
							Sale Price:
						</span>
						<span
							css={css`
								color: #008000;
							`}
						>
							${data.price.toFixed(2)}
						</span>
					</p>
					<p className="ebay-shipping-price">
						<span
							css={css`
								font-size: 14px;
								padding-right: 5px;
							`}
						>
							Shipping:
						</span>
						<span
							css={css`
								color: #008000;
							`}
						>
							{data.shipping === 0 ? "FREE" : `$${data.shipping.toFixed(2)}`}
						</span>
					</p>
					<p>
						<small
							css={css`
								color: #232323;
							`}
						>
							( Unknow Offer Price )
						</small>
					</p>
				</>
			)}
		</>
	);
};
export default OfferResult;
