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
import { de } from "date-fns/locale";
import { FormText } from "react-bootstrap";

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
    const { defined_list } = data;
    const optionAll = {
      keyword: "Select all users",
      id: "select_all",
    };
    if (defined_list.length > 1) {
      setOptionsChartDefine([optionAll, ...defined_list]);
    } else {
      setOptionsChartDefine(defined_list);
    }
    setLoading(false);
  };

  const handleChange = (
    value: {
      key: string;
      label: string;
      value: string;
    }[]
  ) => {
    if (value[0]) {
      if (optionsChartDefine.length > 1) {
        const optionSelectedAll = value.filter(
          (option) => option.value === "select_all"
        );
        if (optionSelectedAll.length === 0) {
          setKeySearch(value);
        } else {
          const convertData = optionsChartDefine.slice(1).map((chart) => ({
            key: chart.id,
            value: chart.id,
            label: chart.keyword,
          }));
          form.setFieldsValue({
            nameChart: convertData,
          });
          setKeySearch(convertData);
        }
      } else {
        setKeySearch(value);
      }
    }

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
      const IDS = values.nameChart.length
        ? values.nameChart.map((item) => item.value)
        : [];
      const appContent = values.app ? values.app : "chart";
      const context = {
        ids: IDS,
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
  const resetResult = () => {
    setKeySearch([]);
    if (selectedApp === "chart") {
      form.setFieldsValue({
        nameChart: [],
      });
    }
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
                width: 100%;
              `}
            >
              <Button
                css={css`
                  background: #fff;
                  color: #000;
                  margin-right: 15px;
                  font-weight: 500;
                `}
                onClick={resetResult}
                htmlType="reset"
              >
                Reset
              </Button>
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
