import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Select,
  Button,
  Spin,
  Empty,
  Typography,
  Table,
  Tag,
  Space,
  message,
  Row,
  Col,
  List,
  Modal,
  Popconfirm,
  Divider,
  Badge
} from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  UserOutlined, 
  TagOutlined, 
  HistoryOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getPatients, generateCustomReport } from '../utils/api';
import { getLabTestName, getLabTestCategoryName } from '../config/labTests';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Reports = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportHistory, setReportHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [viewingHistoryReport, setViewingHistoryReport] = useState(null);
  const reportRef = useRef(null);

  // 从localStorage加载报告历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('healthReportHistory');
    if (savedHistory) {
      try {
        setReportHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('加载报告历史失败:', error);
      }
    }
  }, []);

  // 保存报告历史到localStorage
  const saveReportHistory = (history) => {
    try {
      localStorage.setItem('healthReportHistory', JSON.stringify(history));
    } catch (error) {
      console.error('保存报告历史失败:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      setPatients(response.data || []);
    } catch (error) {
      console.error('获取患者列表失败:', error);
      message.error('获取患者列表失败');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedPatient) {
      message.warn('请先选择一个家庭成员');
      return;
    }
    if (keywords.length === 0) {
      message.warn('请输入至少一个指标关键词');
      return;
    }

    setLoading(true);
    setReportData(null);
    try {
      console.log('开始生成报告，患者ID:', selectedPatient, '关键词:', keywords);
      const response = await generateCustomReport(selectedPatient, keywords);
      console.log('API响应:', response);
      
      if (response.success) {
        setReportData(response);
        
        // 保存到历史记录
        const patient = patients.find(p => p.id === selectedPatient);
        const historyItem = {
          id: Date.now().toString(),
          patientId: selectedPatient,
          patientName: patient?.name || '未知成员',
          keywords: [...keywords],
          reportData: response,
          createdAt: new Date().toISOString()
        };
        
        const newHistory = [historyItem, ...reportHistory];
        setReportHistory(newHistory);
        saveReportHistory(newHistory);
        
        if (response.data.length === 0) {
          message.info('未找到与关键词相关的指标数据');
        } else {
          message.success(`报告生成成功，找到 ${response.data.length} 项相关指标`);
        }
      } else {
        message.error(response.error || '生成报告失败');
      }
    } catch (error) {
      console.error('生成报告时出错:', error);
      message.error(`生成报告失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistoryReport = (historyItem) => {
    setViewingHistoryReport(historyItem);
    setReportData(historyItem.reportData);
    setSelectedPatient(historyItem.patientId);
    setKeywords(historyItem.keywords);
    setHistoryVisible(false);
  };

  const handleDeleteHistoryReport = (reportId) => {
    const newHistory = reportHistory.filter(item => item.id !== reportId);
    setReportHistory(newHistory);
    saveReportHistory(newHistory);
    message.success('报告已删除');
  };

  const handleClearAllHistory = () => {
    setReportHistory([]);
    saveReportHistory([]);
    message.success('所有历史报告已清除');
  };

  // 格式化医疗详情数据为文本
  const formatMedicalDetails = (details) => {
    if (!details || Object.keys(details).length === 0) return '-';
    
    const documentType = details.documentType;
    let result = [];
    
    // 检验报告
    if (documentType === 'lab_result') {
              if (details.testCategory) result.push(`检验类别：${getLabTestCategoryName(details.testCategory)}`);
      if (details.testItem) {
        // 获取检验项目的中文名称
        const testItemName = getLabTestName(details.testCategory, details.testItem);
        result.push(`检验项目：${testItemName}`);
      }
      if (details.subItems && details.subItems.length > 0) {
        result.push('检验结果：');
        details.subItems.slice(0, 3).forEach(item => {
          result.push(`  • ${item.subItemName}: ${item.result} ${item.unit} (${item.normalRange})`);
        });
        if (details.subItems.length > 3) {
          result.push(`  ...等${details.subItems.length}项`);
        }
      }
      if (details.notes) result.push(`备注：${details.notes}`);
    }
    
    // 检查报告
    else if (documentType === 'diagnostic_report') {
      if (details.checkType) result.push(`检查类型：${details.checkType}`);
      if (details.checkName) result.push(`检查部位：${details.checkName}`);
      if (details.checkDescription) result.push(`检查描述：${details.checkDescription}`);
      if (details.checkResult) result.push(`检查结果：${details.checkResult}`);
      if (details.useContrast) result.push(`对比剂：${details.useContrast}`);
      
      // 特殊处理骨密度数据
      if (details.boneDensityTable && details.boneDensityTable.length > 0) {
        result.push('骨密度测量结果：');
        const groupedData = {};
        details.boneDensityTable.forEach(item => {
          if (!groupedData[item.group]) {
            groupedData[item.group] = [];
          }
          if (item.density || item.t || item.z) {
            groupedData[item.group].push(item);
          }
        });
        
        Object.entries(groupedData).forEach(([group, items]) => {
          if (items.length > 0) {
            result.push(`  ${group}：`);
            items.slice(0, 3).forEach(item => {
              const values = [];
              if (item.density) values.push(`密度:${item.density}`);
              if (item.t) values.push(`T值:${item.t}`);
              if (item.z) values.push(`Z值:${item.z}`);
              if (values.length > 0) {
                result.push(`    • ${item.part}: ${values.join(', ')}`);
              }
            });
            if (items.length > 3) {
              result.push(`    ...等${items.length}项测量`);
            }
          }
        });
      }
      
      if (details.notes) result.push(`备注：${details.notes}`);
    }
    
    // 门诊记录
    else if (documentType === 'outpatient_record') {
      if (details.department) result.push(`科室：${details.department}`);
      if (details.doctorName) result.push(`医生：${details.doctorName}`);
      if (details.chiefComplaint) result.push(`主诉：${details.chiefComplaint}`);
      if (details.presentIllness) result.push(`现病史：${details.presentIllness}`);
      if (details.physicalExamination) result.push(`体格检查：${details.physicalExamination}`);
      if (details.assessmentAndPlan) result.push(`诊疗计划：${details.assessmentAndPlan}`);
      if (details.followUp) result.push(`随访：${details.followUp}`);
      if (details.notes) result.push(`备注：${details.notes}`);
    }
    
    // 住院记录
    else if (documentType === 'inpatient_record') {
      if (details.inpatientDepartment) result.push(`住院科室：${details.inpatientDepartment}`);
      if (details.attendingPhysician) result.push(`主治医师：${details.attendingPhysician}`);
      if (details.inpatientChiefComplaint) result.push(`入院主诉：${details.inpatientChiefComplaint}`);
      if (details.inpatientPresentIllness) result.push(`现病史：${details.inpatientPresentIllness}`);
      if (details.courseRecord) result.push(`病程记录：${details.courseRecord}`);
      if (details.consultationRecord) result.push(`会诊记录：${details.consultationRecord}`);
      if (details.surgeryRecord) result.push(`手术记录：${details.surgeryRecord}`);
      if (details.labAndImaging) result.push(`检查检验：${details.labAndImaging}`);
      if (details.dischargePlan) result.push(`出院计划：${details.dischargePlan}`);
      if (details.medicationGuidance) result.push(`用药指导：${details.medicationGuidance}`);
      if (details.inpatientFollowUp) result.push(`随访安排：${details.inpatientFollowUp}`);
      if (details.notes) result.push(`备注：${details.notes}`);
    }
    
    // 其他类型
    else {
      if (details.notes) result.push(`备注：${details.notes}`);
      Object.entries(details).filter(([key]) => 
        key !== 'documentType' && key !== 'medicalInstitution' && key !== 'notes'
      ).forEach(([key, value]) => {
        if (value) result.push(`${key}：${String(value)}`);
      });
    }
    
    return result.join('\\n');
  };

  const handleExportPDF = async () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      message.warn('没有可导出的报告数据');
      return;
    }

    setExporting(true);
    
    try {
      const patientName = patients.find(p => p.id === selectedPatient)?.name || '未知成员';
      
      // 创建一个临时的DOM元素用于生成PDF
      const reportElement = document.createElement('div');
      reportElement.style.position = 'absolute';
      reportElement.style.left = '-9999px';
      reportElement.style.width = '1200px';
      reportElement.style.backgroundColor = 'white';
      reportElement.style.padding = '20px';
      reportElement.style.fontFamily = 'Arial, sans-serif';
      
      // 创建报告内容HTML
      const reportHTML = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #1890ff; margin-bottom: 20px;">${patientName} 的健康指标报告</h2>
          <p style="margin: 5px 0 20px 0; color: #666;">生成时间: ${dayjs(reportData.generatedAt).format('YYYY-MM-DD HH:mm')}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #d9d9d9; padding: 8px; text-align: left; font-weight: 600; width: 12%;">文档类型</th>
                <th style="border: 1px solid #d9d9d9; padding: 8px; text-align: left; font-weight: 600; width: 15%;">记录时间</th>
                <th style="border: 1px solid #d9d9d9; padding: 8px; text-align: left; font-weight: 600; width: 20%;">名称</th>
                <th style="border: 1px solid #d9d9d9; padding: 8px; text-align: left; font-weight: 600; width: 12%;">医疗机构</th>
                <th style="border: 1px solid #d9d9d9; padding: 8px; text-align: left; font-weight: 600; width: 41%;">医疗数据详情</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.data
                .sort((a, b) => {
                  // 第一级：按文档类型重要性排序（相同类型聚集在一起）
                  const typeDiff = getDocumentTypePriority(a.sourceDocumentType) - getDocumentTypePriority(b.sourceDocumentType);
                  if (typeDiff !== 0) return typeDiff;
                  
                  // 第二级：在同一文档类型内，按名称排序
                  const nameDiff = (a.value || '').localeCompare(b.value || '', 'zh-CN');
                  if (nameDiff !== 0) return nameDiff;
                  
                  // 第三级：最后按时间升序排列（最早的在前）
                  return dayjs(a.date).unix() - dayjs(b.date).unix();
                })
                .map(item => `
                <tr>
                  <td style="border: 1px solid #d9d9d9; padding: 8px; vertical-align: top;">${getDocumentTypeText(item.sourceDocumentType)}</td>
                  <td style="border: 1px solid #d9d9d9; padding: 8px; vertical-align: top;">${dayjs(item.date).format('YYYY-MM-DD HH:mm')}</td>
                  <td style="border: 1px solid #d9d9d9; padding: 8px; vertical-align: top; word-wrap: break-word;">${item.value}</td>
                  <td style="border: 1px solid #d9d9d9; padding: 8px; vertical-align: top;">${item.medicalInstitution || '未知机构'}</td>
                  <td style="border: 1px solid #d9d9d9; padding: 8px; vertical-align: top; white-space: pre-line; word-wrap: break-word; line-height: 1.4;">${formatMedicalDetails(item.recordDetails)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      reportElement.innerHTML = reportHTML;
      document.body.appendChild(reportElement);
      
      // 使用html2canvas捕获内容
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // 移除临时元素
      document.body.removeChild(reportElement);
      
      // 创建PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${patientName}_健康报告_${dayjs().format('YYYYMMDD')}.pdf`);
      message.success('PDF导出成功');
      
    } catch (error) {
      console.error('PDF导出失败:', error);
      message.error('PDF导出失败，请重试');
    }
    
    setExporting(false);
  };
  
  // 文档类型映射函数
  const getDocumentTypeText = (type) => {
    const typeMap = {
      'inpatient_record': '住院记录',
      'outpatient_record': '门诊记录', 
      'lab_result': '检验报告',
      'diagnostic_report': '检查报告',
      'manual': '手动录入',
      'other': '其他'
    };
    return typeMap[type] || '未知类型';
  };

  const getDocumentTypeColor = (type) => {
    const colorMap = {
      'inpatient_record': 'blue',
      'outpatient_record': 'cyan',
      'lab_result': 'green', 
      'diagnostic_report': 'orange',
      'manual': 'purple',
      'other': 'default'
    };
    return colorMap[type] || 'default';
  };

  // 获取文档类型的重要性等级（用于排序）
  const getDocumentTypePriority = (type) => {
    const priorityMap = {
      'lab_result': 1,        // 检验报告 - 最重要
      'diagnostic_report': 2, // 检查报告
      'inpatient_record': 3,  // 住院记录
      'outpatient_record': 4, // 门诊记录
      'manual': 5,           // 手动录入
      'other': 6             // 其他
    };
    return priorityMap[type] || 999;
  };

  const columns = [
    {
      title: '文档类型',
      dataIndex: 'sourceDocumentType',
      key: 'sourceDocumentType',
      width: 120,
      render: (type) => (
        <Tag color={getDocumentTypeColor(type)}>
          {getDocumentTypeText(type)}
        </Tag>
      ),
      sorter: (a, b) => getDocumentTypePriority(a.sourceDocumentType) - getDocumentTypePriority(b.sourceDocumentType),
      showSorterTooltip: {
        title: '按医疗文档重要性排序'
      }
    },
    {
      title: '记录时间',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: 'descend',
      showSorterTooltip: {
        title: '按记录时间排序'
      }
    },
    {
      title: '名称',
      dataIndex: 'value',
      key: 'value',
      width: 250,
      render: (text) => <div style={{ maxWidth: 250, whiteSpace: 'pre-wrap' }}>{text}</div>,
      sorter: (a, b) => (a.value || '').localeCompare(b.value || '', 'zh-CN'),
      showSorterTooltip: {
        title: '按名称字母顺序排序'
      }
    },
    {
      title: '医疗机构',
      dataIndex: 'medicalInstitution',
      key: 'medicalInstitution',
      width: 120,
      render: (text) => <Text>{text || '未知机构'}</Text>,
      sorter: (a, b) => (a.medicalInstitution || '未知机构').localeCompare(b.medicalInstitution || '未知机构', 'zh-CN'),
      showSorterTooltip: {
        title: '按医疗机构名称排序'
      }
    },
    {
      title: '医疗数据详情',
      dataIndex: 'recordDetails',
      key: 'recordDetails',
      width: 400,
      render: (details, record) => {
        if (!details || Object.keys(details).length === 0) return '-';
        
        const documentType = details.documentType;
        
        return (
          <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
            {/* 检验报告 */}
            {documentType === 'lab_result' && (
              <>
                {details.testCategory && <div><Text strong>检验类别：</Text>{getLabTestCategoryName(details.testCategory)}</div>}
                {details.testItem && (
                  <div>
                    <Text strong>检验项目：</Text>
                    {getLabTestName(details.testCategory, details.testItem)}
                  </div>
                )}
                {details.subItems && details.subItems.length > 0 && (
                  <div>
                    <Text strong>检验结果：</Text>
                    {details.subItems.slice(0, 3).map((item, index) => (
                      <div key={index} style={{ marginLeft: 8, fontSize: '11px' }}>
                        • {item.subItemName}: {item.result} {item.unit} ({item.normalRange})
                      </div>
                    ))}
                    {details.subItems.length > 3 && <div style={{ marginLeft: 8, fontSize: '11px' }}>...等{details.subItems.length}项</div>}
                  </div>
                )}
                {details.notes && <div><Text strong>备注：</Text>{details.notes}</div>}
              </>
            )}
            
            {/* 检查报告 */}
            {documentType === 'diagnostic_report' && (
              <>
                {details.checkType && <div><Text strong>检查类型：</Text>{details.checkType}</div>}
                {details.checkName && <div><Text strong>检查部位：</Text>{details.checkName}</div>}
                {details.checkDescription && <div><Text strong>检查描述：</Text>{details.checkDescription}</div>}
                {details.checkResult && <div><Text strong>检查结果：</Text>{details.checkResult}</div>}
                {details.useContrast && <div><Text strong>对比剂：</Text>{details.useContrast}</div>}
                
                {/* 特殊处理骨密度数据 */}
                {details.boneDensityTable && details.boneDensityTable.length > 0 && (
                  <div>
                    <Text strong>骨密度测量结果：</Text>
                    <div style={{ marginLeft: 8, marginTop: 4 }}>
                      {(() => {
                        const groupedData = {};
                        details.boneDensityTable.forEach(item => {
                          if (!groupedData[item.group]) {
                            groupedData[item.group] = [];
                          }
                          if (item.density || item.t || item.z) {
                            groupedData[item.group].push(item);
                          }
                        });
                        
                        return Object.entries(groupedData).map(([group, items]) => {
                          if (items.length === 0) return null;
                          return (
                            <div key={group} style={{ marginBottom: 8 }}>
                              <Text strong style={{ fontSize: '12px' }}>{group}：</Text>
                              <div style={{ marginLeft: 12 }}>
                                {items.slice(0, 3).map((item, index) => {
                                  const values = [];
                                  if (item.density) values.push(`密度:${item.density}`);
                                  if (item.t) values.push(`T值:${item.t}`);
                                  if (item.z) values.push(`Z值:${item.z}`);
                                  if (values.length === 0) return null;
                                  return (
                                    <div key={index} style={{ fontSize: '11px', color: '#666' }}>
                                      • {item.part}: {values.join(', ')}
                                    </div>
                                  );
                                })}
                                {items.length > 3 && (
                                  <div style={{ fontSize: '11px', color: '#666' }}>
                                    ...等{items.length}项测量
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
                
                {details.notes && <div><Text strong>备注：</Text>{details.notes}</div>}
              </>
            )}
            
            {/* 门诊记录 */}
            {documentType === 'outpatient_record' && (
              <>
                {details.department && <div><Text strong>科室：</Text>{details.department}</div>}
                {details.doctorName && <div><Text strong>医生：</Text>{details.doctorName}</div>}
                {details.chiefComplaint && <div><Text strong>主诉：</Text>{details.chiefComplaint}</div>}
                {details.presentIllness && <div><Text strong>现病史：</Text>{details.presentIllness}</div>}
                {details.physicalExamination && <div><Text strong>体格检查：</Text>{details.physicalExamination}</div>}
                {details.assessmentAndPlan && <div><Text strong>诊疗计划：</Text>{details.assessmentAndPlan}</div>}
                {details.followUp && <div><Text strong>随访：</Text>{details.followUp}</div>}
                {details.notes && <div><Text strong>备注：</Text>{details.notes}</div>}
              </>
            )}
            
            {/* 住院记录 */}
            {documentType === 'inpatient_record' && (
              <>
                {details.inpatientDepartment && <div><Text strong>住院科室：</Text>{details.inpatientDepartment}</div>}
                {details.attendingPhysician && <div><Text strong>主治医师：</Text>{details.attendingPhysician}</div>}
                {details.inpatientChiefComplaint && <div><Text strong>入院主诉：</Text>{details.inpatientChiefComplaint}</div>}
                {details.inpatientPresentIllness && <div><Text strong>现病史：</Text>{details.inpatientPresentIllness}</div>}
                {details.courseRecord && <div><Text strong>病程记录：</Text>{details.courseRecord}</div>}
                {details.consultationRecord && <div><Text strong>会诊记录：</Text>{details.consultationRecord}</div>}
                {details.surgeryRecord && <div><Text strong>手术记录：</Text>{details.surgeryRecord}</div>}
                {details.labAndImaging && <div><Text strong>检查检验：</Text>{details.labAndImaging}</div>}
                {details.dischargePlan && <div><Text strong>出院计划：</Text>{details.dischargePlan}</div>}
                {details.medicationGuidance && <div><Text strong>用药指导：</Text>{details.medicationGuidance}</div>}
                {details.inpatientFollowUp && <div><Text strong>随访安排：</Text>{details.inpatientFollowUp}</div>}
                {details.notes && <div><Text strong>备注：</Text>{details.notes}</div>}
              </>
            )}
            
            {/* 其他类型 */}
            {!['lab_result', 'diagnostic_report', 'outpatient_record', 'inpatient_record'].includes(documentType) && (
              <>
                {details.notes && <div><Text strong>备注：</Text>{details.notes}</div>}
                {Object.entries(details).filter(([key]) => key !== 'documentType' && key !== 'medicalInstitution' && key !== 'notes').map(([key, value]) => (
                  value && <div key={key}><Text strong>{key}：</Text>{String(value)}</div>
                ))}
              </>
            )}
          </div>
        );
      },
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={2}>自定义健康报告生成</Title>
          <Text type="secondary">
            选择家庭成员并输入您关心的健康指标，系统将智能搜索所有相关记录并生成报告。支持中文检验项目名称搜索、疾病关键词、文档类型等多维度检索。
          </Text>
        </div>
        <Badge count={reportHistory.length} showZero>
          <Button 
            icon={<HistoryOutlined />} 
            onClick={() => setHistoryVisible(true)}
            type="default"
          >
            报告历史
          </Button>
        </Badge>
      </div>
      
      <Card style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong><UserOutlined /> 选择家庭成员</Text>
              <Select
                showSearch
                style={{ width: '100%' }}
                placeholder="请选择一位家庭成员"
                value={selectedPatient}
                onChange={value => setSelectedPatient(value)}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {patients.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={10}>
             <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong><TagOutlined /> 输入指标关键词</Text>
                <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="输入关键词后按回车，可输入多个"
                    value={keywords}
                    onChange={setKeywords}
                    tokenSeparators={[',']}
                    options={[
                      // 常见检验项目
                      { value: '血常规', label: '血常规' },
                      { value: '肝功能', label: '肝功能' },
                      { value: '肾功能', label: '肾功能' },
                      { value: '甲状腺功能', label: '甲状腺功能' },
                      { value: '胆固醇', label: '胆固醇' },
                      { value: '糖尿病相关', label: '糖尿病相关' },
                      { value: '生化检测', label: '生化检测' },
                      { value: '免疫功能', label: '免疫功能' },
                      { value: '凝血功能', label: '凝血功能' },
                      { value: '肿瘤标志物', label: '肿瘤标志物' },
                      // 文档类型
                      { value: '检验报告', label: '检验报告' },
                      { value: '检查报告', label: '检查报告' },
                      { value: '门诊记录', label: '门诊记录' },
                      { value: '住院记录', label: '住院记录' },
                      // 常见疾病
                      { value: '高血压', label: '高血压' },
                      { value: '糖尿病', label: '糖尿病' },
                      { value: '骨质疏松', label: '骨质疏松' },
                      { value: '冠心病', label: '冠心病' },
                      { value: '脂肪肝', label: '脂肪肝' },
                      // 身体部位和检查类型
                      { value: '心脏', label: '心脏' },
                      { value: '肝脏', label: '肝脏' },
                      { value: '肺部', label: '肺部' },
                      { value: '肾脏', label: '肾脏' },
                      { value: 'CT', label: 'CT' },
                      { value: 'MRI', label: 'MRI' },
                      { value: '超声', label: '超声' },
                      { value: 'X线', label: 'X线' },
                      { value: '骨密度', label: '骨密度' }
                    ]}
                    filterOption={(input, option) =>
                      option.value.toLowerCase().includes(input.toLowerCase())
                    }
                />
                <div style={{ fontSize: '12px', color: '#666', lineHeight: '16px' }}>
                  <Text type="secondary">
                    💡 支持搜索：<br/>
                    • 检验项目：血常规、胆固醇、甲状腺功能、肝功能等<br/>
                    • 文档类型：住院记录、门诊记录、检验报告、检查报告<br/>
                    • 疾病名称：高血压、糖尿病、骨质疏松等<br/>
                    • 身体部位：心脏、肺部、肝脏、脑部等
                  </Text>
                </div>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Space>
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={handleGenerateReport}
                loading={loading}
              >
                生成报告
              </Button>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleExportPDF}
                disabled={!reportData || loading || exporting}
                loading={exporting}
              >
                导出PDF
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 当前查看的是历史报告时显示提示 */}
      {viewingHistoryReport && (
        <Card style={{ marginTop: 16, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <ClockCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              <Text strong>正在查看历史报告</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                生成时间: {dayjs(viewingHistoryReport.createdAt).format('YYYY-MM-DD HH:mm')}
              </Text>
            </div>
            <Button 
              type="link" 
              onClick={() => {
                setViewingHistoryReport(null);
                setReportData(null);
                setSelectedPatient(null);
                setKeywords([]);
              }}
            >
              退出历史查看
            </Button>
          </div>
        </Card>
      )}

      <div ref={reportRef} style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="正在深度搜索所有记录，请稍候..." />
          </div>
        ) : reportData ? (
          <Card>
            <Title level={4}>{reportData.reportTitle}</Title>
            <Text type="secondary">报告生成时间: {dayjs(reportData.generatedAt).format('YYYY-MM-DD HH:mm')}</Text>
            <Table 
                style={{ marginTop: 16 }}
                columns={columns}
                dataSource={
                  reportData.data
                    .map(item => ({...item, key: item.sourceRecordId + item.keyword}))
                    .sort((a, b) => {
                      // 第一级：按文档类型重要性排序（相同类型聚集在一起）
                      const typeDiff = getDocumentTypePriority(a.sourceDocumentType) - getDocumentTypePriority(b.sourceDocumentType);
                      if (typeDiff !== 0) return typeDiff;
                      
                      // 第二级：在同一文档类型内，按名称排序
                      const nameDiff = (a.value || '').localeCompare(b.value || '', 'zh-CN');
                      if (nameDiff !== 0) return nameDiff;
                      
                      // 第三级：最后按时间升序排列（最早的在前）
                      return dayjs(a.date).unix() - dayjs(b.date).unix();
                    })
                }
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
                }}
                scroll={{ x: 1200 }}
                />
          </Card>
        ) : (
          <Empty
            style={{ marginTop: 50 }}
            description='请先选择家庭成员和输入关键词，然后点击"生成报告"'
          />
        )}
      </div>

      {/* 报告历史模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              <HistoryOutlined style={{ marginRight: 8 }} />
              报告历史记录 ({reportHistory.length} 条)
            </span>
            {reportHistory.length > 0 && (
              <Popconfirm
                title="确定要清除所有历史报告吗？"
                onConfirm={handleClearAllHistory}
                okText="确定"
                cancelText="取消"
              >
                <Button size="small" danger type="text">
                  清除全部
                </Button>
              </Popconfirm>
            )}
          </div>
        }
        open={historyVisible}
        onCancel={() => setHistoryVisible(false)}
        footer={null}
        width={800}
      >
        {reportHistory.length === 0 ? (
          <Empty description="暂无历史报告" />
        ) : (
          <List
            dataSource={reportHistory}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    icon={<EyeOutlined />} 
                    onClick={() => handleViewHistoryReport(item)}
                  >
                    查看
                  </Button>,
                  <Popconfirm
                    title="确定要删除这个报告吗？"
                    onConfirm={() => handleDeleteHistoryReport(item.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div>
                      <Text strong>{item.patientName}</Text>
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        ({item.reportData.data.length} 项指标)
                      </Text>
                    </div>
                  }
                  description={
                    <div>
                      <div>
                        <Text strong>关键词: </Text>
                        {item.keywords.map(keyword => (
                          <Tag key={keyword} size="small" color="blue" style={{ marginRight: 4 }}>
                            {keyword}
                          </Tag>
                        ))}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">
                          生成时间: {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
};

export default Reports; 