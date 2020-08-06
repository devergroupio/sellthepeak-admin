import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../components/layouts/AdminLayout";
import { Form, notification, Input, Button } from "antd";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_PROXY_SETTING } from "~@/graphql/query";
import { UPDATE_PROXY_SETTING } from "~@/graphql/mutation";
import AppContext from "~@/components/AppProvider";
import Redirect from "~@/components/Redirect";
// import { css } from "@emotion/core";

const { TextArea } = Input;

export default () => {
  const { user } = useContext(AppContext);
  if (!user) {
    return <Redirect to="/login" />;
  }
  const [disable, setDisable] = useState(true);
  const hsrClient = useApolloClient();
  const [form] = Form.useForm();
  const [idProxy, setIdProxy] = useState(null);
  const [loading, setLoading] = useState(false);
  const getProxy = () => {
    hsrClient
      .query({
        query: FETCH_PROXY_SETTING,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        setIdProxy(res.data.setting[0].id);
        form.setFieldsValue({
          proxy: res.data.setting[0].proxy,
        });
      });
  };
  useEffect(() => {
    getProxy();
  }, []);

  const onFieldsChange = () => setDisable(false);
  const updateProxy = (values) => {
    setLoading(true);
    hsrClient
      .mutate({
        mutation: UPDATE_PROXY_SETTING,
        variables: {
          proxy: values.proxy,
          id: idProxy,
        },
      })
      .then(() => {
        notification.success({
          message: "Success",
          description: "Update Proxy success",
        });
        setLoading(false);
      })
      .catch((err) => {
        notification.error({
          message: "Error",
          description: "Update Proxy error",
        });
        setLoading(false);
      });
  };
  return (
    <AdminLayout>
      <Form
        onFinish={updateProxy}
        layout="vertical"
        form={form}
        onFieldsChange={onFieldsChange}
      >
        <Form.Item name="proxy" label="Proxy">
          <TextArea autoSize />
        </Form.Item>
        <p>Host:Port:Type:Username:Password</p>
        {/* <div
					css={css`
						display: flex;
					`}
				>
					<p>Example:</p>
					<div
						css={css`
							padding-left: 10px;
							margin-bottom: 10px;
							p {
								margin: 0;
							}
						`}
					>
						<p>
							176.119.159.237:5836:https ( Ip: 176.119.159.237 - Port: 5836 -
							Type: https / http / wss.... )
						</p>
						<p>First line: Proxy</p>
						<p>Second line: Username</p>
						<p>Third line: Password</p>
					</div>
				</div> */}
        <Button
          type="primary"
          disabled={disable}
          loading={loading}
          htmlType="submit"
        >
          Update
        </Button>
      </Form>
    </AdminLayout>
  );
};
