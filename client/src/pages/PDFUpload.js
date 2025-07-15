import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Card, 
  Typography, 
  Alert, 
  Spin, 
  Descriptions, 
  Tag, 
  Button,
  message,
  Select,
  Divider,
  Row,
  Col
} from 'antd';
import { InboxOutlined, FilePdfOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { uploadPDF, getPatients } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

const PDFUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setPatientsLoading(true);
      const response = await getPatients();
      setPatients(response.data || []);
    } catch (error) {
      console.error('获取患者列表失败:', error);
      message.error('获取患者列表失败');
    } finally {
      setPatientsLoading(false);
    }
  };

  const handlePatientChange = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
  };

  const getAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return '';
    return dayjs().diff(dayjs(birthDate), 'year');
  };

  const uploadProps = {
    name: 'pdf',
    multiple: false,
    accept: '*', // 接受所有文件类型
    beforeUpload: (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过10MB！');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: (info) => {
      if (info.file.status === 'removed') {
        setParsedData(null);
        setError(null);
      }
    },
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setError(null);
      setParsedData(null);

      // 创建FormData，可选包含患者ID
      const formData = new FormData();
      formData.append('pdf', file);
      if (selectedPatient) {
        formData.append('patientId', selectedPatient.id);
      }

      const response = await uploadPDF(formData);
      
      if (response.success) {
        setParsedData(response.data);
        const matchStatus = response.parseSummary?.patientMatched ? 
          '已自动匹配到现有家庭成员' : 
          '已自动创建新家庭成员';
        message.success(`PDF文件解析成功！${matchStatus}。`);
      } else {
        setError(response.error || '解析失败');
        message.error('PDF文件解析失败！');
      }
    } catch (error) {
      console.error('上传错误:', error);
      setError(error.response?.data?.error || '上传失败，请重试');
      message.error('上传失败，请重试！');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentTypeText = (type) => {
    const texts = {
      'inpatient_record': '住院记录',
      'outpatient_record': '门诊记录',
      'lab_result': '检验报告',
      'diagnostic_report': '检查报告',
      'other': '其他'
    };
    return texts[type] || '未知';
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'inpatient_record': 'blue',
      'outpatient_record': 'green',
      'lab_result': 'orange',
      'diagnostic_report': 'purple',
      'other': 'default'
    };
    return colors[type] || 'default';
  };

  // 渲染患者选择区域
  const renderPatientSelection = () => {
    return (
      <>
        <Divider orientation="left">家庭成员选择（可选）</Divider>
        <Alert
          message="AI智能匹配提示"
          description="AI会自动从PDF中识别家庭成员姓名并匹配到现有家庭成员。如果没有匹配到，会自动创建新的家庭成员。您也可以手动选择家庭成员以确保准确性。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col span={12}>
            <Select
              placeholder="请选择家庭成员（可选）"
              loading={patientsLoading}
              onChange={handlePatientChange}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              style={{ width: '100%' }}
            >
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{patient.name}</span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {patient.gender} | {getAgeFromBirthDate(patient.birthDate)}岁
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            {selectedPatient && (
              <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                  <Text strong>已选择家庭成员：{selectedPatient.name}</Text>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div>性别：{selectedPatient.gender}</div>
                  <div>年龄：{getAgeFromBirthDate(selectedPatient.birthDate)}岁</div>
                  {selectedPatient.phone && <div>电话：{selectedPatient.phone}</div>}
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </>
    );
  };

  return (
    <div>
      <Title level={2}>AI智能文档解析</Title>
      <Text type="secondary">
        支持上传多种格式的医疗文档，AI智能解析并提取关键信息，自动保存到医疗记录库
      </Text>

      {renderPatientSelection()}

      <Card style={{ marginTop: 24 }}>
        <Dragger
          {...uploadProps}
          customRequest={({ file }) => handleUpload(file)}
          disabled={uploading || !selectedPatient}
        >
          <p className="ant-upload-drag-icon">
            {uploading ? <Spin size="large" /> : <InboxOutlined />}
          </p>
          <p className="ant-upload-text">
            {uploading ? 'AI正在智能解析文件...' : 
             !selectedPatient ? '请先选择家庭成员' : '点击或拖拽文件到此区域上传'}
          </p>
          <p className="ant-upload-hint">
            支持PDF、Word、TXT等文档格式，文件大小不超过10MB
          </p>
        </Dragger>
      </Card>

      {error && (
        <Alert
          message="解析错误"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}

      {parsedData && (
        <Card title="AI智能解析结果" style={{ marginTop: 16 }}>
          {/* AI解析摘要 */}
          {parsedData.parseSummary && (
            <Alert
              message="AI解析摘要"
              description={
                <div>
                  <p><strong>文档类型:</strong> {getDocumentTypeText(parsedData.documentType)}</p>
                  <p><strong>解析置信度:</strong> {parsedData.parseSummary.confidence?.toFixed(1)}%</p>
                  <p><strong>提取字段数:</strong> {parsedData.parseSummary.extractedFields}个</p>
                  <p><strong>识别关键词:</strong> {parsedData.parseSummary.keywords}个</p>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          
          <Descriptions bordered column={2}>
            <Descriptions.Item label="文档类型">
              <Tag color={getDocumentTypeColor(parsedData.documentType)}>
                {getDocumentTypeText(parsedData.documentType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="文件名">
              {parsedData.fileName}
            </Descriptions.Item>
            
            {parsedData.patientInfo.name && (
              <Descriptions.Item label="家庭成员姓名">
                {parsedData.patientInfo.name}
              </Descriptions.Item>
            )}
            
            {parsedData.patientInfo.birthDate && (
              <Descriptions.Item label="出生日期">
                {dayjs(parsedData.patientInfo.birthDate).format('YYYY-MM-DD')}
              </Descriptions.Item>
            )}
            
            {parsedData.patientInfo.gender && (
              <Descriptions.Item label="性别">
                {parsedData.patientInfo.gender}
              </Descriptions.Item>
            )}
            
            {parsedData.medicalData.diagnosis && (
              <Descriptions.Item label="诊断" span={2}>
                {parsedData.medicalData.diagnosis}
              </Descriptions.Item>
            )}
            
            {parsedData.medicalData.symptoms && (
              <Descriptions.Item label="症状" span={2}>
                {parsedData.medicalData.symptoms}
              </Descriptions.Item>
            )}
            
            {parsedData.medicalData.treatment && (
              <Descriptions.Item label="治疗" span={2}>
                {parsedData.medicalData.treatment}
              </Descriptions.Item>
            )}
            
            {parsedData.keywords.length > 0 && (
              <Descriptions.Item label="识别疾病" span={2}>
                {parsedData.keywords.map(keyword => (
                  <Tag key={keyword} color="blue" style={{ marginBottom: 4 }}>
                    {keyword}
                  </Tag>
                ))}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button 
              type="primary" 
              icon={<FilePdfOutlined />}
              onClick={() => {
                setParsedData(null);
                setError(null);
              }}
              style={{ marginRight: 8 }}
            >
              继续上传
            </Button>
            <Button 
              type="default" 
              icon={<EyeOutlined />}
              onClick={() => navigate('/records')}
            >
              查看所有记录
            </Button>
          </div>
        </Card>
      )}

      <Card title="AI智能解析支持" style={{ marginTop: 16 }}>
        <ul>
          <li><strong>文档格式</strong> - 支持PDF、Word、TXT等多种文档格式</li>
          <li><strong>住院记录 (Inpatient Records)</strong> - 智能识别患者住院信息、症状描述、医生诊断等</li>
          <li><strong>门诊记录 (Outpatient Records)</strong> - 自动提取患者门诊就诊信息、检查结果等</li>
          <li><strong>检验报告 (Lab Results)</strong> - AI识别血液检查、尿液检查、影像学检查等结果</li>
          <li><strong>检查报告 (Diagnostic Reports)</strong> - 智能分析检查结果、影像诊断、检查描述等</li>
          <li><strong>其他医疗文档</strong> - 支持各种包含医疗信息的文档格式</li>
        </ul>
        
        <Alert
          message="AI智能解析功能"
          description="系统采用AI智能算法，自动识别文档中的患者信息、诊断结果、症状描述等关键信息，并提取相关疾病关键词。支持中英文文档，提供解析置信度评估，确保数据准确性。"
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>
    </div>
  );
};

export default PDFUpload; 