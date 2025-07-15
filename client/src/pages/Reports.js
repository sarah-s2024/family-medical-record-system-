import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Select, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Spin,
  Descriptions,
  List,
  Tag,
  Divider,
  Alert,
  Statistic,
  Timeline,
  message
} from 'antd';
import { 
  FileTextOutlined, 
  BarChartOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import { getMedicalRecords, generateDiseaseReport, getPatients, getReportTypes, getSubItems } from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [selectedSubItem, setSelectedSubItem] = useState('all');
  const [reportTypes, setReportTypes] = useState([]);
  const [subItems, setSubItems] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedReportType && selectedReportType !== 'all') {
      fetchSubItems();
    } else {
      setSubItems([{ value: 'all', label: '全部子项' }]);
      setSelectedSubItem('all');
    }
  }, [selectedReportType, selectedDisease]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsResponse, patientsResponse, reportTypesResponse] = await Promise.all([
        getMedicalRecords(),
        getPatients(),
        getReportTypes()
      ]);
      setRecords(recordsResponse.data || []);
      setPatients(patientsResponse.data || []);
      setReportTypes(reportTypesResponse.data || []);
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubItems = async () => {
    try {
      const response = await getSubItems(selectedReportType, selectedDisease);
      setSubItems(response.data || [{ value: 'all', label: '全部子项' }]);
      setSelectedSubItem('all');
    } catch (error) {
      console.error('获取子项目失败:', error);
      message.error('获取子项目失败');
    }
  };

  const getAllDiseases = () => {
    const diseases = new Set();
    records.forEach(record => {
      record.keywords.forEach(keyword => diseases.add(keyword));
    });
    return Array.from(diseases).sort();
  };

  const handleGenerateReport = async () => {
    if (!selectedDisease) {
      message.warning('请选择疾病');
      return;
    }

    try {
      setGenerating(true);
      const response = await generateDiseaseReport(
        selectedDisease, 
        selectedPatient, 
        selectedReportType, 
        selectedSubItem
      );
      
      if (response.success) {
        setReport(response.data);
        message.success('报告生成成功');
      }
    } catch (error) {
      console.error('生成报告失败:', error);
      message.error('生成报告失败');
    } finally {
      setGenerating(false);
    }
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
      <Title level={2}>疾病报告生成</Title>
      <Text type="secondary">
        根据疾病类型从医疗记录中提取相关数据，生成完整的疾病分析报告
      </Text>

      {/* 报告生成器 */}
      <Card title="生成疾病报告" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Text strong>选择疾病：</Text>
            <Select
              placeholder="选择要生成报告的疾病"
              value={selectedDisease}
              onChange={setSelectedDisease}
              style={{ width: '100%', marginTop: 8 }}
            >
              {getAllDiseases().map(disease => (
                <Option key={disease} value={disease}>
                  {disease}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>选择家庭成员（可选）：</Text>
            <Select
              placeholder="选择特定家庭成员，留空则包含所有家庭成员"
              value={selectedPatient}
              onChange={setSelectedPatient}
              allowClear
              style={{ width: '100%', marginTop: 8 }}
            >
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.age}岁, {patient.gender})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>报告类型：</Text>
            <Select
              placeholder="选择报告类型"
              value={selectedReportType}
              onChange={setSelectedReportType}
              style={{ width: '100%', marginTop: 8 }}
            >
              {reportTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Text strong>子项目（可选）：</Text>
            <Select
              placeholder="选择子项目"
              value={selectedSubItem}
              onChange={setSelectedSubItem}
              disabled={selectedReportType === 'all'}
              style={{ width: '100%', marginTop: 8 }}
            >
              {subItems.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={handleGenerateReport}
              loading={generating}
              disabled={!selectedDisease}
              size="large"
            >
              生成报告
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 疾病统计概览 */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="总疾病类型"
              value={getAllDiseases().length}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="总医疗记录"
              value={records.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="家庭成员总数"
              value={patients.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <Statistic
              title="今日记录"
              value={records.filter(r => dayjs(r.date).isSame(dayjs(), 'day')).length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 生成的报告 */}
      {report && (
        <Card title={`${report.disease} - 疾病分析报告`} style={{ marginTop: 16 }}>
          <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="报告ID">{report.id}</Descriptions.Item>
            <Descriptions.Item label="生成时间">
              {dayjs(report.generatedDate).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="相关记录数">{report.summary.totalRecords}</Descriptions.Item>
            <Descriptions.Item label="时间范围">
              {report.summary.dateRange.start && report.summary.dateRange.end ? (
                `${dayjs(report.summary.dateRange.start).format('YYYY-MM-DD')} 至 ${dayjs(report.summary.dateRange.end).format('YYYY-MM-DD')}`
              ) : '无时间范围'}
            </Descriptions.Item>
            <Descriptions.Item label="报告类型">
              {report.reportType === 'all' ? '全部类型' : getDocumentTypeText(report.reportType)}
            </Descriptions.Item>
            <Descriptions.Item label="子项目">
              {report.subItem === 'all' ? '全部子项' : report.subItem}
            </Descriptions.Item>
          </Descriptions>

          {/* 报告类型统计 */}
          {report.summary.reportTypeBreakdown && Object.keys(report.summary.reportTypeBreakdown).length > 0 && (
            <div className="report-section">
              <Title level={4}>报告类型分布</Title>
              <Row gutter={16}>
                {Object.entries(report.summary.reportTypeBreakdown).map(([type, count]) => (
                  <Col span={6} key={type}>
                    <Card size="small">
                      <Statistic
                        title={getDocumentTypeText(type)}
                        value={count}
                        prefix={<FileTextOutlined />}
                        valueStyle={{ color: getDocumentTypeColor(type) }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* 子项目统计 */}
          {report.summary.subItemBreakdown && Object.keys(report.summary.subItemBreakdown).length > 0 && (
            <div className="report-section">
              <Title level={4}>子项目分布</Title>
              <Row gutter={16}>
                {Object.entries(report.summary.subItemBreakdown).map(([item, count]) => (
                  <Col span={8} key={item}>
                    <Card size="small">
                      <Statistic
                        title={item}
                        value={count}
                        prefix={<BarChartOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* 症状分析 */}
          {report.analysis.commonSymptoms.length > 0 && (
            <div className="report-section">
              <Title level={4}>常见症状</Title>
              <List
                dataSource={report.analysis.commonSymptoms}
                renderItem={(symptom, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`症状 ${index + 1}`}
                      description={symptom}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 治疗方案 */}
          {report.analysis.treatments.length > 0 && (
            <div className="report-section">
              <Title level={4}>治疗方案</Title>
              <List
                dataSource={report.analysis.treatments}
                renderItem={(treatment, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`治疗方案 ${index + 1}`}
                      description={treatment}
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 检验结果 */}
          {report.analysis.labResults.length > 0 && (
            <div className="report-section">
              <Title level={4}>检验结果</Title>
              <List
                dataSource={report.analysis.labResults}
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
                          {record.medicalData.testCategory && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong>检验类别：</Text>
                              <Text>{record.medicalData.testCategory}</Text>
                            </div>
                          )}
                          {record.medicalData.testItem && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>检验项目：</Text>
                              <Text>{record.medicalData.testItem}</Text>
                            </div>
                          )}
                          {record.medicalData.subItems && record.medicalData.subItems.length > 0 && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>子项目：</Text>
                              {record.medicalData.subItems.map((item, index) => (
                                <Tag key={index} size="small" style={{ marginLeft: 4 }}>
                                  {item.subItemName}: {item.result}
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
            </div>
          )}

          {/* 检查结果 */}
          {report.analysis.diagnosticResults.length > 0 && (
            <div className="report-section">
              <Title level={4}>检查结果</Title>
              <List
                dataSource={report.analysis.diagnosticResults}
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
                          {record.medicalData.checkType && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong>检查类型：</Text>
                              <Text>{record.medicalData.checkType}</Text>
                            </div>
                          )}
                          {record.medicalData.checkName && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>检查名称：</Text>
                              <Text>{record.medicalData.checkName}</Text>
                            </div>
                          )}
                          {record.medicalData.checkResult && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>检查结果：</Text>
                              <Text>{record.medicalData.checkResult}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 门诊数据 */}
          {report.analysis.outpatientData.length > 0 && (
            <div className="report-section">
              <Title level={4}>门诊记录</Title>
              <List
                dataSource={report.analysis.outpatientData}
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
                          {record.medicalData.chiefComplaint && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong>主诉：</Text>
                              <Text>{record.medicalData.chiefComplaint}</Text>
                            </div>
                          )}
                          {record.medicalData.diagnosis && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>诊断：</Text>
                              <Text>{record.medicalData.diagnosis}</Text>
                            </div>
                          )}
                          {record.medicalData.treatment && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>治疗：</Text>
                              <Text>{record.medicalData.treatment}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 住院数据 */}
          {report.analysis.inpatientData.length > 0 && (
            <div className="report-section">
              <Title level={4}>住院记录</Title>
              <List
                dataSource={report.analysis.inpatientData}
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
                          {record.medicalData.inpatientDepartment && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong>住院科室：</Text>
                              <Text>{record.medicalData.inpatientDepartment}</Text>
                            </div>
                          )}
                          {record.medicalData.inpatientChiefComplaint && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>主诉：</Text>
                              <Text>{record.medicalData.inpatientChiefComplaint}</Text>
                            </div>
                          )}
                          {record.medicalData.inpatientDiagnosis && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>诊断：</Text>
                              <Text>{record.medicalData.inpatientDiagnosis}</Text>
                            </div>
                          )}
                          {record.medicalData.inpatientTreatment && (
                            <div style={{ marginTop: 4 }}>
                              <Text strong>治疗：</Text>
                              <Text>{record.medicalData.inpatientTreatment}</Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 时间线 */}
          <div className="report-section">
            <Title level={4}>疾病发展时间线</Title>
            <Timeline>
              {report.records
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((record, index) => (
                  <Timeline.Item key={record.id}>
                    <div>
                      <Text strong>{dayjs(record.date).format('YYYY-MM-DD HH:mm')}</Text>
                      <Tag color={getDocumentTypeColor(record.documentType)} style={{ marginLeft: 8 }}>
                        {getDocumentTypeText(record.documentType)}
                      </Tag>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {record.patientInfo.name && (
                        <Text>患者：{record.patientInfo.name}</Text>
                      )}
                      {record.medicalData.diagnosis && (
                        <div style={{ marginTop: 4 }}>
                          <Text strong>诊断：</Text>
                          <Text>{record.medicalData.diagnosis}</Text>
                        </div>
                      )}
                      {record.medicalData.symptoms && (
                        <div style={{ marginTop: 4 }}>
                          <Text strong>症状：</Text>
                          <Text>{record.medicalData.symptoms}</Text>
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
            </Timeline>
          </div>

          {/* 相关记录详情 */}
          <div className="report-section">
            <Title level={4}>相关医疗记录详情</Title>
            <List
              dataSource={report.records}
              renderItem={(record) => (
                <List.Item className="medical-record-card">
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Tag color={getDocumentTypeColor(record.documentType)}>
                            {getDocumentTypeText(record.documentType)}
                          </Tag>
                          <span style={{ marginLeft: 8, fontWeight: 'bold' }}>
                            {record.patientInfo.name || '未知患者'}
                          </span>
                          {record.patientInfo.age && (
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              ({record.patientInfo.age}岁, {record.patientInfo.gender})
                            </Text>
                          )}
                        </div>
                        <Text type="secondary">
                          {dayjs(record.date).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        {record.medicalData.diagnosis && (
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>诊断：</Text>
                            <Text>{record.medicalData.diagnosis}</Text>
                          </div>
                        )}
                        {record.medicalData.symptoms && (
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>症状：</Text>
                            <Text>{record.medicalData.symptoms}</Text>
                          </div>
                        )}
                        {record.medicalData.treatment && (
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>治疗：</Text>
                            <Text>{record.medicalData.treatment}</Text>
                          </div>
                        )}
                        {record.keywords.length > 0 && (
                          <div>
                            <Text strong>相关疾病：</Text>
                            {record.keywords.map(keyword => (
                              <Tag key={keyword} size="small" color="blue" className="disease-tag">
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
          </div>
        </Card>
      )}

      {/* 使用说明 */}
      <Card title="使用说明" style={{ marginTop: 16 }}>
        <Alert
          message="报告生成功能说明"
          description={
            <div>
              <p><strong>基础功能：</strong>选择疾病类型后，系统会自动从所有医疗记录中筛选出与该疾病相关的记录，并生成包含症状分析、治疗方案、检验结果和时间线的完整报告。</p>
              <p><strong>家庭成员筛选：</strong>可以选择特定家庭成员来生成个人疾病报告，或留空生成该疾病的整体分析报告。</p>
              <p><strong>报告类型筛选：</strong>可以选择特定的报告类型进行筛选：</p>
              <ul>
                <li><strong>检验报告：</strong>包含血液、尿液等检验结果及其子项目</li>
                <li><strong>检查报告：</strong>包含影像学、病理学等检查结果</li>
                <li><strong>门诊报告：</strong>包含门诊就诊记录、诊断和治疗方案</li>
                <li><strong>住院报告：</strong>包含住院期间的详细医疗记录</li>
              </ul>
              <p><strong>子项目筛选：</strong>选择特定报告类型后，可以进一步选择具体的子项目进行精确筛选，例如：</p>
              <ul>
                <li>检验报告：选择具体的检验项目（如血常规、肝功能等）</li>
                <li>检查报告：选择具体的检查类型（如CT、MRI、超声等）</li>
              </ul>
              <p><strong>报告内容：</strong>生成的报告包含报告类型分布统计、子项目分布统计、症状分析、治疗方案、各类医疗记录详情和疾病发展时间线。</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default Reports; 