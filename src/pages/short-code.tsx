import AdminLayout from "../components/layouts/AdminLayout";
import React, { useCallback, useState, useEffect } from "react";
import { Form, Input, Select, Button, Spin } from "antd";
import { css } from "@emotion/core";
import { useApolloClient } from "@apollo/react-hooks";

import { FETCH_NEEDED_CREATE_SHORTCODE } from "~@/graphql/query";

const { TextArea } = Input;
const { Option } = Select;

const ShortCode = () => {
  const [form] = Form.useForm();
  const gqlClient = useApolloClient();
  const [selectedApp, setSelectedApp] = useState("chart");
  const [shortCode, setShortCode] = useState("");
  const [optionsChartDefine, setOptionsChartDefine] = useState<
    [{ id: string }]
  >(null);
  const [loading, setLoading] = useState(true);

  const getNeededCreateShortCode = async () => {
    const { data, errors } = await gqlClient.query({
      query: FETCH_NEEDED_CREATE_SHORTCODE,
    });
    if (errors) return null;
    setOptionsChartDefine(data.defined_list);
    setLoading(false);
  };
  useEffect(() => {
    getNeededCreateShortCode();
  }, []);
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
  const optionsChart = [
    {
      value: "multi",
      label: "Multi Chart",
    },
    {
      value: "sametime",
      label: "Same Time Chart ",
    },
  ];
  const selectApp = useCallback((value) => {
    setSelectedApp(value);
  }, []);

  const createShortCode = (values) => {
    console.log(values);
    if (values.app && values.app === "search") {
      setShortCode(`
      <div
      class="sellthepeak_app"
      app="search"
    ></div>
  `);
    } else {
      const appContent = values.app ? values.app : "chart";
      const context = {
        ids: values.nameChart ? values.nameChart : [optionsChartDefine[0].id],
        multi: values.type ? (values.type === "multi" ? true : false) : true,
      };
      const shortCode = `
      <div
      class="sellthepeak_app"
      app="${appContent}"
      context='${JSON.stringify(context)}'
    ></div>
    }
   
    `;
      setShortCode(shortCode);
    }
    form.resetFields();
  };

  return (
    <AdminLayout>
      <Form
        form={form}
        labelAlign="left"
        css={css`
          display: flex;
          justify-content: safe;
          flex-wrap: wrap;
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
              <Option value={opt.value}>{opt.label}</Option>
            ))}
          </Select>
        </Form.Item>
        {selectedApp === "chart" && (
          <Form.Item
            label="Type"
            name="type"
            css={css`
              margin-right: 15px;
            `}
          >
            <Select
              defaultValue="multi"
              css={css`
                width: 200px !important;
              `}
            >
              {optionsChart.map((opt) => (
                <Option value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {optionsChartDefine && selectedApp === "chart" && (
          <Form.Item label="Name Chart" name="nameChart">
            <Select
              defaultValue={optionsChartDefine[0].id}
              css={css`
                min-width: 300px;
              `}
              mode="multiple"
            >
              {optionsChartDefine.map((opt) => (
                <Option value={opt.id}>{opt.id}</Option>
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
          <Button type="primary" htmlType="submit">
            Create Short code
          </Button>
          {shortCode && (
            <TextArea
              autoSize
              css={css`
                width: 70%;
              `}
              disabled={true}
              value={shortCode}
            />
          )}
        </div>
      </Form>
    </AdminLayout>
  );
};

export default ShortCode;
