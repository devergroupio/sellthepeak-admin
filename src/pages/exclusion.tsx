import React, { useEffect, useState } from "react";
import AdminLayout from "../components/layouts/AdminLayout";
import { Form, Spin, Input, Button } from "antd";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_COMMON_EXCLUDE_LIST } from "~@/graphql/query";
import FormExclude from "../components/FormExclude";

export default () => {
  const [form] = Form.useForm();
  const hsrClient = useApolloClient();
  const [listCommonExclude, setListCommonExclude] = useState(null);
  const [loading, setLoading] = useState();
  const updateExclude = (values) => {};
  const getCommonsExclude = () => {
    hsrClient
      .query({
        query: FETCH_COMMON_EXCLUDE_LIST,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        setListCommonExclude(res.data.common_exclude_list);
      });
  };
  useEffect(() => {
    getCommonsExclude();
  }, []);
  return (
    <AdminLayout>
      {listCommonExclude ? (
        listCommonExclude.map((exclu) => (
          <FormExclude key={exclu.id} exclude={exclu} />
        ))
      ) : (
        <Spin />
      )}
    </AdminLayout>
  );
};
