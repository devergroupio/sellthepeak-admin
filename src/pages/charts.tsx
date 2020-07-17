import AdminLayout from "../components/layouts/AdminLayout";
import {
	Button,
	Form,
	Input,
	notification,
	Popconfirm,
	Table,
	Modal,
	Space,
} from "antd";
import { ColumnProps } from "antd/es/table";
import React, { useCallback, useState, useContext, useEffect } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_DEFINED_LIST } from "~@/graphql/query";
import _ from "lodash";
import { PlusSquareOutlined, SearchOutlined } from "@ant-design/icons";
import { css } from "@emotion/core";
import moment from "moment";
import { DELETE_DEFINED_LIST, UPDATE_DEFINED_LIST } from "~@/graphql/mutation";

import ModalAddChart from "~@/components/ModalAddChart";

import ExportExcel from "~@/components/ExportExcel";
import AppContext from "~@/components/AppProvider";
import Redirect from "../components/Redirect";
import ModalAddExcelFile from "~@/components/ModalAddExcelFile";
import ModalChart from "~@/components/ModalChart";

const LIMIT = 30;
const { TextArea } = Input;

interface IInfoChart {
	id: string;
	exclusion: any;
	xChars?: string;
	words?: string;
	psa_line?: any;
	psa_link?: string;
	keyword: string;
	state?: any;
	syncedAt?: any;
	psa_variant?: any;
	created_at?: any;
}

