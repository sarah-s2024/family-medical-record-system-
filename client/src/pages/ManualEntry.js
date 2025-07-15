import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Typography, 
  Row, 
  Col, 
  DatePicker,
  Tag,
  message,
  Divider,
  Table,
  Alert
} from 'antd';
import { PlusOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { addMedicalRecord, getPatients } from '../utils/api';
import dayjs from 'dayjs';
import { 
  getLabTestCategories, 
  getLabTestsByCategory, 
  getLabTestSubItems,
  getSubItemInfo 
} from '../config/labTests';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const boneDensityGroups = [
  {
    group: '脊椎',
    parts: [
      '第一腰椎正位', '第二腰椎正位', '第三腰椎正位', '第四腰椎正位', '第一腰椎至第四腰椎正位'
    ]
  },
  {
    group: '左髋部',
    parts: [
      '股骨颈', '股骨转子', '股骨转子间区', '股骨 Ward 区', '整个左侧髋部'
    ]
  },
  {
    group: '右髋部',
    parts: [
      '股骨颈', '股骨转子', '股骨转子间区', '股骨 Ward 区', '整个右侧髋部'
    ]
  }
];

const ManualEntry = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [documentType, setDocumentType] = useState('inpatient_record');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedSubItems, setSelectedSubItems] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [boneDensityData, setBoneDensityData] = useState(() => {
    let arr = [];
    boneDensityGroups.forEach(g => {
      g.parts.forEach(part => {
        arr.push({ group: g.group, part, density: '', t: '', z: '' });
      });
    });
    return arr;
  });
  const [currentCheckType, setCurrentCheckType] = useState('');

  const documentTypes = [
    { value: 'inpatient_record', label: '住院记录' },
    { value: 'outpatient_record', label: '门诊记录' },
    { value: 'lab_result', label: '检验报告' },
    { value: 'diagnostic_report', label: '检查报告' },
    { value: 'other', label: '其他' }
  ];

  const commonDiseases = [
    '高血压', '糖尿病', '心脏病', '肺炎', '感冒', '发烧', 
    '头痛', '咳嗽', '胃炎', '关节炎', '哮喘', '过敏'
  ];

  useEffect(() => {
    fetchPatients();
  }, []);

  // 监听表单中患者ID的变化，同步更新selectedPatient状态
  useEffect(() => {
    const patientId = form.getFieldValue('patientId');
    if (patientId) {
      const patient = patients.find(p => p.id === patientId);
      if (patient && (!selectedPatient || selectedPatient.id !== patient.id)) {
        setSelectedPatient(patient);
      }
    }
  }, [form.getFieldValue('patientId'), patients, selectedPatient]);

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

  const handleSubmit = async (values) => {
    if (!selectedPatient) {
      message.error('请先选择家庭成员');
      return;
    }

    try {
      setLoading(true);
      
      let recordData = {
        documentType: values.documentType,
        patientInfo: {
          id: selectedPatient.id,
          name: selectedPatient.name,
          birthDate: selectedPatient.birthDate,
          gender: selectedPatient.gender
        },
        medicalData: {},
        keywords: keywords,
        date: values.recordDate ? values.recordDate.toISOString() : new Date().toISOString()
      };

      // 根据文档类型设置不同的医疗数据字段
      if (values.documentType === 'lab_result') {
        recordData.medicalData = {
          medicalInstitution: values.medicalInstitution,
          testCategory: selectedCategory,
          testItem: selectedTest,
          subItems: labResults,
          notes: values.notes
        };
      } else if (values.documentType === 'diagnostic_report') {
        if (values.checkType === '骨密度') {
          console.log('准备保存骨密度报告，当前骨密度数据:', boneDensityData);
          recordData.medicalData = {
            medicalInstitution: values.medicalInstitution,
            checkType: values.checkType,
            boneDensityTable: boneDensityData,
            notes: values.notes
          };
          console.log('骨密度报告数据结构:', recordData);
        } else {
          recordData.medicalData = {
            medicalInstitution: values.medicalInstitution,
            checkType: values.checkType,
            checkName: values.checkName,
            checkDescription: values.checkDescription,
            checkResult: values.checkResult,
            useContrast: values.useContrast,
            notes: values.notes
          };
        }
      } else if (values.documentType === 'outpatient_record') {
        // 门诊记录专用字段
        recordData.medicalData = {
          medicalInstitution: values.medicalInstitution,
          department: values.department,
          doctorName: values.doctorName,
          chiefComplaint: values.chiefComplaint,
          presentIllness: values.presentIllness,
          physicalExamination: values.physicalExamination,
          assessmentAndPlan: values.assessmentAndPlan,
          followUp: values.followUp,
          notes: values.notes
        };
      } else if (values.documentType === 'inpatient_record') {
        // 住院记录专用字段
        recordData.medicalData = {
          medicalInstitution: values.medicalInstitution,
          inpatientDepartment: values.inpatientDepartment,
          attendingPhysician: values.attendingPhysician,
          inpatientChiefComplaint: values.inpatientChiefComplaint,
          inpatientPresentIllness: values.inpatientPresentIllness,
          courseRecord: values.courseRecord,
          consultationRecord: values.consultationRecord,
          surgeryRecord: values.surgeryRecord,
          labAndImaging: values.labAndImaging,
          dischargePlan: values.dischargePlan,
          dischargeExamination: values.dischargeExamination,
          medicationGuidance: values.medicationGuidance,
          inpatientFollowUp: values.inpatientFollowUp,
          notes: values.notes
        };
      } else {
        // 其他
        recordData.medicalData = {
          medicalInstitution: values.medicalInstitution,
          diagnosis: values.diagnosis,
          symptoms: values.symptoms,
          treatment: values.treatment,
          notes: values.notes
        };
      }

      console.log('准备发送到API的数据:', recordData);
      const response = await addMedicalRecord(recordData);
      console.log('API响应:', response);
      
      if (response.success) {
        message.success('医疗记录添加成功！');
        form.resetFields();
        setKeywords([]);
        setSelectedPatient(null);
        // 重置骨密度数据
        setBoneDensityData(() => {
          let arr = [];
          boneDensityGroups.forEach(g => {
            g.parts.forEach(part => {
              arr.push({ group: g.group, part, density: '', t: '', z: '' });
            });
          });
          return arr;
        });
      } else {
        message.error('添加失败，请重试！');
      }
    } catch (error) {
      console.error('提交错误:', error);
      message.error('提交失败，请重试！');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordAdd = () => {
    if (inputValue && !keywords.includes(inputValue)) {
      setKeywords([...keywords, inputValue]);
      setInputValue('');
    }
  };

  const handleKeywordRemove = (removedKeyword) => {
    setKeywords(keywords.filter(keyword => keyword !== removedKeyword));
  };

  const handleQuickAddDisease = (disease) => {
    if (!keywords.includes(disease)) {
      setKeywords([...keywords, disease]);
    }
  };

  const handleDocumentTypeChange = (value) => {
    setDocumentType(value);
    
    // 保存当前选中的患者ID
    const currentPatientId = selectedPatient?.id;
    
    form.resetFields();
    // 重新设置文档类型字段，确保选择器显示正确
    form.setFieldsValue({
      documentType: value
    });
    
    // 如果之前有选中患者，重新设置患者选择
    if (currentPatientId) {
      form.setFieldsValue({
        patientId: currentPatientId
      });
    }
    
    setKeywords([]);
    setCurrentCheckType('');
    
    // 重置检验相关状态
    if (value !== 'lab_result') {
      setSelectedCategory('');
      setSelectedTest('');
      setSelectedSubItems([]);
      setLabResults([]);
    }
    
    // 重置骨密度数据
    if (value !== 'diagnostic_report') {
      setBoneDensityData(() => {
        let arr = [];
        boneDensityGroups.forEach(g => {
          g.parts.forEach(part => {
            arr.push({ group: g.group, part, density: '', t: '', z: '' });
          });
        });
        return arr;
      });
    }
  };

  const handlePatientChange = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    setSelectedPatient(patient);
    // 切换患者时重置检查类型和骨密度表格
    form.setFieldsValue({
      checkType: '',
      checkName: '',
      checkDescription: '',
      checkResult: '',
      useContrast: '',
      notes: ''
    });
    setCurrentCheckType('');
    setBoneDensityData(() => {
      let arr = [];
      boneDensityGroups.forEach(g => {
        g.parts.forEach(part => {
          arr.push({ group: g.group, part, density: '', t: '', z: '' });
        });
      });
      return arr;
    });
  };

  const getAgeFromBirthDate = (birthDate) => {
    if (!birthDate) return '';
    return dayjs().diff(dayjs(birthDate), 'year');
  };

  // 渲染患者选择区域
  const renderPatientSelection = () => {
    return (
      <>
        <Divider orientation="left">家庭成员选择</Divider>
        <Alert
          message="重要提示"
          description="请先选择已添加的家庭成员，只有已添加的家庭成员才能录入医疗记录。如需添加新家庭成员，请前往家庭成员管理页面。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="patientId"
              label="选择家庭成员"
              rules={[{ required: true, message: '请选择家庭成员' }]}
            >
              <Select
                placeholder="请选择家庭成员"
                loading={patientsLoading}
                onChange={handlePatientChange}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
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
            </Form.Item>
          </Col>
          <Col span={12}>
            {selectedPatient && (
              <div style={{ marginTop: 32 }}>
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
              </div>
            )}
          </Col>
        </Row>
      </>
    );
  };

  // 渲染患者信息字段（只显示，不可编辑）
  const renderPatientInfo = () => {
    if (!selectedPatient) {
      return (
        <Alert
          message="请先选择家庭成员"
          description="选择家庭成员后将显示家庭成员基本信息"
          type="warning"
          showIcon
        />
      );
    }

    return (
      <>
        <Divider orientation="left">家庭成员信息</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>家庭成员姓名：</Text>
              <Text>{selectedPatient.name}</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>出生日期：</Text>
              <Text>{selectedPatient.birthDate ? dayjs(selectedPatient.birthDate).format('YYYY-MM-DD') : '未填写'}</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>性别：</Text>
              <Text>{selectedPatient.gender}</Text>
            </div>
          </Col>
        </Row>
        {selectedPatient.phone && (
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>联系电话：</Text>
                <Text>{selectedPatient.phone}</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>邮箱地址：</Text>
                <Text>{selectedPatient.email || '未填写'}</Text>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>联系地址：</Text>
                <Text>{selectedPatient.address || '未填写'}</Text>
              </div>
            </Col>
          </Row>
        )}
      </>
    );
  };

  // 渲染医疗信息字段
  const renderMedicalInfo = () => {
    if (documentType === 'lab_result') {
      return (
        <>
          <Divider orientation="left">医疗信息</Divider>
          
          <Form.Item
            name="medicalInstitution"
            label="医疗机构"
            rules={[{ required: true, message: '请输入医疗机构' }]}
          >
            <Input placeholder="请输入医疗机构名称" />
          </Form.Item>
          
          {/* 检验项目选择 */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="检验分类">
                <Select
                  placeholder="选择检验分类"
                  value={selectedCategory}
                  onChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedTest('');
                    setSelectedSubItems([]);
                    setLabResults([]);
                  }}
                >
                  {getLabTestCategories().map(category => (
                    <Option key={category.key} value={category.key}>
                      {category.name} ({category.icd10})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="检验项目">
                <Select
                  placeholder="选择检验项目"
                  value={selectedTest}
                  onChange={(value) => {
                    setSelectedTest(value);
                    setSelectedSubItems([]);
                    setLabResults([]);
                  }}
                  disabled={!selectedCategory}
                >
                  {selectedCategory && getLabTestsByCategory(selectedCategory).map(test => (
                    <Option key={test.key} value={test.key}>
                      {test.name} ({test.icd10})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="子项目选择">
                <Select
                  mode="multiple"
                  placeholder="选择子项目"
                  value={selectedSubItems}
                  onChange={(values) => {
                    setSelectedSubItems(values);
                    // 自动生成结果表格
                    const subItems = getLabTestSubItems(selectedCategory, selectedTest);
                    const newResults = values.map(itemName => {
                      const itemInfo = subItems.find(item => item.name === itemName);
                      return {
                        key: itemName,
                        subItemName: itemName,
                        unit: itemInfo?.unit || '',
                        normalRange: itemInfo?.normalRange || '',
                        result: '',
                        status: 'normal'
                      };
                    });
                    setLabResults(newResults);
                  }}
                  disabled={!selectedTest}
                >
                  {selectedTest && getLabTestSubItems(selectedCategory, selectedTest).map(item => (
                    <Option key={item.name} value={item.name}>
                      {item.name} ({item.unit})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 检验结果表格 */}
          {labResults.length > 0 && (
            <Form.Item label="检验结果">
              <Table
                dataSource={labResults}
                columns={[
                  {
                    title: '检验项目',
                    dataIndex: 'subItemName',
                    key: 'subItemName',
                    width: 200,
                    render: (text) => <Text strong>{text}</Text>
                  },
                  {
                    title: '单位',
                    dataIndex: 'unit',
                    key: 'unit',
                    width: 100
                  },
                  {
                    title: '正常范围',
                    dataIndex: 'normalRange',
                    key: 'normalRange',
                    width: 120
                  },
                  {
                    title: '检验结果',
                    dataIndex: 'result',
                    key: 'result',
                    width: 150,
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={(e) => {
                          const newResults = labResults.map(item => 
                            item.key === record.key 
                              ? { ...item, result: e.target.value }
                              : item
                          );
                          setLabResults(newResults);
                        }}
                        placeholder="输入结果"
                      />
                    )
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    render: (text, record) => {
                      let status = 'normal';
                      if (record.result && record.normalRange) {
                        // 简单的异常判断逻辑
                        const result = parseFloat(record.result);
                        const range = record.normalRange;
                        if (range.includes('<') && result >= parseFloat(range.replace('<', ''))) {
                          status = 'high';
                        } else if (range.includes('>') && result <= parseFloat(range.replace('>', ''))) {
                          status = 'low';
                        } else if (range.includes('-')) {
                          const [min, max] = range.split('-').map(v => parseFloat(v));
                          if (result < min || result > max) {
                            status = result < min ? 'low' : 'high';
                          }
                        }
                      }
                      return (
                        <Tag color={status === 'normal' ? 'green' : status === 'high' ? 'red' : 'orange'}>
                          {status === 'normal' ? '正常' : status === 'high' ? '偏高' : '偏低'}
                        </Tag>
                      );
                    }
                  }
                ]}
                pagination={false}
                size="small"
                scroll={{ x: 700 }}
              />
            </Form.Item>
          )}

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea 
              rows={2} 
              placeholder="其他备注信息"
            />
          </Form.Item>
        </>
      );
    } else if (documentType === 'diagnostic_report') {
      return (
        <>
          <Divider orientation="left">医疗信息</Divider>
          
          <Form.Item
            name="medicalInstitution"
            label="医疗机构"
            rules={[{ required: true, message: '请输入医疗机构' }]}
          >
            <Input placeholder="请输入医疗机构名称" />
          </Form.Item>
          
          <Form.Item
            name="checkType"
            label="检查类型"
            rules={[{ required: true, message: '请选择检查类型' }]}
          >
            <Select placeholder="请选择检查类型" onChange={v => {
              form.setFieldValue('checkType', v);
              setCurrentCheckType(v);
              if (v !== '骨密度') {
                setBoneDensityData(() => {
                  let arr = [];
                  boneDensityGroups.forEach(g => {
                    g.parts.forEach(part => {
                      arr.push({ group: g.group, part, density: '', t: '', z: '' });
                    });
                  });
                  return arr;
                });
              }
            }}>
              <Option value="MRI">MRI</Option>
              <Option value="CT">CT</Option>
              <Option value="X线">X线</Option>
              <Option value="超声">超声</Option>
              <Option value="骨密度">骨密度</Option>
              <Option value="睡眠监测">睡眠监测</Option>
              <Option value="肺功能">肺功能</Option>
              <Option value="电生理">电生理</Option>
              <Option value="核医学">核医学</Option>
              <Option value="内镜">内镜</Option>
            </Select>
          </Form.Item>
          {currentCheckType === '骨密度' ? (
            <Form.Item label="骨密度详细数据">
              <Table
                dataSource={boneDensityData}
                columns={[
                  { title: '分组', dataIndex: 'group', key: 'group' },
                  { title: '部位', dataIndex: 'part', key: 'part' },
                  { title: '骨密度', dataIndex: 'density', key: 'density', render: (text, record, idx) => (
                    <Input
                      value={text}
                      onChange={e => {
                        const newData = [...boneDensityData];
                        newData[idx].density = e.target.value;
                        setBoneDensityData(newData);
                      }}
                    />
                  ) },
                  { title: 'T值', dataIndex: 't', key: 't', render: (text, record, idx) => (
                    <Input
                      value={text}
                      onChange={e => {
                        const newData = [...boneDensityData];
                        newData[idx].t = e.target.value;
                        setBoneDensityData(newData);
                      }}
                    />
                  ) },
                  { title: 'Z值', dataIndex: 'z', key: 'z', render: (text, record, idx) => (
                    <Input
                      value={text}
                      onChange={e => {
                        const newData = [...boneDensityData];
                        newData[idx].z = e.target.value;
                        setBoneDensityData(newData);
                      }}
                    />
                  ) }
                ]}
                pagination={false}
                size="small"
                rowKey={r => r.group + r.part}
              />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="checkName"
                label="检查名称"
                rules={[{ required: true, message: '请输入检查名称' }]}
              >
                <Input placeholder="请输入检查名称" />
              </Form.Item>

              <Form.Item
                name="checkDescription"
                label="检查描述"
                rules={[{ required: true, message: '请输入检查描述' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="请输入检查描述"
                />
              </Form.Item>

              <Form.Item
                name="checkResult"
                label="检查结果"
                rules={[{ required: true, message: '请输入检查结果' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请输入检查结果"
                />
              </Form.Item>

              <Form.Item
                name="useContrast"
                label="是否用造影剂"
              >
                <Select placeholder="请选择">
                  <Option value="是">是</Option>
                  <Option value="否">否</Option>
                </Select>
              </Form.Item>
            </>
          )}
          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea 
              rows={2} 
              placeholder="其他备注信息"
            />
          </Form.Item>
        </>
      );
    } else if (documentType === 'outpatient_record') {
      // 门诊记录专用字段
      return (
        <>
          <Divider orientation="left">医疗信息</Divider>
          
          <Form.Item
            name="medicalInstitution"
            label="医疗机构"
            rules={[{ required: true, message: '请输入医疗机构' }]}
          >
            <Input placeholder="请输入医疗机构名称" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="科室"
                rules={[{ required: true, message: '请输入科室' }]}
              >
                <Input placeholder="请输入科室" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="doctorName"
                label="医生姓名"
                rules={[{ required: true, message: '请输入医生姓名' }]}
              >
                <Input placeholder="请输入医生姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="chiefComplaint"
            label="主诉"
            rules={[{ required: true, message: '请输入主诉' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请输入患者主诉"
            />
          </Form.Item>

          <Form.Item
            name="presentIllness"
            label="现病史"
            rules={[{ required: true, message: '请输入现病史' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入现病史"
            />
          </Form.Item>

          <Form.Item
            name="physicalExamination"
            label="体格检查"
            rules={[{ required: true, message: '请输入体格检查' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入体格检查结果"
            />
          </Form.Item>

          <Form.Item
            name="assessmentAndPlan"
            label="评估和计划"
            rules={[{ required: true, message: '请输入评估和计划' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入评估和计划"
            />
          </Form.Item>

          <Form.Item
            name="followUp"
            label="随访"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入随访计划"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea 
              rows={2} 
              placeholder="其他备注信息"
            />
          </Form.Item>
        </>
      );
    } else if (documentType === 'inpatient_record') {
      // 住院记录专用字段
      return (
        <>
          <Divider orientation="left">医疗信息</Divider>
          
          <Form.Item
            name="medicalInstitution"
            label="医疗机构"
            rules={[{ required: true, message: '请输入医疗机构' }]}
          >
            <Input placeholder="请输入医疗机构名称" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inpatientDepartment"
                label="科室"
                rules={[{ required: true, message: '请输入科室' }]}
              >
                <Input placeholder="请输入科室" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="attendingPhysician"
                label="主治医师"
                rules={[{ required: true, message: '请输入主治医师' }]}
              >
                <Input placeholder="请输入主治医师" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="inpatientChiefComplaint"
            label="主诉"
            rules={[{ required: true, message: '请输入主诉' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请输入患者主诉"
            />
          </Form.Item>

          <Form.Item
            name="inpatientPresentIllness"
            label="现病史"
            rules={[{ required: true, message: '请输入现病史' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入现病史"
            />
          </Form.Item>

          <Form.Item
            name="courseRecord"
            label="病程记录"
            rules={[{ required: true, message: '请输入病程记录' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="请输入病程记录"
            />
          </Form.Item>

          <Form.Item
            name="consultationRecord"
            label="会诊记录"
          >
            <TextArea 
              rows={4} 
              placeholder="请输入会诊记录"
            />
          </Form.Item>

          <Form.Item
            name="surgeryRecord"
            label="手术记录"
          >
            <TextArea 
              rows={4} 
              placeholder="请输入手术记录"
            />
          </Form.Item>

          <Form.Item
            name="labAndImaging"
            label="实验室和影像学检查"
          >
            <TextArea 
              rows={4} 
              placeholder="请输入实验室和影像学检查结果"
            />
          </Form.Item>

          <Form.Item
            name="dischargePlan"
            label="出院计划"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入出院计划"
            />
          </Form.Item>

          <Form.Item
            name="dischargeExamination"
            label="出院检查"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入出院检查"
            />
          </Form.Item>

          <Form.Item
            name="medicationGuidance"
            label="用药指导"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入用药指导"
            />
          </Form.Item>

          <Form.Item
            name="inpatientFollowUp"
            label="随访"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入随访计划"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea 
              rows={2} 
              placeholder="其他备注信息"
            />
          </Form.Item>
        </>
      );
    } else {
      // 其他
      return (
        <>
          <Divider orientation="left">医疗信息</Divider>
          
          <Form.Item
            name="medicalInstitution"
            label="医疗机构"
            rules={[{ required: true, message: '请输入医疗机构' }]}
          >
            <Input placeholder="请输入医疗机构名称" />
          </Form.Item>
          
          <Form.Item
            name="diagnosis"
            label="诊断结果"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入诊断结果"
            />
          </Form.Item>

          <Form.Item
            name="symptoms"
            label="症状描述"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入症状描述"
            />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="治疗方案"
          >
            <TextArea 
              rows={3} 
              placeholder="请输入治疗方案"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea 
              rows={2} 
              placeholder="其他备注信息"
            />
          </Form.Item>
        </>
      );
    }
  };

  return (
    <div>
      <Title level={2}>手动录入医疗记录</Title>
      <Text type="secondary">
        手动输入患者信息和医疗数据，系统将自动分类并生成完整的医疗记录
      </Text>

      {renderPatientSelection()}

      <Card style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            documentType: 'inpatient_record',
            recordDate: dayjs()
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="documentType"
                label="文档类型"
                rules={[{ required: true, message: '请选择文档类型' }]}
              >
                <Select 
                  placeholder="选择文档类型"
                  onChange={handleDocumentTypeChange}
                >
                  {documentTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recordDate"
                label="记录日期"
                rules={[{ required: true, message: '请选择记录日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {renderPatientInfo()}
          {renderMedicalInfo()}

          <Divider orientation="left">疾病关键词</Divider>

          <Form.Item label="快速添加常见疾病">
            <div style={{ marginBottom: 16 }}>
              {commonDiseases.map(disease => (
                <Tag
                  key={disease}
                  color={keywords.includes(disease) ? 'blue' : 'default'}
                  style={{ cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => handleQuickAddDisease(disease)}
                >
                  {disease}
                </Tag>
              ))}
            </div>
          </Form.Item>

          <Form.Item label="自定义关键词">
            <div style={{ display: 'flex', marginBottom: 16 }}>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="输入关键词"
                style={{ marginRight: 8 }}
                onPressEnter={handleKeywordAdd}
              />
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleKeywordAdd}
              >
                添加
              </Button>
            </div>
            
            <div>
              {keywords.map(keyword => (
                <Tag
                  key={keyword}
                  closable
                  onClose={() => handleKeywordRemove(keyword)}
                  style={{ marginBottom: 8 }}
                >
                  {keyword}
                </Tag>
              ))}
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              保存医疗记录
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="录入说明" style={{ marginTop: 16 }}>
        <ul>
          <li><strong>文档类型</strong>：选择记录的类型，不同类型有不同的表单字段</li>
          <li><strong>家庭成员选择</strong>：选择已添加的家庭成员，只有已添加的家庭成员才能录入医疗记录。如需添加新家庭成员，请前往家庭成员管理页面。</li>
          <li><strong>家庭成员信息</strong>：选择家庭成员后将显示家庭成员基本信息，并可查看详细联系方式。</li>
          <li><strong>医疗信息</strong>：根据文档类型填写相应的医疗信息</li>
          <li><strong>检验报告</strong>：填写检验项目、结果、正常范围、备注</li>
                          <li><strong>检查报告</strong>：填写检查类型、检查名称、检查描述、检查结果、是否用造影剂、备注</li>
          <li><strong>疾病关键词</strong>：添加相关的疾病关键词，便于后续按疾病生成报告</li>
        </ul>
      </Card>
    </div>
  );
};

export default ManualEntry; 