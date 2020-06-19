import AdminLayout from "../components/layouts/AdminLayout";
import { Form, notification, Popconfirm, Table } from "antd";
import React, { useState, useContext, useEffect } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_DELETE_REQUESTION } from "~@/graphql/query";
import { DELETE_ITEM, DELETE_REQUESTION } from "~@/graphql/mutation";
import AppContext from "../components/AppProvider";
import Redirect from "../components/Redirect";

export default () => {
  const { user } = useContext(AppContext);
  if (!user) {
    return <Redirect to="/login" />;
  }
  const gqlClient = useApolloClient();
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const handleDelete = (id) => {
    setLoading(true);
    gqlClient
      .mutate({
        fetchPolicy: "no-cache",
        mutation: DELETE_ITEM,
        variables: {
          id,
        },
      })
      .then(() => {
        notification.success({
          message: "Success",
          description: "Delete card success",
        });
        setDataTable((prev) => prev.filter((item) => item.id !== id));
        setLoading(false);
      });
  };
  const handleReinstate = (id) => {
    setLoading(true);
    gqlClient
      .mutate({
        fetchPolicy: "no-cache",
        mutation: DELETE_REQUESTION,
        variables: {
          id,
        },
      })
      .then(() => {
        notification.success({
          message: "Success",
          description: "Reinstate card success",
        });
        setDataTable((prev) => prev.filter((item) => item.id !== id));
        setLoading(false);
      });
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "pic",
      render: (pic) => <img src={pic} alt="pic  " />,
    },
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Link",
      dataIndex: "link",
      render: (link) => (
        <a href={link} target="_blank">
          Link
        </a>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => <p>$ {price}</p>,
    },
    {
      title: "Action",
      dataIndex: "actionDelete",
      render: (text, record) => (
        <>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.id)}
          >
            <a style={{ color: "red" }}>Delete</a>
          </Popconfirm>
          &nbsp;
          <Popconfirm
            title="Sure to reinstate?"
            onConfirm={() => {
              handleReinstate(record.id);
            }}
          >
            <a style={{ color: "blue" }}>Reinstate</a>
          </Popconfirm>
        </>
      ),
    },
  ];

  useEffect(() => {
    gqlClient
      .query({
        query: FETCH_DELETE_REQUESTION,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        const serializedData = res.data.delete_requestion.map((element) => {
          return {
            id: element.item_id,
            link: element.item._data.link,
            bids: element.item.bids,
            offerPrice: element.item.offerPrice,
            pic: element.item._data.pic,
            price: element.item.price,
            shipping: element.item.shipping,
            soldDate: element.item.soldDate,
            soldType: element.item.soldType,
            title: element.item._data.title,
          };
        });
        setLoading(false);
        setDataTable(serializedData);
      });
  }, []);

  return (
    <AdminLayout>
      <Form form={form} component={false}>
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={dataTable}
          pagination={false}
          loading={loading}
        />
      </Form>
    </AdminLayout>
  );
};