export default () => {
	const { user } = useContext(AppContext);
	const [modalAdd, setModalAdd] = useState(false);
	const [modalAddExcel, setModalAddExcel] = useState(false);
	if (!user) {
		return <Redirect to="/login" />;
	}
	const [exportData, setExportData] = useState([]);
	const gqlClient = useApolloClient();
	const [dataTable, setDataTable] = useState([]);
	const [searchKeyword, setSearchKeyword] = useState("");
	const [loadingTable, setLoadingTable] = useState(true);
	const [loadingEdit, setLoadingEdit] = useState(false);
	const [isHasMore, setIsHasMore] = useState(true);
	const [modalEdit, setModalEdit] = useState(false);
	const [infoChart, setInfoChart] = useState({id: "", keyword: ""});
	const [modalChart, setModalChart] = useState(false);
	const [form] = Form.useForm();
	const [formSearch] = Form.useForm();
	const [formEdit] = Form.useForm();

	const getMoreDefinedList = useCallback(async () => {
		setLoadingTable(true);
		const { data, errors } = await gqlClient.query({
			query: FETCH_DEFINED_LIST,
			fetchPolicy: "no-cache",
			variables: {
				limit: LIMIT,
				offset: dataTable.length,
				search: searchKeyword ? `%${searchKeyword.trim()}%` : null,
			},
		});
		if (errors) return null;
		const serializeData = data.defined_list.map((item) => {
			return {
				...item,
				xchars: item.exclusion.xchars,
				words: item.exclusion.words,
			};
		});

		if (serializeData.length === LIMIT) setIsHasMore(true);
		else setIsHasMore(false);

		setLoadingTable(false);
		setDataTable([...dataTable, ...serializeData]);
	}, [dataTable, searchKeyword]);

	useEffect(() => {
		getMoreDefinedList();
	}, [searchKeyword]);

	const handleDelete = (id) => {
		setLoadingTable(true);
		gqlClient
			.mutate({
				mutation: DELETE_DEFINED_LIST,
				variables: {
					idDefinedList: id,
				},
			})
			.then((res: any) => {
				notification.success({
					message: "Success",
					description: "Delete success",
				});
				setLoadingTable(res.loading);
				setDataTable(dataTable.filter((item) => item.id !== id));
			});
	};

	const editChart = (values: IInfoChart) => {
		const indexChartEdit = dataTable.findIndex((item) => item.id === values.id);
		setLoadingEdit(true);
		gqlClient
			.mutate({
				mutation: UPDATE_DEFINED_LIST,
				variables: {
					idDefinedList: values.id,
					data: {
						exclusion: {
							..._.omit(values, ["psa_link", "psa_line", "id", "keyword"]),
						},
						psa_line: values.psa_line,
						psa_link: values.psa_link,
						psa_variant: values.psa_variant,
					},
				},
			})
			.then(() => {
				const newData = [...dataTable];
				newData.splice(indexChartEdit, 1, values);
				setDataTable(newData);
				setModalEdit(false);
				setLoadingEdit(false);
				notification.success({
					message: "Edit chart !",
					description: "Success",
				});
			})
			.catch(() => {
				setLoadingEdit(false);
				notification.error({
					message: "Edit chart !",
					description: "Something went wrong, please try again !",
				});
			});
	};

	const forceUpdate = (infoChart: IInfoChart) => {
		const indexChartEdit = dataTable.findIndex(
			(item) => item.id === infoChart.id
		);
		gqlClient
			.mutate({
				mutation: UPDATE_DEFINED_LIST,
				variables: {
					idDefinedList: infoChart.id,
					data: {
						state: {},
						syncedAt: moment(infoChart.created_at).add(-90, "days").format(),
					},
				},
			})
			.then(() => {
				const newData = [...dataTable];
				newData.splice(indexChartEdit, 1, {
					...infoChart,
					syncedAt: moment(infoChart.created_at).add(-90, "days").format(),
				});
				setDataTable(newData);
				notification.success({
					message: "Force update chart !",
					description: "Success",
				});
			})
			.catch(() => {
				notification.error({
					message: "Force update chart !",
					description: "Something went wrong, please try again !",
				});
			});
	};

	const openModalEdit = (record) => {
		formEdit.setFields([
			{
				name: "words",
				value: record.words,
			},
			{
				name: "xchars",
				value: record.xchars ? record.xchars : "",
			},
			{
				name: "psa_link",
				value: record.psa_link,
			},
			{
				name: "psa_line",
				value: record.psa_line,
			},
			{
				name: "psa_variant",
				value: record.psa_variant,
			},
			{
				name: "id",
				value: record.id,
			},
			{
				name: "keyword",
				value: record.keyword,
			},
		]);
		setModalEdit(true);
	};

	const addSuccessChart = (data) => {
		setDataTable([data, ...dataTable]);
	};

	//Search
	const searchKeywordData = (values) => {
		setDataTable([]);
		setSearchKeyword(values.keySearch);
		setExportData([]);
	};
	const rowSelection = {
		selectedRows: exportData,
		onChange: (selectedRowKeys, selectedRows) => {
			setExportData([...selectedRows]);
		},
	};
	// End Search

	const columns: Array<ColumnProps<IInfoChart>> = [
		{
			title: "Id",
			dataIndex: "id",
		},
		{
			title: "Keyword",
			dataIndex: "keyword",
			sorter: (a, b) => {
				return a.keyword.localeCompare(b.keyword);
			},
		},
		{
			title: "SyncedAt",
			dataIndex: "syncedAt",
			render: (syncedAt) => syncedAt && <p>{moment(syncedAt).fromNow()}</p>,
		},
		{
			title: "words",
			dataIndex: "words",
			width: "300px",
		},

		{
			title: "Psa link",
			dataIndex: "psa_link",
		},
		{
			title: "Psa line",
			dataIndex: "psa_line",
		},
		{
			title: "PSA variant",
			dataIndex: "psa_variant",
		},
		{
			title: "Action",
			dataIndex: "actionEdit",
			render: (_, record) => {
				return (
					<div
						css={css`
							display: flex;
							flex-direction: column;
						`}
					>
						<Button
							css={css`
								margin-bottom: 5px;
								color: #36cfc9;
							`}
							onClick={() => openModalEdit(record)}
						>
							Edit
						</Button>
						<Popconfirm
							title="Sure to delete?"
							onConfirm={() => handleDelete(record.id)}
						>
							<Button style={{ color: "red" }}>Delete</Button>
						</Popconfirm>
						<Button
							css={css`
								margin-top: 5px;
								color: #7cb305;
							`}
							onClick={() => {
								setModalChart(true);
                setInfoChart({ id: record.id, keyword: record.keyword });
							}}
						>
							Chart
						</Button>
						<p
							css={css`
								margin-top: 5px;
							`}
						>
							<Popconfirm
								title="Sure to Force Update?"
								onConfirm={() => forceUpdate(record)}
							>
								<Button style={{ color: "#ffec3d" }}>Force Update</Button>
							</Popconfirm>
						</p>
					</div>
				);
			},
		},
	];

	const changePageTableData = (page, pageSize) => {
		if (isHasMore) {
			const isLastPage = dataTable.length / page === pageSize;
			if (isLastPage) {
				getMoreDefinedList();
			}
		}
	};

	return (
		<AdminLayout>
			<div
				css={css`
					display: flex;
					flex-wrap: wrap;
					justify-content: space-between;
				`}
			>
				<div
					css={css`
						display: flex;
					`}
				>
					<Button
						type="primary"
						color="green"
						icon={<PlusSquareOutlined />}
						onClick={() => setModalAdd(true)}
						css={css`
							margin-bottom: 10px;
							margin-right: 5px;
						`}
					>
						Add chart
					</Button>
					<Button
						type="primary"
						icon={<PlusSquareOutlined />}
						onClick={() => setModalAddExcel(true)}
					>
						Upload Excel file
					</Button>
					{exportData.length !== 0 && dataTable && (
						<ExportExcel data={exportData} />
					)}
				</div>
				<Form
					form={formSearch}
					css={css`
						display: flex;
					`}
					onFinish={searchKeywordData}
				>
					<Form.Item name="keySearch">
						<Input
							type="text"
							prefix={<SearchOutlined />}
							value={searchKeyword}
						/>
					</Form.Item>
					<Button
						htmlType="submit"
						type="primary"
						css={css`
							margin-left: 10px;
						`}
						onClick={searchKeywordData}
					>
						Search
					</Button>
				</Form>
			</div>
			{modalAddExcel && (
				<ModalAddExcelFile
					show={modalAddExcel}
					onHideModal={() => setModalAddExcel(false)}
				/>
			)}
			{modalAdd && (
				<ModalAddChart
					show={modalAdd}
					onHideModal={() => setModalAdd(false)}
					addnewChart={addSuccessChart}
				/>
			)}
			{modalChart && (
				<ModalChart
					show={modalChart}
          onHideModal={() => setModalChart(false)}
          infoChart={infoChart}
				/>
			)}
			<Modal
				visible={modalEdit}
				title="Edit chart"
				onCancel={() => setModalEdit(false)}
				onOk={() => {
					formEdit.submit();
					setModalEdit(false);
				}}
				footer={null}
			>
				<Form
					form={formEdit}
					onFinish={editChart}
					labelAlign="left"
					css={css`
						padding-bottom: 40px;
					`}
					labelCol={{ span: 5 }}
				>
					<Form.Item
						name="id"
						label="Id"
						css={css`
							display: none;
						`}
					>
						<Input disabled />
					</Form.Item>
					<Form.Item
						name="keyword"
						label="Keyword"
						css={css`
							display: none;
						`}
					>
						<Input disabled />
					</Form.Item>
					<Form.Item name="words" label="Words">
						<TextArea autoSize />
					</Form.Item>
					<Form.Item name="xchars" label="Xchars">
						<Input />
					</Form.Item>
					<Form.Item name="psa_variant" label="PSA variant">
						<Input />
					</Form.Item>
					<Form.Item name="psa_line" label="PSA line">
						<Input type="number" />
					</Form.Item>
					<Form.Item name="psa_link" label="PSA link">
						<Input />
					</Form.Item>
					<Button
						loading={loadingEdit}
						htmlType="submit"
						css={css`
							float: right;
						`}
						type="primary"
					>
						Update
					</Button>
				</Form>
			</Modal>
			<Form form={form} component={false}>
				<Table
					rowSelection={{
						type: "checkbox",
						...rowSelection,
					}}
					columns={columns}
					rowKey={(record) => record.id}
					rowClassName="editable-row"
					dataSource={dataTable}
					loading={loadingTable}
					pagination={{
						onChange: changePageTableData,
						pageSize: 10,
						showSizeChanger: false,
					}}
				/>
			</Form>
		</AdminLayout>
	);
};
