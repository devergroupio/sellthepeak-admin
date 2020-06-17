import AdminLayout from "../components/layouts/AdminLayout";
import { Button, Form, Input, notification } from "antd";
import React, { useContext, useEffect } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { INSERT_DEFINED_LIST } from "~@/graphql/mutation";
import AppContext from "../components/AppProvider";
import Redirect from "../components/Redirect";

const PageIndex = () => {
  const { user } = useContext(AppContext);
  if (!user) {
    return <Redirect to="/admin/login" />;
  }
  const [form] = Form.useForm();
  const gqlClient = useApolloClient();
  useEffect(
    () =>
      form.setFieldsValue({
        id: "",
        keyword: "",
        words: "",
        xchars: "",
        psa_link: "",
        psa_line: null,
      }),
    []
  );
  const onFinish = async (values) => {
    await gqlClient
      .mutate({
        mutation: INSERT_DEFINED_LIST,
        variables: {
          item: {
            id: `${values.id}`,
            keyword: `${values.keyword}`,
            exclusion: { words: values.words, xchars: values.xchars },
            psa_line: values.psa_line,
            psa_link: values.psa_link,
          },
          on_confict: {
            constraint: "defined_list_pkey",
            update_columns: [],
          },
        },
      })
      .then(() => {
        form.setFieldsValue({
          id: "",
          keyword: "",
          words: "",
          xchars: "",
          psa_link: "",
          psa_line: null,
        });
        notification.success({
          message: "ok",
          description: "ok",
        });
      })
      .catch(() =>
        notification.warning({
          message: "warning",
          description: "warning",
        })
      );
  };
  return (
    <AdminLayout>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="keyword"
          label="Card"
          rules={[
            {
              required: true,
              message: "Please input your Keyword!",
            },
          ]}
        >
          <Input type="search" placeholder="" />
        </Form.Item>
        <Form.Item name="words" label="Exclusions" rules={[]}>
          <Input type="search" placeholder="" />
        </Form.Item>
        <Form.Item name="xchars" label="Special characters" rules={[]}>
          <Input type="search" placeholder="" />
        </Form.Item>
        <Form.Item
          name="id"
          label="Short code"
          rules={[
            {
              required: true,
              message: "Please input your Id!",
            },
            () => ({
              validator(rule, value) {
                const patt = new RegExp(/^[a-zA-Z0-9]*$/);
                if (patt.test(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  "Id should not contain any special characters, spaces"
                );
              },
            }),
          ]}
        >
          <Input type="search" placeholder="" />
        </Form.Item>
        <Form.Item
          name="psa_link"
          label="PSA link"
          rules={[
            {
              required: true,
              message: "Please input your PSA link!",
            },
          ]}
        >
          <Input placeholder="" />
        </Form.Item>
        <Form.Item
          name="psa_line"
          label="Card Number"
          rules={[
            {
              required: true,
              message: "Please input your PSA line!",
            },
          ]}
        >
          <Input type="number" placeholder="" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Search
          </Button>
        </Form.Item>
      </Form>
    </AdminLayout>
  );
};

export default PageIndex;
