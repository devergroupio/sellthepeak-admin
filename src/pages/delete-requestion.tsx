import AdminLayout from "../components/layouts/AdminLayout";
import { Form, notification, Popconfirm, Table } from "antd";
import React, { useState, useContext, useEffect, useCallback } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_DELETE_REQUESTION } from "~@/graphql/query";
import { DELETE_ITEM, DELETE_REQUESTION } from "~@/graphql/mutation";
import InfiniteScroll from "react-infinite-scroller";
import { css } from "@emotion/core";
import moment from "moment";
import AppContext from "../components/AppProvider";
import Redirect from "../components/Redirect";

const LIMIT = 30;

export default () => {
	const { user } = useContext(AppContext);
	if (!user) {
		return <Redirect to="/login" />;
	}
	const gqlClient = useApolloClient();
	const [dataTable, setDataTable] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isHasMore, setIsHasMore] = useState(true);
	const [form] = Form.useForm();

	const handleDelete = (id) => {
		setLoading(true);
		gqlClient
			.mutate({
				fetchPolicy: "no-cache",
				mutation: DELETE_ITEM,
				variables: {
					id,
				},
			})
			.then(() => {
				notification.success({
					message: "Success",
					description: "Delete card success",
				});
				setDataTable((prev) => prev.filter((item) => item.id !== id));
				setLoading(false);
			});
	};
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

	const columns = [
		{
			title: "Image",
			dataIndex: "pic",
			render: (pic) => <img src={pic} alt="pic  " />,
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
					<Popconfirm
						title="Sure to delete?"
						onConfirm={() => handleDelete(record.id)}
					>
						<a style={{ color: "red" }}>Delete</a>
					</Popconfirm>
					&nbsp;
					<Popconfirm
						title="Sure to reinstate?"
						onConfirm={() => {
							handleReinstate(record.id);
						}}
					>
						<a style={{ color: "blue" }}>Reinstate</a>
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
		if (errors) return null;
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
				idCard: element.item.defined_list_items[0].defined_list.id,
				card: element.item.defined_list_items[0].defined_list.keyword,
			};
		});
		console.log(serializeData);
		if (serializeData.length === LIMIT) setIsHasMore(true);
		else setIsHasMore(false);
		setLoading(false);
		setDataTable([...dataTable, ...serializeData]);
	}, [dataTable]);

	useEffect(() => {
		getMoreDeleteRequestion();
	}, []);

	return (
		<AdminLayout>
			<Form form={form} component={false}>
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
