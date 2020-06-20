import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout, Menu, Button } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DeleteOutlined,
  HomeOutlined,
  AreaChartOutlined,
  ToolFilled,
} from "@ant-design/icons";
const { Header, Sider, Content } = Layout;

export default (props) => {
  const router = useRouter();
  const selectedKey = router.route;
  console.log(router);

  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed(!collapsed);
  return (
    <div>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[`${selectedKey}`]}
          >
            <Menu.Item key="/">
              <a href="https://sellthepeak.com">
                <HomeOutlined />
                <span>Home</span>
              </a>
            </Menu.Item>
            <Menu.Item key="/charts">
              <Link href="/charts">
                <a>
                  <AreaChartOutlined />
                  <span>Charts</span>
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item key="/short-code">
              <Link href="/short-code">
                <a>
                  <ToolFilled />
                  <span>Short Code</span>
                </a>
              </Link>
            </Menu.Item>

            <Menu.Item key="/delete-requestion">
              <Link href="/delete-requestion">
                <a>
                  <DeleteOutlined />
                  <span>Delete Requestion</span>
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item key="/exclusion">
              <Link href="/exclusion">
                <a>
                  <DeleteOutlined />
                  <span>Exclusion</span>
                </a>
              </Link>
            </Menu.Item>
            <Menu.Item key="/setting-proxy">
              <Link href="/setting-proxy">
                <a>
                  <ToolFilled />
                  <span>Proxies</span>
                </a>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }}>
            <div>
              {collapsed ? (
                <Button
                  type="link"
                  className="trigger"
                  onClick={() => toggle()}
                >
                  <MenuUnfoldOutlined />
                </Button>
              ) : (
                <Button
                  type="link"
                  className="trigger"
                  onClick={() => toggle()}
                >
                  <MenuFoldOutlined />
                </Button>
              )}
            </div>
          </Header>
          <Content
            className="site-layout-background"
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
            }}
          >
            {props.children}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};
