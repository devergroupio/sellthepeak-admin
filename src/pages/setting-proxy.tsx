import React, { useContext, useEffect, useState } from "react";
import AdminLayout from "../components/layouts/AdminLayout";
import { Table, Tag, Modal, Input, Button, Spin } from "antd";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_PROXY_SETTING } from "~@/graphql/query";
import { UPSERT_PROXIES } from "~@/graphql/mutation";
import AppContext from "~@/components/AppProvider";
import Redirect from "~@/components/Redirect";
import Moment from "react-moment";
import _ from "lodash";
const { TextArea } = Input;
export default () => {
  const { user } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(false);
  if (!user) {
    return <Redirect to="/login" />;
  }
  const hsrClient = useApolloClient();

  const [proxies, setProxies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [proxyList, setProxyList] = useState("");

  const onSubmit = () => {
    const newProxies = _.uniq(proxyList.split("\n")).map((p) => ({
      proxy: p,
    }));
    setIsLoading(true);

    hsrClient
      .mutate({
        mutation: UPSERT_PROXIES,
        variables: {
          proxies: newProxies,
        },
      })
      .then(() => {
        alert("synced");
        setIsLoading(false);
        setIsOpen(false);
      })
      .catch((err) => {
        setIsLoading(false);
        alert(err.toString());
      });
  };
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
      <Button onClick={() => setIsOpen(true)} type="primary">
        Add Proxy
      </Button>
      <Spin spinning={isLoading}>
        <Modal closable={true} visible={isOpen} okText="Add" onOk={onSubmit}>
          <TextArea
            rows={10}
            value={proxyList}
            onChange={(v) => setProxyList(v.target.value)}
          />
        </Modal>
      </Spin>
    </AdminLayout>
  );
};
