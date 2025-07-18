import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  FundOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PDFUpload from './pages/PDFUpload';
import ManualEntry from './pages/ManualEntry';
import Records from './pages/Records';
import Reports from './pages/Reports';
import './App.css';

const { Header, Sider, Content } = Layout;

function App() {
  const menuItems = [
    {
      key: '/dashboard',
      icon: <FundOutlined />,
      label: <Link to="/dashboard">仪表板</Link>,
    },
    {
      key: '/patients',
      icon: <TeamOutlined />,
      label: <Link to="/patients">家庭成员管理</Link>,
    },
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: <Link to="/upload">PDF上传</Link>,
    },
    {
      key: '/entry',
      icon: <PlusOutlined />,
      label: <Link to="/entry">手动录入</Link>,
    },
    {
      key: '/records',
      icon: <FileTextOutlined />,
      label: <Link to="/records">医疗记录</Link>,
    },
    {
      key: '/reports',
      icon: <FileSearchOutlined />,
      label: <Link to="/reports">报告生成</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          医疗数据管理系统
        </div>
      </Header>
      <Layout>
        <Sider width={250} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['/dashboard']}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: '8px'
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/upload" element={<PDFUpload />} />
              <Route path="/entry" element={<ManualEntry />} />
              <Route path="/records" element={<Records />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
