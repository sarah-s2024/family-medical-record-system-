import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Row, 
  Col, 
  Spin,
  Empty,
  Tag,
  message,
  Statistic,
  Popconfirm,
  Space,
  DatePicker
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { getPatients, addPatient, updatePatient, deletePatient } from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Patients = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      const sortedPatients = (response.data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPatients(sortedPatients);
    } catch (error) {
      console.error('获取患者列表失败:', error);
      message.error('获取患者列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (values) => {
    try {
      setSubmitting(true);
      // 确保出生日期只保存日期部分，不包含时间
      const patientData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null
      };
      const response = await addPatient(patientData);
      
      if (response.success) {
        message.success('患者信息添加成功！');
        setModalVisible(false);
        form.resetFields();
        fetchPatients();
      } else {
        message.error('添加失败，请重试！');
      }
    } catch (error) {
      console.error('添加患者错误:', error);
      message.error('添加失败，请重试！');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPatient = async (values) => {
    try {
      setSubmitting(true);
      // 确保出生日期只保存日期部分，不包含时间
      const patientData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null
      };
      const response = await updatePatient(currentPatient.id, patientData);
      
      if (response.success) {
        message.success('患者信息更新成功！');
        setEditModalVisible(false);
        editForm.resetFields();
        setCurrentPatient(null);
        fetchPatients();
      } else {
        message.error('更新失败，请重试！');
      }
    } catch (error) {
      console.error('更新患者错误:', error);
      message.error('更新失败，请重试！');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      const response = await deletePatient(patientId);
      
      if (response.success) {
        message.success('患者删除成功！');
        fetchPatients();
      } else {
        message.error('删除失败，请重试！');
      }
    } catch (error) {
      console.error('删除患者错误:', error);
      message.error('删除失败，请重试！');
    }
  };

  const showAddModal = () => {
    setModalVisible(true);
  };

  const showEditModal = (patient) => {
    setCurrentPatient(patient);
    editForm.setFieldsValue({
      name: patient.name,
      birthDate: patient.birthDate ? dayjs(patient.birthDate) : null,
      gender: patient.gender,
      height: patient.height,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      currentMedications: patient.currentMedications,
      medicalHistory: patient.medicalHistory,
      surgicalHistory: patient.surgicalHistory,
      allergies: patient.allergies,
      socialHistory: patient.socialHistory,
      familyHistory: patient.familyHistory
    });
    setEditModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    editForm.resetFields();
    setCurrentPatient(null);
  };

  const getGenderColor = (gender) => {
    return gender === '男' ? 'blue' : 'pink';
  };

  const getAgeGroup = (birthDate) => {
    if (!birthDate) return { text: '未知', color: 'default' };
    const age = dayjs().diff(dayjs(birthDate), 'year');
    if (age < 18) return { text: '儿童', color: 'green', age };
    if (age < 60) return { text: '成年', color: 'blue', age };
    return { text: '老年', color: 'orange', age };
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
      <Title level={2}>家庭成员管理</Title>
      <Text type="secondary">
        管理家庭成员基本信息，支持添加、编辑和删除家庭成员
      </Text>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginTop: 24, marginBottom: 16 }}>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="家庭成员总数"
              value={patients.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="男性家庭成员"
              value={patients.filter(p => p.gender === '男').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="女性家庭成员"
              value={patients.filter(p => p.gender === '女').length}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="今日新增"
              value={patients.filter(p => dayjs(p.createdAt).isSame(dayjs(), 'day')).length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作按钮 */}
      <Card style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
          size="large"
        >
          添加新家庭成员
        </Button>
      </Card>

      {/* 患者列表 */}
      <Card title={`家庭成员列表 (${patients.length} 人)`}>
        {patients.length === 0 ? (
          <Empty description="暂无家庭成员信息" />
        ) : (
          <Row gutter={[16, 16]}>
            {patients.map(patient => (
              <Col xs={24} sm={12} md={8} lg={6} key={patient.id}>
                <Card
                  title={patient.name}
                  extra={<Tag color={getGenderColor(patient.gender)}>{patient.gender}</Tag>}
                  actions={[
                    <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(patient)}>编辑</Button>,
                    <Popconfirm 
                      title="确定要删除该家庭成员吗？" 
                      description="删除家庭成员将同时删除该家庭成员的所有医疗记录，此操作不可恢复！"
                      onConfirm={() => handleDeletePatient(patient.id)} 
                      okText="删除" 
                      cancelText="取消"
                      okType="danger"
                    >
                      <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
                    </Popconfirm>
                  ]}
                  style={{ marginBottom: 16 }}
                >
                  <p><b>出生日期：</b>{patient.birthDate ? dayjs(patient.birthDate).format('YYYY-MM-DD') : '未填写'}</p>
                  <p><b>身高：</b>{patient.height ? `${patient.height} cm` : '未填写'}</p>
                  <p><b>联系电话：</b>{patient.phone || '未填写'}</p>
                  <p><b>邮箱：</b>{patient.email || '未填写'}</p>
                  <p><b>地址：</b>{patient.address || '未填写'}</p>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      {/* 添加患者模态框 */}
      <Modal
        title="添加新家庭成员"
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddPatient}
          initialValues={{
            gender: '男'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="家庭成员姓名"
                rules={[{ required: true, message: '请输入家庭成员姓名' }]}
              >
                <Input placeholder="请输入家庭成员姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="birthDate"
                label="出生日期"
                rules={[{ required: true, message: '请选择出生日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="选择性别">
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="height"
                label="身高 (cm)"
              >
                <Input placeholder="请输入身高" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone"
                label="联系电话"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="邮箱地址"
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            name="address"
            label="联系地址"
          >
            <Input placeholder="请输入联系地址" />
          </Form.Item>

          <Form.Item
            name="currentMedications"
            label="目前用药"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入目前正在使用的药物（可选）"
            />
          </Form.Item>

          <Form.Item
            name="medicalHistory"
            label="既往病史"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入既往病史（可选）"
            />
          </Form.Item>

          <Form.Item
            name="surgicalHistory"
            label="手术史"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入手术史（可选）"
            />
          </Form.Item>

          <Form.Item
            name="allergies"
            label="过敏史"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入过敏史（可选）"
            />
          </Form.Item>

          <Form.Item
            name="socialHistory"
            label="社会史"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入社会史（如吸烟、饮酒等）（可选）"
            />
          </Form.Item>

          <Form.Item
            name="familyHistory"
            label="家族史"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入家族史（可选）"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              style={{ marginRight: 8 }}
            >
              保存
            </Button>
            <Button onClick={handleCancel}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑患者模态框 */}
      <Modal
        title={`编辑家庭成员 - ${currentPatient?.name || ''}`}
        open={editModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditPatient}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="家庭成员姓名"
                rules={[{ required: true, message: '请输入家庭成员姓名' }]}
              >
                <Input placeholder="请输入家庭成员姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="birthDate"
                label="出生日期"
                rules={[{ required: true, message: '请选择出生日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="选择性别">
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="height"
                label="身高 (cm)"
              >
                <Input placeholder="请输入身高" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone"
                label="联系电话"
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="邮箱地址"
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>

          <Form.Item
            name="address"
            label="联系地址"
          >
            <Input placeholder="请输入联系地址" />
          </Form.Item>

          <Form.Item
            name="currentMedications"
            label="目前用药"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入目前正在使用的药物（可选）"
            />
          </Form.Item>

          <Form.Item
            name="medicalHistory"
            label="既往病史"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入既往病史（可选）"
            />
          </Form.Item>

          <Form.Item
            name="surgicalHistory"
            label="手术史"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入手术史（可选）"
            />
          </Form.Item>

          <Form.Item
            name="allergies"
            label="过敏史"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入过敏史（可选）"
            />
          </Form.Item>

          <Form.Item
            name="socialHistory"
            label="社会史"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入社会史（如吸烟、饮酒等）（可选）"
            />
          </Form.Item>

          <Form.Item
            name="familyHistory"
            label="家族史"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="请输入家族史（可选）"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              style={{ marginRight: 8 }}
            >
              更新
            </Button>
            <Button onClick={handleEditCancel}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Patients; 