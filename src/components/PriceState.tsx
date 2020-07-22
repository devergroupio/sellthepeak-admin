import React from "react";
import { css } from "@emotion/core";
import OfferResultChart from "~@/components/interface/OfferResultChart";

const PriceState = ({data}) => {
	switch (data.soldType) {
		case "AUCTION":
			return (
				<>
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
							href={data.link}
							target="_blank"
							css={css`
								color: #008000;
							`}
						>
							${data.price.toFixed(2)}
						</a>
					</p>
					<p>
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
							{data.shipping === 0 ? "FREE" : `$${data.shipping}`}
						</span>
					</p>
				</>
			);
		case "OFFER":
			return (
				<>
					<OfferResultChart data={data} />
				</>
			);
		case "FIXED":
			return (
				<>
					<p>
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
					<p>
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
							{data.shipping === 0 ? "FREE" : `$${data.shipping}`}
						</span>
					</p>
				</>
			);
		default:
			return <p></p>;
	}
};

export default PriceState;