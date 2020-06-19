import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout, Menu, Button } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  VideoCameraOutlined,
  DeleteOutlined,
  HomeOutlined,
} from "@ant-design/icons";
const { Header, Sider, Content } = Layout;

export default (props) => {
  const router = useRouter();
  const selectedKey = router.route;

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
							<Link href="/">
								<a>
									<HomeOutlined />
									<span>Home</span>
								</a>
							</Link>
						</Menu.Item>
						<Menu.Item key="/defined-list">
							<Link href="/defined-list">
								<a>
									<VideoCameraOutlined />
									<span>Defined List</span>
								</a>
							</Link>
						</Menu.Item>
						<Menu.Item key="/delete-request">
							<Link href="/delete-request">
								<a>
									<DeleteOutlined />
									<span>Request Delete</span>
								</a>
							</Link>
						</Menu.Item>
						<Menu.Item key="/exclude-words">
							<Link href="/exclude-words">
								<a>
									<DeleteOutlined />
									<span>Exclude Words</span>
								</a>
							</Link>
						</Menu.Item>
						<Menu.Item key="/setting-proxy">
							<Link href="/setting-proxy">
								<a>
									<DeleteOutlined />
									<span>Setting Proxy</span>
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
