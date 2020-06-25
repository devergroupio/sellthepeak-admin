import AdminLayout from "../components/layouts/AdminLayout";
import React, { useCallback, useState, useRef } from "react";
import { Form, Input, Select, Button, Empty, Spin, notification } from "antd";
import { css } from "@emotion/core";
import { useApolloClient } from "@apollo/react-hooks";
import CopyToClipboard from "react-copy-to-clipboard";
import debounce from "lodash/debounce";

import {
	// FETCH_NEEDED_CREATE_SHORTCODE,
	SEARCH_DEFINED_LIST,
} from "~@/graphql/query";

const { TextArea } = Input;
const { Option } = Select;

const ShortCode = () => {
	const [form] = Form.useForm();
	const gqlClient = useApolloClient();
	const refTextArea = useRef(null);
	const [selectedApp, setSelectedApp] = useState("chart");
	const [shortCode, setShortCode] = useState("");
	const [disableCreate, setDisableCreate] = useState(true);
	// const [optionsChartDefine, setOptionsChartDefine] = useState<
	// 	[{ id: string; keyword: string }]
	// >(null);
	const [loading, setLoading] = useState(false);
	const [optionsChartDefine, setOptionsChartDefine] = useState([]);
	const [keySearch, setKeySearch] = useState([]);
	const [fetching, setFetching] = useState(false);

	const fetchDefinedList = async (value) => {
		setOptionsChartDefine([]);
		setFetching(true);
		const { data, errors } = await gqlClient.query({
			query: SEARCH_DEFINED_LIST,
			variables: {
				keyWord: `%${value.trim()}%`,
			},
		});
		if (errors) return null;
		if (!data.defined_list.length) {
			setFetching(false);
		}
		setOptionsChartDefine(data.defined_list);
		setLoading(false);
	};

	const handleChange = (value) => {
		setKeySearch(value);
		setOptionsChartDefine([]);
		setFetching(false);
	};

	// const getNeededCreateShortCode = async () => {
	// 	const { data, errors } = await gqlClient.query({
	// 		query: FETCH_NEEDED_CREATE_SHORTCODE,
	// 	});
	// 	if (errors) return null;
	// 	setOptionsChartDefine(data.defined_list);
	// 	setLoading(false);
	// };
	// useEffect(() => {
	// 	getNeededCreateShortCode();
	// }, []);
	const optionsApp = [
		{
			value: "chart",
			label: "Chart",
		},
		{
			value: "search",
			label: "Search",
		},
	];
	// const optionsChart = [
	// 	{
	// 		value: "switch",
	// 		label: "Switch Chart",
	// 	},
	// 	{
	// 		value: "sametime",
	// 		label: "Same Time Chart ",
	// 	},
	// ];
	const selectApp = useCallback((value) => {
		setSelectedApp(value);
	}, []);

	const createShortCode = (values) => {
		if (values.app && values.app === "search") {
			setShortCode(`
      <div
      class="sellthepeak_app"
      app="search"
    ></div>
  `);
		} else {
			const IDS = values.nameChart
				? values.nameChart.length > 1
					? values.nameChart.map((item) => item.value).join(",")
					: values.nameChart[0].value
				: [];
			const appContent = values.app ? values.app : "chart";
			const context = {
				ids: [IDS],
				// multi: values.type ? (values.type === "switch" ? false : true) : false,
			};
			const shortCode = `
      <div
      class="sellthepeak_app"
      app="${appContent}"
      context='${JSON.stringify(context)}'
    ></div> 
    `;
			setShortCode(shortCode);
		}
	};
	const formChangeValues = () => {
		if (disableCreate) {
			setDisableCreate(false);
		}
	};

	const copyToClipboard = () => {
		notification.success({
			message: "Copy to clipboard success !",
			duration: 1,
		});
	};
	return (
		<AdminLayout>
			{loading ? (
				<Spin />
			) : (
				<div
					css={css`
						display: flex;
						flex-wrap: wrap;
					`}
				>
					<Form
						layout="vertical"
						onValuesChange={formChangeValues}
						form={form}
						labelAlign="left"
						css={css`
							display: flex;
							justify-content: safe;
							flex-wrap: wrap;
							padding-right: 20px;
							width: 50%;
						`}
						onFinish={createShortCode}
					>
						<Form.Item
							label="App"
							name="app"
							css={css`
								margin-right: 15px;
							`}
						>
							<Select
								defaultValue={selectedApp}
								css={css`
									width: 200px !important;
								`}
								onChange={selectApp}
							>
								{optionsApp.map((opt) => (
									<Option key={opt.value} value={opt.value}>
										{opt.label}
									</Option>
								))}
							</Select>
						</Form.Item>
						{/* {selectedApp === "chart" && (
							<Form.Item
								label="Type"
								name="type"
								css={css`
									margin-right: 15px;
								`}
							>
								<Select
									defaultValue="switch"
									css={css`
										width: 200px !important;
									`}
								>
									{optionsChart.map((opt) => (
										<Option key={opt.value} value={opt.value}>
											{opt.label}
										</Option>
									))}
								</Select>
							</Form.Item>
						)} */}
						{selectedApp === "chart" && (
							<Form.Item
								label="Name Chart"
								name="nameChart"
								css={css`
									width: 100% !important;
								`}
								rules={[
									{ required: true, message: "Please select the names chart" },
								]}
							>
								<Select
									mode="multiple"
									labelInValue
									value={keySearch}
									placeholder="Select users"
									notFoundContent={
										fetching ? (
											<Spin size="small" />
										) : (
											<Empty
												css={css`
													.ant-select-item-empty {
														padding: 0;
													}
													.ant-empty-image {
														height: auto;
														margin: 0;
														.ant-empty-img-default {
															width: 30px;
															height: 30px;
														}
													}
												`}
											/>
										)
									}
									filterOption={false}
									onSearch={debounce(fetchDefinedList, 300)}
									onChange={handleChange}
									style={{ width: "100%" }}
								>
									{optionsChartDefine.map((d) => (
										<Option key={d.id + Math.random().toString()} value={d.id}>
											{d.keyword}
										</Option>
									))}
								</Select>
							</Form.Item>
						)}
						<div
							css={css`
								display: flex;
								justify-content: space-between;
								width: 100%;
							`}
						>
							<Button disabled={disableCreate} type="primary" htmlType="submit">
								Create Short code
							</Button>
						</div>
					</Form>
					{shortCode && (
						<div
							css={css`
								display: flex;
								flex-direction: column;
								width: 50%;
							`}
						>
							<TextArea
								autoSize
								ref={refTextArea}
								disabled={true}
								value={shortCode}
								id="short-code"
							/>
							<CopyToClipboard text={shortCode}>
								<Button type="dashed" onClick={copyToClipboard}>
									Copy To Clipboard
								</Button>
							</CopyToClipboard>
						</div>
					)}
				</div>
			)}
		</AdminLayout>
	);
};

export default ShortCode;
