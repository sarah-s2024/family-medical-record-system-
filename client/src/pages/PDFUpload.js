import React, { useState, useEffect } from 'react';
import {
  Upload,
  Button,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Alert,
  Spin,
  List,
  Tag,
  Divider,
  Space,
  message
} from 'antd';
import { InboxOutlined, FilePdfOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { uploadPDF, getPatients } from '../utils/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

const PDFUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await getPatients();
      if (response.success) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('获取患者列表失败:', error);
      message.error('获取患者列表失败');
    }
  };

  const uploadProps = {
    name: 'pdf',
    multiple: false,
    maxCount: 1,
    accept: '.pdf,.txt,.doc,.docx',
    showUploadList: false,
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'text/plain' ||
                         file.type === 'application/msword' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      if (!isValidType) {
        message.error('只支持 PDF、TXT、DOC、DOCX 格式的文件！');
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB！');
        return false;
      }
      
      return false; // 阻止自动上传
    }
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setUploadResult(null);
      
      const formData = new FormData();
      formData.append('pdf', file);
      
      if (selectedPatient) {
        formData.append('patientId', selectedPatient);
      }
      
      const response = await uploadPDF(formData);
      
      if (response.success) {
        setUploadResult(response);
        
        const matchStatus = response.parseSummary?.patientMatched ? 
          '已自动匹配到现有家庭成员' : 
          '已创建新的家庭成员';
        
        message.success(`PDF文件解析成功！${matchStatus}。`);
        loadPatients(); // 重新加载患者列表
      } else {
        message.error('PDF文件解析失败！');
      }
    } catch (error) {
      console.error('上传失败:', error);
      message.error(`上传失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const renderUploadResult = () => {
    if (!uploadResult) return null;

    const { data, parseSummary } = uploadResult;

    return (
      <Card title="解析结果" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Alert
              message="AI智能解析成功"
              description={
                <div>
                  <p><strong>文档类型:</strong> {getDocumentTypeText(data.documentType)}</p>
                  <p><strong>解析置信度:</strong> {parseSummary.confidence}%</p>
                  <p><strong>家庭成员:</strong> {data.patientInfo.name}</p>
                  <p><strong>识别关键词:</strong> {parseSummary.keywords}个</p>
                  <p><strong>提取字段:</strong> {parseSummary.extractedFields}个</p>
                </div>
              }
              type="success"
              showIcon
            />
          </Col>
          
          <Col span={12}>
            <Card size="small" title="患者信息">
              <p><UserOutlined /> <strong>姓名:</strong> {data.patientInfo.name}</p>
              <p><strong>性别:</strong> {data.patientInfo.gender}</p>
              <p><strong>出生日期:</strong> {data.patientInfo.birthDate}</p>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" title="医疗机构">
              <p><strong>机构:</strong> {data.medicalData.medicalInstitution}</p>
              <p><strong>日期:</strong> {new Date(data.date).toLocaleDateString()}</p>
            </Card>
          </Col>
          
          {data.keywords && data.keywords.length > 0 && (
            <Col span={24}>
              <Card size="small" title="关键词标签">
                <Space wrap>
                  {data.keywords.map((keyword, index) => (
                    <Tag key={index} color="blue">{keyword}</Tag>
                  ))}
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    );
  };

  const getDocumentTypeText = (type) => {
    const texts = {
      'inpatient_record': '住院记录',
      'outpatient_record': '门诊记录',
      'lab_result': '检验报告',
      'diagnostic_report': '检查报告',
      'other': '其他医疗文档'
    };
    return texts[type] || '未知类型';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card>
            <Title level={2}>
              <FilePdfOutlined style={{ marginRight: 8 }} />
              PDF智能上传
            </Title>
            <Alert
              message="AI智能解析说明"
              description="AI会自动从PDF中识别家庭成员姓名并匹配到现有家庭成员。如果没有匹配到，会自动创建新的家庭成员。您也可以手动选择家庭成员以确保准确性。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small" title="选择家庭成员（可选）">
                  <Select
                    placeholder="选择现有家庭成员，或让AI自动识别"
                    style={{ width: '100%' }}
                    value={selectedPatient}
                    onChange={setSelectedPatient}
                    allowClear
                  >
                    {patients.map(patient => (
                      <Option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.gender}, {patient.birthDate})
                      </Option>
                    ))}
                  </Select>
                </Card>
              </Col>
              
              <Col span={24}>
                <Dragger
                  {...uploadProps}
                  customRequest={({ file }) => handleUpload(file)}
                  disabled={uploading}
                >
                  <p className="ant-upload-drag-icon">
                    {uploading ? <Spin size="large" /> : <InboxOutlined />}
                  </p>
                  <p className="ant-upload-text">
                    {uploading ? 'AI正在智能解析文件...' :
                      '点击或拖拽文件到此区域上传'}
                  </p>
                  <p className="ant-upload-hint">
                    支持PDF、Word、TXT等文档格式，文件大小不超过10MB
                  </p>
                </Dragger>
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={24}>
          {renderUploadResult()}
        </Col>
        
        <Col span={24}>
          <Card title="功能说明">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card size="small" bordered={false}>
                  <div style={{ textAlign: 'center' }}>
                    <FilePdfOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                    <Title level={4}>智能识别</Title>
                    <Paragraph>
                      AI自动识别文档类型、患者信息、医疗数据等关键信息
                    </Paragraph>
                  </div>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card size="small" bordered={false}>
                  <div style={{ textAlign: 'center' }}>
                    <UserOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                    <Title level={4}>自动匹配</Title>
                    <Paragraph>
                      智能匹配现有家庭成员，或自动创建新成员档案
                    </Paragraph>
                  </div>
                </Card>
              </Col>
              
              <Col span={8}>
                <Card size="small" bordered={false}>
                  <div style={{ textAlign: 'center' }}>
                    <EyeOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />
                    <Title level={4}>数据整理</Title>
                    <Paragraph>
                      自动整理医疗记录，提取关键词，便于后续查询分析
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Title level={4}>支持的文档类型</Title>
            <List
              size="small"
              dataSource={[
                { icon: <FilePdfOutlined />, title: '医疗报告', desc: '支持PDF、Word、TXT等多种文档格式' },
                { icon: <FilePdfOutlined />, title: '检验结果', desc: '血常规、生化检查、影像学检查等' },
                { icon: <FilePdfOutlined />, title: '病历记录', desc: '门诊记录、住院记录、诊断报告等' },
                { icon: <FilePdfOutlined />, title: '其他文档', desc: '健康证明、体检报告等医疗相关文档' }
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={item.desc}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PDFUpload; 