import AdminLayout from "../components/layouts/AdminLayout";
import {
	Form,
	notification,
	Popconfirm,
	Table,
	Modal,
	Button,
	Input,
} from "antd";
import React, { useState, useContext, useEffect, useCallback } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_DELETE_REQUESTION } from "~@/graphql/query";
import {
	DELETE_ITEM,
	DELETE_REQUESTION,
	UPDATE_DEFINED_LIST,
	UPDATE_DELETE_ITEM,
} from "~@/graphql/mutation";
import InfiniteScroll from "react-infinite-scroller";
import { css } from "@emotion/core";
import moment from "moment";
import AppContext from "../components/AppProvider";
import Redirect from "../components/Redirect";

const LIMIT = 30;
const { TextArea } = Input;

export default () => {
	const { user } = useContext(AppContext);
	if (!user) {
		return <Redirect to="/login" />;
	}
	const gqlClient = useApolloClient();
	const [dataTable, setDataTable] = useState([]);
	const [modalDelete, setModalDelete] = useState(false);
	const [loading, setLoading] = useState(true);
	const [loadingDelete, setLoadingDelete] = useState(false);
	const [isHasMore, setIsHasMore] = useState(true);
	const [form] = Form.useForm();
	const [formDelete] = Form.useForm();

	const handleReinstate = (id) => {
		setLoading(true);
		gqlClient
			.mutate({
				fetchPolicy: "no-cache",
				mutation: DELETE_REQUESTION,
				variables: {
					id,
				},
			})
			.then(() => {
				notification.success({
					message: "Success",
					description: "Reinstate card success",
				});
				setDataTable((prev) => prev.filter((item) => item.id !== id));
				setLoading(false);
			});
	};

	const openModalDelete = (record) => {
		formDelete.setFields([
			{
				name: "id",
				value: record.id,
			},
			{
				name: "idCard",
				value: record.idCard,
			},
			{
				name: "words",
				value: record.exclusion.words,
			},
			{
				name: "exclusion",
				value: record.exclusion,
			},
			{
				name: "card",
				value: record.card,
			},
			{
				name: "link",
				value: record.link,
			},
			{
				name: "title",
				value: record.title,
			},
		]);
		setModalDelete(true);
	};

	const columns = [
		{
			title: "Image",
			dataIndex: "pic",
			width: "150px",
			render: (pic) => <img width="100%" src={pic} alt="pic" />,
		},
		// {
		//   title: "Title",
		//   dataIndex: "title",
		// },
		{
			title: "Title",
			dataIndex: "title",
			render: (title, record) => (
				<a href={record.link} target="_blank">
					{title}
				</a>
			),
		},
		{
			title: "Price",
			dataIndex: "price",
			render: (price) => (
				<p
					css={css`
						margin: 0;
					`}
				>
					$ {price}
				</p>
			),
		},
		{
			title: "Sold date",
			dataIndex: "soldDate",
		},
		{
			title: "Card",
			dataIndex: "card",
		},
		{
			title: "Action",
			dataIndex: "actionDelete",
			render: (text, record) => (
				<>
					<Button
						style={{ color: "red" }}
						onClick={() => openModalDelete(record)}
					>
						Delete
					</Button>
					&nbsp;
					<Popconfirm
						title="Sure to reinstate?"
						onConfirm={() => {
							handleReinstate(record.id);
						}}
					>
						<Button style={{ color: "blue" }}>Reinstate</Button>
					</Popconfirm>
				</>
			),
		},
	];

	const getMoreDeleteRequestion = useCallback(async () => {
		setLoading(true);
		const { data, errors } = await gqlClient.query({
			query: FETCH_DELETE_REQUESTION,
			fetchPolicy: "no-cache",
			variables: {
				limit: LIMIT,
				offset: dataTable.length,
			},
		});
		if (errors) {
			setLoading(false);
			return null;
		}
		const serializeData = data.delete_requestion.map((element) => {
			return {
				id: element.item_id,
				link: element.item._data.link,
				bids: element.item.bids,
				offerPrice: element.item.offerPrice,
				pic: element.item._data.pic,
				price: element.item.price,
				shipping: element.item.shipping,
				soldDate: moment(element.item.soldDate).format("MM-DD-YYYY hh:mm A"),
				soldType: element.item.soldType,
				title: element.item._data.title,
				idCard:
					element.item.defined_list_items[0].defined_list &&
					element.item.defined_list_items[0].defined_list.id,
				card: element.item.defined_list_items[0].defined_list.keyword,
				exclusion: element.item.defined_list_items[0].defined_list.exclusion,
			};
		});
		if (serializeData.length === LIMIT) setIsHasMore(true);
		else setIsHasMore(false);
		setLoading(false);
		setDataTable([...dataTable, ...serializeData]);
	}, [dataTable]);

	useEffect(() => {
		getMoreDeleteRequestion();
	}, []);

	const deleteItem = (values) => {
		setLoadingDelete(true);
		gqlClient
			.mutate({
				fetchPolicy: "no-cache",
				mutation: DELETE_ITEM,
				variables: {
					id: values.id,
				},
			})
			.then(() => {
				gqlClient
					.mutate({
						fetchPolicy: "no-cache",
						mutation: UPDATE_DELETE_ITEM,
						variables: {
							id: values.id,
						},
					})
					.then(() => {
						gqlClient
							.mutate({
								mutation: UPDATE_DEFINED_LIST,
								variables: {
									idDefinedList: values.idCard,
									data: {
										exclusion: {
											...values.exclusion,
											words: values.words,
										},
									},
								},
							})
							.then(() => {
								notification.success({
									message: "Success",
									description: "Delete card success",
								});
								setDataTable((prev) =>
									prev.filter((item) => item.id !== values.id)
								);
								setLoadingDelete(false);
								setModalDelete(false);
							})
							.catch((err) => {
								console.log(err);
								setLoadingDelete(false);
								notification.error({
									message: "Error",
									description: "Delete card error",
								});
							});
					});
			});
	};

	return (
		<AdminLayout>
			<Form form={form} component={false}>
				<Modal
					// confirmLoading={loadingDelete}
					title="Delete"
					visible={modalDelete}
					onCancel={() => setModalDelete(false)}
					footer={null}
				>
					<Form
						form={formDelete}
						onFinish={deleteItem}
						labelAlign="left"
						labelCol={{ span: 5 }}
					>
						<Form.Item
							name="id"
							label="Id"
							css={css`
								display: none;
							`}
						>
							<Input disabled readOnly />
						</Form.Item>
						<Form.Item
							name="exclusion"
							label="Exclusion"
							css={css`
								display: none;
							`}
						>
							<Input disabled readOnly />
						</Form.Item>
						<Form.Item
							name="idCard"
							label="IdCard"
							css={css`
								display: none;
							`}
						>
							<Input disabled readOnly />
						</Form.Item>
						<Form.Item name="card" label="Card">
							<Input readOnly disabled />
						</Form.Item>
						<Form.Item name="title" label="Title">
							<Input readOnly disabled />
						</Form.Item>
						<Form.Item name="link" label="Link">
							<Input readOnly />
						</Form.Item>
						<Form.Item name="words" label="Words">
							<TextArea autoSize />
						</Form.Item>
					</Form>
					<div
						css={css`
							text-align: right;
						`}
					>
						<Button onClick={() => setModalDelete(false)}>Cancel</Button>
						<Button
							css={css`
								margin-left: 5px;
							`}
							loading={loadingDelete}
							type="primary"
							onClick={() => {
								formDelete.submit();
							}}
						>
							Ok
						</Button>
					</div>
				</Modal>
				<InfiniteScroll loadMore={getMoreDeleteRequestion} hasMore={isHasMore}>
					<Table
						columns={columns}
						rowKey={(record) => record.id}
						dataSource={dataTable}
						// pagination={false}
						loading={loading}
					/>
				</InfiniteScroll>
			</Form>
		</AdminLayout>
	);
};
