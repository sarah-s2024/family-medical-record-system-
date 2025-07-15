import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Typography, Spin } from 'antd';
import { 
  FileTextOutlined, 
  UserOutlined, 
  BarChartOutlined,
  UploadOutlined 
} from '@ant-design/icons';
import { getMedicalRecords, getPatients } from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalPatients: 0,
    recentRecords: [],
    diseaseStats: {}
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [recordsResponse, patientsResponse] = await Promise.all([
        getMedicalRecords(),
        getPatients()
      ]);

      const records = recordsResponse.data || [];
      const patients = patientsResponse.data || [];

      // 统计疾病数据
      const diseaseStats = {};
      records.forEach(record => {
        record.keywords.forEach(keyword => {
          diseaseStats[keyword] = (diseaseStats[keyword] || 0) + 1;
        });
      });

      // 获取最近的记录
      const recentRecords = records
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setStats({
        totalRecords: records.length,
        totalPatients: patients.length,
        recentRecords,
        diseaseStats
      });
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'visit_note': 'blue',
      'lab_result': 'green',
      'diagnostic_report': 'orange',
      'manual': 'purple',
      'other': 'default'
    };
    return colors[type] || 'default';
  };

  const getDocumentTypeText = (type) => {
    const texts = {
      'visit_note': '就诊记录',
      'lab_result': '检验报告',
      'diagnostic_report': '检查报告',
      'manual': '手动录入',
      'other': '其他'
    };
    return texts[type] || '未知';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>系统概览</Title>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总医疗记录"
              value={stats.totalRecords}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="家庭成员总数"
              value={stats.totalPatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="疾病类型"
              value={Object.keys(stats.diseaseStats).length}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日新增"
              value={stats.recentRecords.filter(r => 
                dayjs(r.date).isSame(dayjs(), 'day')
              ).length}
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 最近记录 */}
        <Col span={12}>
          <Card title="最近医疗记录" style={{ height: 400 }}>
            <List
              dataSource={stats.recentRecords}
              renderItem={(record) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div>
                        <Tag color={getDocumentTypeColor(record.documentType)}>
                          {getDocumentTypeText(record.documentType)}
                        </Tag>
                        {record.patientInfo.name || '未知患者'}
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary">
                          {dayjs(record.date).format('YYYY-MM-DD HH:mm')}
                        </Text>
                        <br />
                        {record.medicalData.diagnosis && (
                          <Text>诊断: {record.medicalData.diagnosis}</Text>
                        )}
                        {record.keywords.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {record.keywords.map(keyword => (
                              <Tag key={keyword} size="small" color="blue">
                                {keyword}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 疾病统计 */}
        <Col span={12}>
          <Card title="疾病分布统计" style={{ height: 400 }}>
            {Object.keys(stats.diseaseStats).length > 0 ? (
              <List
                dataSource={Object.entries(stats.diseaseStats).sort((a, b) => b[1] - a[1])}
                renderItem={([disease, count]) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{disease}</span>
                          <Tag color="blue">{count} 条记录</Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                暂无疾病数据
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 