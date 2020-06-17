import React, { useState } from "react";
import { Form, Spin, Input, Button, notification } from "antd";
import { useApolloClient } from "@apollo/react-hooks";
import { UPDATE_EXCLUDE_WORD_BY_TYPE } from "~@/graphql/mutation";

const FormExclude = ({ exclude }) => {
  const [form] = Form.useForm();
  const hsrClient = useApolloClient();
  const { id, type, exclude_words } = exclude;
  const [disable, setDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const updateExclude = async (values) => {
    setLoading(true);
    const type = Object.keys(values)[0];

    await hsrClient.mutate({
      mutation: UPDATE_EXCLUDE_WORD_BY_TYPE,
      variables: {
        type: type,
        data: {
          exclude_words: values[type].split(", "),
        },
      },
    });
    setLoading(false);
    notification.success({
      message: `Update Exclude type ${type}`,
      description: `Sucess`,
    });
    setDisable(true);
  };

  const onFieldsChange = () => setDisable(false);

  return (
    <Form
      key={id}
      className="form_exclude"
      layout="vertical"
      form={form}
      onFinish={updateExclude}
      onFieldsChange={onFieldsChange}
      labelAlign="left"
      initialValues={{ [type]: exclude_words.join(", ") }}
    >
      <Form.Item name={type} label={type} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Button
        type="primary"
        disabled={disable}
        loading={loading}
        htmlType="submit"
      >
        Update {type}
      </Button>
    </Form>
  );
};

export default FormExclude;
