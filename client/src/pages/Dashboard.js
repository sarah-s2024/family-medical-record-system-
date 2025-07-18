import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Typography, Spin, Collapse, Avatar, Space, Divider } from 'antd';
import { 
  FileTextOutlined, 
  UserOutlined, 
  BarChartOutlined,
  UploadOutlined,
  ManOutlined,
  WomanOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { getMedicalRecords, getPatients } from '../utils/api';
import dayjs from 'dayjs';

const { Panel } = Collapse;

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayNewRecords: 0,
    patientStats: []
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

      // 统计今日新增记录
      const todayNewRecords = records.filter(r => 
        dayjs(r.date).isSame(dayjs(), 'day')
      ).length;

      // 按家庭成员分类统计
      const patientStats = patients.map(patient => {
        // 获取该患者的所有记录
        const patientRecords = records.filter(record => 
          record.patientInfo.name === patient.name
        );

        // 统计疾病类型
        const diseaseStats = {};
        patientRecords.forEach(record => {
          record.keywords.forEach(keyword => {
            if (keyword.trim()) {
              diseaseStats[keyword] = (diseaseStats[keyword] || 0) + 1;
            }
          });
        });

        // 获取最近的医疗记录（最多3条）
        const recentRecords = patientRecords
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);

        return {
          ...patient,
          recordCount: patientRecords.length,
          diseaseTypes: Object.keys(diseaseStats).length,
          diseaseStats,
          recentRecords
        };
      });

      setStats({
        totalPatients: patients.length,
        todayNewRecords,
        patientStats
      });
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'inpatient_record': 'blue',
      'outpatient_record': 'cyan',
      'lab_result': 'green',
      'diagnostic_report': 'orange',
      'manual': 'purple',
      'other': 'default'
    };
    return colors[type] || 'default';
  };

  const getDocumentTypeText = (type) => {
    const texts = {
      'inpatient_record': '住院记录',
      'outpatient_record': '门诊记录',
      'lab_result': '检验报告',
      'diagnostic_report': '检查报告',
      'manual': '手动录入',
      'other': '其他'
    };
    return texts[type] || '未知';
  };

  // 渲染单个患者统计面板
  const renderPatientPanel = (patient) => {
    const genderIcon = patient.gender === '男' ? <ManOutlined /> : <WomanOutlined />;
    const age = dayjs().diff(dayjs(patient.birthDate), 'year');
    
    return (
      <div style={{ padding: '16px 0' }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {/* 患者基本信息 */}
          <Col span={24}>
            <Space align="center" style={{ marginBottom: 16 }}>
              <Avatar size={48} icon={genderIcon} style={{ 
                backgroundColor: patient.gender === '男' ? '#1890ff' : '#f759ab'
              }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>{patient.name}</Title>
                <Text type="secondary">{patient.gender} · {age}岁</Text>
              </div>
            </Space>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          {/* 医疗记录数量 */}
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="医疗记录"
                value={patient.recordCount}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '18px' }}
              />
            </Card>
          </Col>
          {/* 疾病类型 */}
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="疾病类型"
                value={patient.diseaseTypes}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
              />
            </Card>
          </Col>
          {/* 最近记录时间 */}
          <Col span={8}>
            <Card size="small">
              <Statistic
                title="最近记录"
                value={patient.recentRecords.length > 0 ? 
                  dayjs(patient.recentRecords[0].date).format('MM-DD') : '无'}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14', fontSize: '18px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* 疾病分布 */}
          <Col span={12}>
            <Card title="疾病分布" size="small" style={{ height: 200 }}>
              {Object.keys(patient.diseaseStats).length > 0 ? (
                <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                  {Object.entries(patient.diseaseStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([disease, count]) => (
                      <div key={disease} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: 8
                      }}>
                        <Tag color="blue" style={{ margin: 0 }}>{disease}</Tag>
                        <Text strong>{count} 次</Text>
                      </div>
                    ))}
                  {Object.keys(patient.diseaseStats).length > 5 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ...等 {Object.keys(patient.diseaseStats).length} 种疾病
                    </Text>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                  暂无疾病记录
                </div>
              )}
            </Card>
          </Col>
          
          {/* 最近医疗记录 */}
          <Col span={12}>
            <Card title="最近医疗记录" size="small" style={{ height: 200 }}>
              {patient.recentRecords.length > 0 ? (
                <div style={{ maxHeight: 140, overflowY: 'auto' }}>
                  <List
                    size="small"
                    dataSource={patient.recentRecords}
                    renderItem={(record) => (
                      <List.Item style={{ padding: '4px 0' }}>
                        <List.Item.Meta
                          title={
                            <div style={{ fontSize: '12px' }}>
                              <Tag size="small" color={getDocumentTypeColor(record.documentType)}>
                                {getDocumentTypeText(record.documentType)}
                              </Tag>
                              <Text style={{ fontSize: '12px' }}>
                                {dayjs(record.date).format('MM-DD HH:mm')}
                              </Text>
                            </div>
                          }
                          description={
                            record.keywords.length > 0 ? (
                              <div style={{ fontSize: '11px' }}>
                                {record.keywords.slice(0, 2).map(keyword => (
                                  <Tag key={keyword} size="small" color="blue">
                                    {keyword}
                                  </Tag>
                                ))}
                              </div>
                            ) : null
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>
                  暂无医疗记录
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
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
      
      {/* 统计卡片 - 保留家庭成员总数和今日新增 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="家庭成员总数"
              value={stats.totalPatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="今日新增记录"
              value={stats.todayNewRecords}
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 家庭成员分类展示 */}
      <Card title="家庭成员详细信息" style={{ marginTop: 24 }}>
        {stats.patientStats.length > 0 ? (
          <Collapse 
            defaultActiveKey={stats.patientStats.length > 0 ? [stats.patientStats[0].id] : []}
            ghost
          >
            {stats.patientStats.map((patient) => (
              <Panel 
                key={patient.id}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Space align="center">
                      <Avatar 
                        icon={patient.gender === '男' ? <ManOutlined /> : <WomanOutlined />} 
                        style={{ 
                          backgroundColor: patient.gender === '男' ? '#1890ff' : '#f759ab',
                          marginRight: 8
                        }} 
                      />
                      <div>
                        <Text strong style={{ fontSize: '16px' }}>{patient.name}</Text>
                        <Text type="secondary" style={{ marginLeft: 8, fontSize: '14px' }}>
                          {patient.gender} · {dayjs().diff(dayjs(patient.birthDate), 'year')}岁
                        </Text>
                      </div>
                    </Space>
                    <Space>
                      <Tag color="blue">{patient.recordCount} 条记录</Tag>
                      <Tag color="green">{patient.diseaseTypes} 种疾病</Tag>
                    </Space>
                  </div>
                }
              >
                {renderPatientPanel(patient)}
              </Panel>
            ))}
          </Collapse>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
            暂无家庭成员数据
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard; 