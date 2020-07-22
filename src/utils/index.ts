import getConfig from "next/config";

export const CS_CONFIG = getConfig().publicRuntimeConfig;

export const GetPriceSale = ({ soldType, price, offerPrice }) => {
	switch (soldType) {
		case "OFFER":
			return offerPrice;
		default:
			return price;
	}
};
