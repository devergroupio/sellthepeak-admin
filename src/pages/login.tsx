import React, { useContext } from "react";
import Router from "next/router";
import { Col, Row, Form, Input, Button, notification } from "antd";
import { LockOutlined } from "@ant-design/icons";
import AppContext from "../components/AppProvider";
import Redirect from "../components/Redirect";

const Login = () => {
  const { user, setUser } = useContext(AppContext);
  if (user) {
    return <Redirect to="/" />;
  }
  const onFinish = (values) => {
    if (values.password === "Sellthepeak1212@@") {
      notification.success({
        message: "Success",
        description: "Login success",
      });
      setUser();
      Router.push("/admin");
    } else {
      notification.error({
        message: "Error",
        description: "Login error",
      });
    }
  };
  return (
    <div style={{ paddingTop: 50 }}>
      <Row gutter={24} justify="center" align="middle">
        <Col md={{ span: 8 }}>
          <Form
            name="normal_login"
            className="login-form"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
          >
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your Password!",
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
