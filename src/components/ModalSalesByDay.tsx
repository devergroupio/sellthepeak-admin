import React, { useCallback, useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_SALES_CARD_BY_DAY } from "~@/graphql/query";
import ReactTable from "react-table-v6";
import { Button, Modal, Spin } from "antd";
import { format } from "date-fns";
import { INSERT_DELETE_REQUESTION } from "~@/graphql/mutation";
import PriceState from "~@/components/PriceState";
import { GetPriceSale } from "~@/utils/";
import { css } from "@emotion/core";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

import "react-table-v6/react-table.css";
import "~@/components/interface/style.scss";

const ModalSalesByDay = ({ show, onHideModal, infoDay }) => {
	const [loadingTable, setLoadingTable] = useState(true);
	const [loading, setLoading] = useState(true);
	const [dataTable, setDataTable] = useState([]);
	const [visibleModalReport, setVisibleModalReport] = useState(false);
	const [selectDeleteItemId, setSelectDeleteItemId] = useState({});
	const [isHasMore, setIsHasMore] = useState(true);

	const gqlClient = useApolloClient();

	const getMoreSalesCardByDay = useCallback(async () => {
		setLoadingTable(true);
		const fromDate = `${infoDay.date}T00:00:00+00:00`;
		const toDate = `${infoDay.date}T23:59:00+00:00`;
		const { data, errors } = await gqlClient.query({
			query: FETCH_SALES_CARD_BY_DAY,
			variables: {
				definedId: infoDay.id,
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
		if (convertData.length === 20) setIsHasMore(true);
		else setIsHasMore(false);

		setLoadingTable(false);
		setDataTable([...dataTable, ...convertData]);
		setLoading(false);
	}, [dataTable, isHasMore, loadingTable]);

	useEffect(() => {
		getMoreSalesCardByDay();
	}, []);

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
								color: #fff;
								margin: 0;
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
								color: #fff;
								margin: 0;
								padding: 0;
							}
						`}
					>
						<PriceState data={original.price} />
					</div>
				);
			},
			sortMethod: (a, b) => {
				a = a;
				b = b;
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
							setVisibleModalReport(true);
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
				setVisibleModalReport(false);
			});
	};
	return (
		<>
			<Modal
				visible={visibleModalReport}
				title="Are you sure you want to report this item?"
				onCancel={() => setVisibleModalReport(false)}
				onOk={onDeleteRequestion}
			></Modal>
			<Modal
				width="80vw"
				css={css`height: "85vh`}
				title=""
				visible={show}
				onCancel={onHideModal}
				footer={null}
			>
				{loading ? (
					<div
						css={css`
							text-align: center;
						`}
					>
						<Spin indicator={antIcon} />
					</div>
				) : (
					<>
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
							defaultSorted={[
								{
									id: "priceSale",
									desc: false,
								},
							]}
							className="r_table_ebay r_table_ebay_modal"
							loading={loadingTable}
						/>
						{!loadingTable
							? isHasMore && (
									<Button
										css={css`
											text-align: right;
										`}
										onClick={getMoreSalesCardByDay}
									>
										Load More
									</Button>
							  )
							: ""}
					</>
				)}
			</Modal>
		</>
	);
};

export default React.memo(ModalSalesByDay);
