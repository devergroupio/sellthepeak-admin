import React, { useState, useCallback, useEffect } from "react";
import ReactTable from "react-table-v6";
import { Button } from "antd";
import { useApolloClient } from "@apollo/react-hooks";
import PriceState from "~@/components/PriceState";
import { format } from "date-fns";
import { css } from "@emotion/core";
import {
	FETCH_MORE_DEFINED_ITEM,
	FETCH_HIGH_DEFINED_ITEM,
	FETCH_LOW_DEFINED_ITEM,
} from "~@/graphql/query";
import { INSERT_DELETE_REQUESTION } from "~@/graphql/mutation";
import { GetPriceSale } from "~@/utils";
import "react-table-v6/react-table.css";
import "~@/components/interface/style.scss";

const LIMIT = 20;

const TableInfinite = (props) => {
	const { topSales } = props;
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
			query: topSales
				? topSales === "highest"
					? FETCH_HIGH_DEFINED_ITEM
					: FETCH_LOW_DEFINED_ITEM
				: FETCH_MORE_DEFINED_ITEM,
			variables: {
				limit: LIMIT,
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
			priceSale: GetPriceSale({
				soldType: card.item.soldType,
				price: card.item.price,
				offerPrice: card.item.offerPrice,
			}),
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

		if (convertData.length === LIMIT) setIsHasMore(true);
		else setIsHasMore(false);

		setLoadingTable(false);
		// const newData = dataTable.concat(convertData);
		setDataTable([...dataTable, ...convertData]);
	}, [dataTable, isHasMore, loadingTable]);

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
			width: 100,
			Cell: (props) => {
				const { original } = props;
				return (
					<div
						css={css`
							width: 100px;
						`}
					>
						<a target="_blank" href={original.pic}>
							<img src={original.pic} width="100%" />
						</a>
					</div>
				);
			}, // Custom cell components!
		},
		{
			Header: "Description",
			id: "item-detail",
			sortable: false,
			accessor: (d) => (
				<div
					css={css`
						margin-top: 0;
						@media screen and (min-width: 992px) {
							margin-top: 20px;
						}
					`}
				>
					<p>
						<a
							title={d.title}
							css={css`
								font-size: 15px;
								text-decoration: underline;
							`}
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
			width: 90,
			Cell: (props) => {
				const { original } = props;
				return (
					<div
						css={css`
							font-size: 14px;
							text-align: center;
							p {
                margin: 0;
                color: #fff;
							}
						`}
					>
						<p className="m-0 p-0">
							{original.soldDate !== "Invalid date"
								? format(new Date(original.soldDate), "M-dd-yyyy")
								: original.soldDate}
						</p>
						<p className="m-0 p-0">
							{original.soldDate !== "Invalid date"
								? format(new Date(original.soldDate), "h:mm aa")
								: original.soldDate}
						</p>
					</div>
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
			accessor: "priceSale",
			width: 200,
			Cell: (props) => {
				const { original } = props;
				return (
					<div
						css={css`
							p {
								margin: 0;
                padding: 0;
                color: #fff;
							}
						`}
					>
						<PriceState data={original.price} />
					</div>
				);
			},
			sortMethod: (a, b) => {
				return b > a ? 1 : -1;
			},
		},
		{
			Header: "",
			accessor: "report",
			width: 90,
			Cell: (props) => {
				const { original } = props;
				return (
					<Button
						style={{ textAlign: "center" }}
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
			{visibleModal ? (
				<div
					css={css`
						position: fixed;
						z-index: 100;
						background-color: rgba(0, 0, 0, 0.5);
						min-width: 100vw;
						min-height: 100vh;
						top: 0;
						left: 0;
						text-align: center;
					`}
					onClick={() => setVisibleModal(false)}
				>
					<div
						css={css`
							max-width: 400px;
							margin: 50px auto;
							pointer-events: auto;
							background-color: #fff;
							background-clip: padding-box;
							border: 1px solid rgba(0, 0, 0, 0.2);
							border-radius: 0.3rem;
							outline: 0;
							padding: 20px;
						`}
					>
						<p
							css={css`
								font-size: 18px;
							`}
						>
							Are you sure you want to report this item?
						</p>
						<div
							css={css`
								text-align: right;
								padding: 0;
							`}
						>
							<Button
								onClick={() => setVisibleModal(false)}
								css={css`
									margin-right: 5px;
								`}
							>
								Cancel
							</Button>
							<Button onClick={onDeleteRequestion}>Report</Button>
						</div>
					</div>
				</div>
			) : (
				""
			)}
			<div
				css={css`
					.rt-td {
						white-space: normal !important;
						text-align: center;
					}
					.rt-th {
						background-color: #d35400;
					}
				`}
			>
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
					defaultSorted={[
						{
							id: "priceSale",
							desc: topSales === "lowest",
						},
					]}
					className="r_table_ebay r_table_ebay_modal"
					loading={loadingTable}
				/>
			</div>
			{isHasMore && !topSales && (
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
