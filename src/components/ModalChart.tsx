import React, { useState, useEffect } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import moment from "moment";
import { Modal, Spin, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Line } from "react-chartjs-2";
import { FETCH_DAY_ANALYSIS_ITEMS } from "~@/graphql/query";
import { css } from "@emotion/core";
import ModalSalesByDay from "~@/components/ModalSalesByDay";
import TableInfinite from "~@/components/interface/TableInfinite";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const initialDates = {
	startDate: moment().add(-90, "days").format("YYYY-MM-DD"),
	endDate: moment().format("YYYY-MM-DD"),
};
const getDates = (startDate, endDate) => {
	startDate = moment(startDate);
	endDate = moment(endDate);
	let now = startDate,
		dates = [];
	while (now.isBefore(endDate) || now.isSame(endDate)) {
		dates.push(now.format("MM DD YYYY"));
		now.add(2, "days");
	}
	return dates;
};
const serializeData = (data) => {
	const covertData = data.map((elem) => ({
		...elem,
		x: `${elem.month ? elem.month : 1}-${elem.day ? elem.day : 1}-${elem.year}`,
		y: elem.avg_price.toFixed(2),
	}));
	return covertData;
};
const options = {
	responsive: true,
	maintainAspectRatio: false,
	legend: {
		display: false,
	},
	tooltips: {
		callbacks: {
			label: () => {
				return "";
			},
			afterLabel: (tooltipItem, data) => {
				const dataset =
					data["datasets"][tooltipItem.datasetIndex]["data"][
						tooltipItem["index"]
					];
				return [
					`AVG$ ${dataset.y}`,
					`MAX$ ${dataset.max_price.toFixed(2)}`,
					`MIN$ ${dataset.min_price.toFixed(2)}`,
					`TOTAL SALES: ${dataset.total_items}`,
				];
			},
		},
	},
	scales: {
		xAxes: [
			{
				ticks: {
					source: "labels",
					autoSkip: true,
					stepSize: 20,
				},
				bounds: "ticks",
				type: "time",
				time: {
					unit: "day",
					displayFormats: { day: "MMM DD YYYY" },
					stepSize: 20,
					autoSkip: true,
				},
				scaleLabel: {
					display: false,
					labelString: "Date",
				},
			},
		],
		yAxes: [
			{
				ticks: {
					beginAtZero: true,
					callback: function (value, index, values) {
						return "$" + value;
					},
				},
				scaleLabel: {
					display: false,
					labelString: "Price",
				},
			},
		],
	},
};

const ModalChart = ({ show, onHideModal, infoChart }) => {
	const gqlClient = useApolloClient();
	const [dataChart, setDataChart] = useState([]);
	const [showModalDay, setShowModalDay] = useState(false);
	const [selectDay, setSelectDay] = useState("");
	const [openModal, setOpenModal] = useState(false);
	const [openModalTopSales, setOpenModalTopSales] = useState(false);
	const [topSales, setTopSales] = useState("");

	const getDataChart = () => {
		gqlClient
			.query({
				query: FETCH_DAY_ANALYSIS_ITEMS,
				fetchPolicy: "no-cache",
				variables: {
					id: infoChart.id,
					fromDate: `${initialDates.startDate}T00:00:00+00:00`,
					toDate: `${initialDates.endDate}T23:59:00+00:00`,
				},
			})
			.then((res) => {
				setDataChart(res.data.analysis_items);
			});
	};

	useEffect(() => {
		if (infoChart.id) {
			getDataChart();
		}
	}, [infoChart.id]);

	return (
		<div className="">
			<Modal
				width="80vw"
				// title={infoChart.keyword}
				visible={openModal || openModalTopSales}
				onCancel={() => {
					setOpenModalTopSales(false);
					setOpenModal(false);
				}}
				footer={null}
			>
				{openModal && <TableInfinite defineId={infoChart.id} />}
				{openModalTopSales && (
					<TableInfinite defineId={infoChart.id} topSales={topSales} />
				)}
			</Modal>
			{showModalDay && (
				<ModalSalesByDay
					show={showModalDay}
					onHideModal={() => setShowModalDay(false)}
					infoDay={{ date: selectDay, id: infoChart.id }}
				/>
			)}
			<Modal
				width="80vw"
				title={infoChart.keyword}
				visible={show}
				onCancel={onHideModal}
				footer={null}
			>
				{dataChart.length ? (
					<>
						<div
							css={css`
								width: 100%;
								margin-bottom: 20px;
							`}
						>
							<Button
								onClick={() => {
									setOpenModal(true);
								}}
								css={css`
									margin-top: 10px;
									@media (min-width: 768px) {
										margin-top: 0;
									}
								`}
							>
								Show Card Sales History
							</Button>
							<Button
								onClick={() => {
									setOpenModalTopSales(true);
									setTopSales("highest");
								}}
								css={css`
									margin-left: 10px;
									margin-top: 10px;
									@media (min-width: 768px) {
										margin-top: 0;
									}
									@media (min-width: 992px) {
										margin-left: 15px;
									}
								`}
							>
								Highest
							</Button>
							<Button
								onClick={() => {
									setOpenModalTopSales(true);
									setTopSales("lowest");
								}}
								css={css`
									margin-left: 10px;
									margin-top: 10px;
									@media (min-width: 768px) {
										margin-top: 0;
									}
									@media (min-width: 992px) {
										margin-left: 15px;
									}
								`}
							>
								Lowest
							</Button>
						</div>
						<div style={{ height: "60vh" }}>
							<Line
								data={{
									labels: getDates(
										initialDates.startDate,
										initialDates.endDate
									),
									datasets: [
										{
											label: "Avg price",
											fill: false,
											data: serializeData(dataChart),
											borderColor: "#d35400",
											borderWidth: 1,
										},
									],
								}}
								options={options}
								getElementAtEvent={(elems) => {
									if (elems.length) {
										const datasetIndex = elems[0]._datasetIndex;
										const indx = elems[0]._index;
										setSelectDay(
											`${dataChart[indx].year}-${dataChart[indx].month}-${dataChart[indx].day}`
										);
										setShowModalDay(true);
									}
								}}
							/>
						</div>
					</>
				) : (
					<div
						css={css`
							text-align: center;
						`}
					>
						<Spin indicator={antIcon} />
					</div>
				)}
			</Modal>
		</div>
	);
};

export default ModalChart;
