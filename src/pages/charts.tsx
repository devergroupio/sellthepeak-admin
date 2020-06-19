import AdminLayout from "../components/layouts/AdminLayout";
import {
  Button,
  Form,
  Input,
  notification,
  Popconfirm,
  Table,
  Modal,
} from "antd";
import React, { useCallback, useState, useContext, useEffect } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import { FETCH_DEFINED_LIST } from "~@/graphql/query";
import _ from "lodash";
import { PlusSquareOutlined } from "@ant-design/icons";
import { css } from "@emotion/core";
import moment from "moment";
import {
  DELETE_DEFINED_LIST,
  UPDATE_DATE_DEFINED_LIST,
} from "~@/graphql/mutation";

import ModalAddChart from "~@/components/ModalAddChart";

import AppContext from "~@/components/AppProvider";
import Redirect from "../components/Redirect";

const LIMIT = 30;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = (
    <Input type={dataIndex === "psa_line" ? "number" : "text"} />
  );
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default () => {
  const { user } = useContext(AppContext);
  const [modalAdd, setModalAdd] = useState(false);
  if (!user) {
    return <Redirect to="/login" />;
  }
  const gqlClient = useApolloClient();
  const [dataTable, setDataTable] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [isHasMore, setIsHasMore] = useState(true);

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      id: "",
      keyword: "",
      words: "",
      xchars: "",
      syncedAt: "",
      psa_link: "",
      psa_line: "",
      ...record,
    });
    setEditingKey(record.id);
  };
  const cancel = () => {
    setEditingKey("");
  };
  const save = async (id) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataTable];
      const index = newData.findIndex((item) => id === item.id);
      gqlClient.mutate({
        mutation: UPDATE_DATE_DEFINED_LIST,
        variables: {
          idDefinedList: newData[index].id,
          data: {
            exclusion: { ..._.omit(row, ["psa_link", "psa_line"]) },
            psa_line: row.psa_line,
            psa_link: row.psa_link,
          },
        },
      });
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setDataTable(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setDataTable(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const getMoreDefinedList = useCallback(async () => {
    setLoadingTable(true);
    const { data, errors } = await gqlClient.query({
      query: FETCH_DEFINED_LIST,
      variables: {
        limit: LIMIT,
        offset: dataTable.length,
      },
    });
    if (errors) return null;
    const serializeData = data.defined_list.map((item) => {
      return {
        ...item,
        xchars: item.exclusion.xchars,
        words: item.exclusion.words,
      };
    });

    if (serializeData.length === LIMIT) setIsHasMore(true);
    else setIsHasMore(false);

    setLoadingTable(false);
    setDataTable([...dataTable, ...serializeData]);
  }, [dataTable]);

  useEffect(() => {
    getMoreDefinedList();
  }, []);

  const handleDelete = (id) => {
    setLoadingTable(true);
    gqlClient
      .mutate({
        mutation: DELETE_DEFINED_LIST,
        variables: {
          idDefinedList: id,
        },
      })
      .then((res: any) => {
        notification.success({
          message: "Success",
          description: "Delete success",
        });
        setLoadingTable(res.loading);
        setDataTable(dataTable.filter((item) => item.id !== id));
      });
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
    },
    {
      title: "Keyword",
      dataIndex: "keyword",
    },
    {
      title: "SyncedAt",
      dataIndex: "syncedAt",
      render: (syncedAt) => <p>{moment(syncedAt).fromNow()}</p>,
    },
    {
      title: "words",
      dataIndex: "words",
      width: "100px",
      editable: true,
    },

    {
      title: "Psa link",
      dataIndex: "psa_link",
      editable: true,
    },
    {
      title: "Psa line",
      dataIndex: "psa_line",
      editable: true,
    },
    {
      title: "Action",
      dataIndex: "actionEdit",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <div>
            <span
              css={css`
                margin-right: 5px;
              `}
            >
              <a
                onClick={() => save(record.id)}
                style={{
                  marginRight: 8,
                }}
              >
                Save
              </a>
              <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                <a>Cancel</a>
              </Popconfirm>
            </span>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.id)}
            >
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </div>
        ) : (
          <div>
            <a
              css={css`
                margin-right: 5px;
              `}
              // @TODO: fix
              // disabled={editingKey !== "" ? true : false}
              onClick={() => edit(record)}
            >
              Edit
            </a>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.id)}
            >
              <a style={{ color: "red" }}>Delete</a>
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const addSuccessChart = (data) => {
    setDataTable([data, ...dataTable]);
  };

  return (
    <AdminLayout>
      <Button
        type="primary"
        color="green"
        icon={<PlusSquareOutlined />}
        onClick={() => setModalAdd(true)}
        css={css`
          margin-bottom: 10px;
        `}
      >
        Add chart
      </Button>
      {modalAdd && (
        <ModalAddChart
          show={modalAdd}
          onHideModal={() => setModalAdd(false)}
          addnewChart={addSuccessChart}
        />
      )}
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          columns={mergedColumns}
          rowKey={(record) => record.id}
          rowClassName="editable-row"
          dataSource={dataTable}
          pagination={false}
          loading={loadingTable}
        />
        {!loadingTable
          ? isHasMore && (
              <Button
                style={{ margin: "10px 0", float: "right" }}
                type="primary"
                onClick={getMoreDefinedList}
              >
                Load More
              </Button>
            )
          : ""}
      </Form>
    </AdminLayout>
  );
};
