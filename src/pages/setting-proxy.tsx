import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../components/layouts/AdminLayout";
import { Table, Tag } from "antd";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_PROXY_SETTING } from "~@/graphql/query";
import AppContext from "~@/components/AppProvider";
import Redirect from "~@/components/Redirect";
import Moment from "react-moment";
export default () => {
  const { user } = useContext(AppContext);
  if (!user) {
    return <Redirect to="/login" />;
  }
  const hsrClient = useApolloClient();

  const [proxies, setProxies] = useState([]);
  const fetchProxies = async () => {
    const {
      data: { proxy_manager: proxies },
    } = await hsrClient.query({
      query: FETCH_PROXY_SETTING,
      fetchPolicy: "no-cache",
    });
    setProxies(proxies);
  };

  const Footer = () => {
    return (
      <p>
        Total: {proxies.length} | Banned:{" "}
        {proxies.filter((p) => p.required_captcha).length}
      </p>
    );
  };
  useEffect(() => {
    fetchProxies();
  }, []);

  return (
    <AdminLayout>
      <Table
        dataSource={proxies}
        columns={[
          {
            title: "proxy",
            dataIndex: "proxy",
            key: "proxy",
          },
          {
            title: "required_captcha",
            dataIndex: "required_captcha",
            key: "required_captcha",
            render: (r) => {
              return <Tag color={r ? "red" : "green"}>{r.toString()}</Tag>;
            },
          },
          {
            title: "Last check",
            dataIndex: "updated_at",
            render: (r) => {
              return <Moment fromNow>{r}</Moment>;
            },
          },
        ]}
        footer={() => <Footer />}
      ></Table>
    </AdminLayout>
  );
};
