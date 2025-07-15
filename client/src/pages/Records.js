import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Typography, 
  Select, 
  Input, 
  Row, 
  Col, 
  Spin,
  Empty,
  Descriptions,
  Button,
  Modal,
  Form,
  Popconfirm,
  Space,
  Collapse,
  message,
  DatePicker,
  Dropdown,
  Menu,
  Table
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  DownloadOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getMedicalRecords, updateMedicalRecord, deleteMedicalRecord } from '../utils/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Panel } = Collapse;

const Records = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState({});
  const [filters, setFilters] = useState({
    documentType: 'all',
    searchText: '',
    disease: 'all'
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [selectedPatientForExport, setSelectedPatientForExport] = useState(null);
  const [selectedDocumentTypeForExport, setSelectedDocumentTypeForExport] = useState('all');
  const [subItemsData, setSubItemsData] = useState([]);
  const [boneDensityData, setBoneDensityData] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const exportRef = useRef(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filters]);

  useEffect(() => {
    groupRecordsByPatient();
  }, [filteredRecords]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await getMedicalRecords();
      const sortedRecords = (response.data || []).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setRecords(sortedRecords);
    } catch (error) {
      console.error('获取记录失败:', error);
      message.error('获取记录失败');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // 按文档类型筛选
    if (filters.documentType !== 'all') {
      filtered = filtered.filter(record => record.documentType === filters.documentType);
    }

    // 按疾病筛选
    if (filters.disease !== 'all') {
      filtered = filtered.filter(record => {
        const keywords = record.keywords.includes(filters.disease);
        
        // 根据文档类型筛选不同的医疗字段
        let medicalFields = false;
        if (record.documentType === 'lab_result') {
          medicalFields = (
            (record.medicalData.testCategory && record.medicalData.testCategory.includes(filters.disease)) ||
            (record.medicalData.testItem && record.medicalData.testItem.includes(filters.disease)) ||
            (record.medicalData.subItems && record.medicalData.subItems.some(item => 
              item.subItemName.includes(filters.disease) ||
              item.result.includes(filters.disease)
            ))
          );
        } else if (record.documentType === 'diagnostic_report') {
          medicalFields = (
            (record.medicalData.checkName && record.medicalData.checkName.includes(filters.disease)) ||
                          (record.medicalData.checkDescription && record.medicalData.checkDescription.includes(filters.disease)) ||
              (record.medicalData.checkResult && record.medicalData.checkResult.includes(filters.disease))
          );
        } else {
          medicalFields = (
            (record.medicalData.diagnosis && record.medicalData.diagnosis.includes(filters.disease)) ||
            (record.medicalData.symptoms && record.medicalData.symptoms.includes(filters.disease))
          );
        }
        
        return keywords || medicalFields;
      });
    }

    // 按搜索文本筛选
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(record => {
        const patientName = record.patientInfo.name && record.patientInfo.name.toLowerCase().includes(searchLower);
        const keywords = record.keywords.some(keyword => keyword.toLowerCase().includes(searchLower));
        
        // 根据文档类型搜索不同的医疗字段
        let medicalFields = false;
        if (record.documentType === 'lab_result') {
          medicalFields = (
            (record.medicalData.testCategory && record.medicalData.testCategory.toLowerCase().includes(searchLower)) ||
            (record.medicalData.testItem && record.medicalData.testItem.toLowerCase().includes(searchLower)) ||
            (record.medicalData.subItems && record.medicalData.subItems.some(item => 
              item.subItemName.toLowerCase().includes(searchLower) ||
              item.result.toLowerCase().includes(searchLower)
            ))
          );
        } else if (record.documentType === 'diagnostic_report') {
          medicalFields = (
            (record.medicalData.checkName && record.medicalData.checkName.toLowerCase().includes(searchLower)) ||
                          (record.medicalData.checkDescription && record.medicalData.checkDescription.toLowerCase().includes(searchLower)) ||
              (record.medicalData.checkResult && record.medicalData.checkResult.toLowerCase().includes(searchLower))
          );
        } else {
          medicalFields = (
            (record.medicalData.diagnosis && record.medicalData.diagnosis.toLowerCase().includes(searchLower)) ||
            (record.medicalData.symptoms && record.medicalData.symptoms.toLowerCase().includes(searchLower)) ||
            (record.medicalData.treatment && record.medicalData.treatment.toLowerCase().includes(searchLower))
          );
        }
        
        return patientName || medicalFields || keywords;
      });
    }

    setFilteredRecords(filtered);
  };

  const groupRecordsByPatient = () => {
    const grouped = {};
    filteredRecords.forEach(record => {
      const patientName = record.patientInfo.name || '未知患者';
      if (!grouped[patientName]) {
        grouped[patientName] = {
          patientInfo: record.patientInfo,
          records: []
        };
      }
      grouped[patientName].records.push(record);
    });

    // 对每个患者的记录进行分组和排序
    Object.keys(grouped).forEach(patientName => {
      const patientRecords = grouped[patientName].records;
      const groupedByType = {};

      patientRecords.forEach(record => {
        const documentType = record.documentType;
        
        if (!groupedByType[documentType]) {
          groupedByType[documentType] = [];
        }

        // 根据文档类型进行不同的分组逻辑
        if (documentType === 'lab_result') {
          // 检验报告：按检验项目分组
          const testItem = record.medicalData.testItem || '未知检验项目';
          const existingGroup = groupedByType[documentType].find(group => 
            group.key === testItem
          );
          
          if (existingGroup) {
            existingGroup.records.push(record);
          } else {
            groupedByType[documentType].push({
              key: testItem,
              title: testItem,
              records: [record]
            });
          }
        } else if (documentType === 'diagnostic_report') {
          // 检查报告：按检查类型分组
          const checkType = record.medicalData.checkType || '未知检查类型';
          const existingGroup = groupedByType[documentType].find(group => 
            group.key === checkType
          );
          
          if (existingGroup) {
            existingGroup.records.push(record);
          } else {
            groupedByType[documentType].push({
              key: checkType,
              title: checkType,
              records: [record]
            });
          }
        } else if (documentType === 'outpatient_record') {
          // 门诊报告：按医生姓名和日期分组
          const doctorName = record.medicalData.doctorName || '未知医生';
          const recordDate = dayjs(record.date).format('YYYY-MM-DD');
          const groupKey = `${doctorName}_${recordDate}`;
          
          const existingGroup = groupedByType[documentType].find(group => 
            group.key === groupKey
          );
          
          if (existingGroup) {
            existingGroup.records.push(record);
          } else {
            groupedByType[documentType].push({
              key: groupKey,
              title: `${doctorName} (${recordDate})`,
              records: [record]
            });
          }
        } else if (documentType === 'inpatient_record') {
          // 住院报告：按科室分组
          const department = record.medicalData.inpatientDepartment || '未知科室';
          const existingGroup = groupedByType[documentType].find(group => 
            group.key === department
          );
          
          if (existingGroup) {
            existingGroup.records.push(record);
          } else {
            groupedByType[documentType].push({
              key: department,
              title: department,
              records: [record]
            });
          }
        } else {
          // 其他类型：按文档类型分组
          const existingGroup = groupedByType[documentType].find(group => 
            group.key === documentType
          );
          
          if (existingGroup) {
            existingGroup.records.push(record);
          } else {
            groupedByType[documentType].push({
              key: documentType,
              title: getDocumentTypeText(documentType),
              records: [record]
            });
          }
        }
      });

      // 对每个分组内的记录按时间升序排序
      Object.keys(groupedByType).forEach(type => {
        groupedByType[type].forEach(group => {
          group.records.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
        });
      });

      grouped[patientName].groupedRecords = groupedByType;
    });

    setGroupedRecords(grouped);
  };

  const handleEditRecord = async (values) => {
    try {
      setSubmitting(true);
      
      console.log('提交的表单值:', values);
      
      // 构建更新数据，保持原有的数据结构
      const updateData = {
        documentType: values.documentType,
        patientInfo: {
          name: values.patientInfo?.name,
          birthDate: values.patientInfo?.birthDate ? values.patientInfo.birthDate.format('YYYY-MM-DD') : currentRecord.patientInfo.birthDate,
          gender: values.patientInfo?.gender
        },
        medicalData: {
          medicalInstitution: values.medicalData?.medicalInstitution,
          notes: values.medicalData?.notes
        },
        keywords: values.keywords,
        date: values.recordDate ? values.recordDate.toISOString() : currentRecord.date
      };

      // 根据文档类型添加相应的医疗数据
      if (values.documentType === 'lab_result') {
        // 处理检验结果子项目，确保数据完整性
        const subItems = values.medicalData?.subItems || [];
        const processedSubItems = subItems.map(item => ({
          subItemName: item.subItemName || '',
          result: item.result || '',
          unit: item.unit || '',
          normalRange: item.normalRange || ''
        })).filter(item => item.subItemName); // 过滤掉没有名称的项目
        
        updateData.medicalData = {
          ...updateData.medicalData,
          testCategory: values.medicalData?.testCategory,
          testItem: values.medicalData?.testItem,
          subItems: processedSubItems
        };
      } else if (values.documentType === 'diagnostic_report') {
        // 处理骨密度数据，确保数据完整性
        const boneDensityTable = Array.isArray(values.medicalData?.boneDensityTable) ? values.medicalData.boneDensityTable : [];
        const processedBoneDensityTable = boneDensityTable.map(item => ({
          group: item.group || '',
          part: item.part || '',
          density: item.density || '',
          t: item.t || '',
          z: item.z || ''
        })).filter(item => item.group && item.part); // 过滤掉没有组和部位的项目
        
        updateData.medicalData = {
          ...updateData.medicalData,
          checkType: values.medicalData?.checkType,
          checkName: values.medicalData?.checkName,
          checkDescription: values.medicalData?.checkDescription,
          checkResult: values.medicalData?.checkResult,
          useContrast: values.medicalData?.useContrast,
          boneDensityTable: processedBoneDensityTable
        };
      } else if (values.documentType === 'outpatient_record') {
        updateData.medicalData = {
          ...updateData.medicalData,
          department: values.medicalData?.department,
          doctorName: values.medicalData?.doctorName,
          chiefComplaint: values.medicalData?.chiefComplaint,
          presentIllness: values.medicalData?.presentIllness,
          physicalExamination: values.medicalData?.physicalExamination,
          assessmentAndPlan: values.medicalData?.assessmentAndPlan,
          followUp: values.medicalData?.followUp
        };
      } else if (values.documentType === 'inpatient_record') {
        updateData.medicalData = {
          ...updateData.medicalData,
          inpatientDepartment: values.medicalData?.inpatientDepartment,
          attendingPhysician: values.medicalData?.attendingPhysician,
          inpatientChiefComplaint: values.medicalData?.inpatientChiefComplaint,
          inpatientPresentIllness: values.medicalData?.inpatientPresentIllness,
          courseRecord: values.medicalData?.courseRecord,
          consultationRecord: values.medicalData?.consultationRecord,
          surgeryRecord: values.medicalData?.surgeryRecord,
          labAndImaging: values.medicalData?.labAndImaging,
          dischargePlan: values.medicalData?.dischargePlan,
          dischargeExamination: values.medicalData?.dischargeExamination,
          medicationGuidance: values.medicalData?.medicationGuidance,
          inpatientFollowUp: values.medicalData?.inpatientFollowUp
        };
      } else {
        // 其他类型 - 已移除诊断、症状、治疗字段
        updateData.medicalData = {
          ...updateData.medicalData
        };
      }

      console.log('准备更新的数据:', updateData);
      const response = await updateMedicalRecord(currentRecord.id, updateData);
      
      if (response.success) {
        message.success('医疗记录更新成功！');
        setEditModalVisible(false);
        editForm.resetFields();
        setCurrentRecord(null);
        fetchRecords();
      } else {
        message.error('更新失败，请重试！');
      }
    } catch (error) {
      console.error('更新医疗记录错误:', error);
      message.error('更新失败，请重试！');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      const response = await deleteMedicalRecord(recordId);
      
      if (response.success) {
        message.success('医疗记录删除成功！');
        fetchRecords();
      } else {
        message.error('删除失败，请重试！');
      }
    } catch (error) {
      console.error('删除医疗记录错误:', error);
      message.error('删除失败，请重试！');
    }
  };

  const showEditModal = (record) => {
    setCurrentRecord(record);
    
    console.log('编辑记录数据:', record);
    
    // 设置子项目和骨密度数据到独立状态
    if (record.documentType === 'lab_result' && record.medicalData.subItems) {
      setSubItemsData(record.medicalData.subItems);
    } else {
      setSubItemsData([]);
    }
    
    if (record.documentType === 'diagnostic_report' && record.medicalData.boneDensityTable) {
      setBoneDensityData(Array.isArray(record.medicalData.boneDensityTable) ? record.medicalData.boneDensityTable : []);
    } else {
      setBoneDensityData([]);
    }
    
    // 使用正确的嵌套路径格式
    const formValues = {
      documentType: record.documentType,
      keywords: record.keywords,
      recordDate: record.date ? dayjs(record.date) : dayjs(), // 添加记录时间字段
      // 患者信息 - 使用嵌套数组格式
      patientInfo: {
        name: record.patientInfo.name,
        birthDate: record.patientInfo.birthDate ? dayjs(record.patientInfo.birthDate) : null,
        gender: record.patientInfo.gender
      },
      // 医疗机构
      medicalData: {
        medicalInstitution: record.medicalData.medicalInstitution,
        notes: record.medicalData.notes
      }
    };

    // 根据文档类型设置不同的字段
    if (record.documentType === 'lab_result') {
      formValues.medicalData = {
        ...formValues.medicalData,
        testCategory: record.medicalData.testCategory,
        testItem: record.medicalData.testItem,
        subItems: record.medicalData.subItems
      };
    } else if (record.documentType === 'diagnostic_report') {
      formValues.medicalData = {
        ...formValues.medicalData,
        checkType: record.medicalData.checkType,
        checkName: record.medicalData.checkName,
        checkDescription: record.medicalData.checkDescription,
        checkResult: record.medicalData.checkResult,
        useContrast: record.medicalData.useContrast,
        boneDensityTable: Array.isArray(record.medicalData.boneDensityTable) ? record.medicalData.boneDensityTable : []
      };
    } else if (record.documentType === 'outpatient_record') {
      formValues.medicalData = {
        ...formValues.medicalData,
        department: record.medicalData.department,
        doctorName: record.medicalData.doctorName,
        chiefComplaint: record.medicalData.chiefComplaint,
        presentIllness: record.medicalData.presentIllness,
        physicalExamination: record.medicalData.physicalExamination,
        assessmentAndPlan: record.medicalData.assessmentAndPlan,
        followUp: record.medicalData.followUp
      };
    } else if (record.documentType === 'inpatient_record') {
      formValues.medicalData = {
        ...formValues.medicalData,
        inpatientDepartment: record.medicalData.inpatientDepartment,
        attendingPhysician: record.medicalData.attendingPhysician,
        inpatientChiefComplaint: record.medicalData.inpatientChiefComplaint,
        inpatientPresentIllness: record.medicalData.inpatientPresentIllness,
        courseRecord: record.medicalData.courseRecord,
        consultationRecord: record.medicalData.consultationRecord,
        surgeryRecord: record.medicalData.surgeryRecord,
        labAndImaging: record.medicalData.labAndImaging,
        dischargePlan: record.medicalData.dischargePlan,
        dischargeExamination: record.medicalData.dischargeExamination,
        medicationGuidance: record.medicalData.medicationGuidance,
        inpatientFollowUp: record.medicalData.inpatientFollowUp
      };
    } else {
      // 其他类型 - 已移除诊断、症状、治疗字段
      formValues.medicalData = {
        ...formValues.medicalData
      };
    }

    console.log('设置表单值:', formValues);
    editForm.setFieldsValue(formValues);
    setEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    editForm.resetFields();
    setCurrentRecord(null);
    setSubItemsData([]);
    setBoneDensityData([]);
  };

  const showDetailModal = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleDetailCancel = () => {
    setDetailModalVisible(false);
    setSelectedRecord(null);
  };

  // PDF导出相关函数
  const showExportModal = (patientName = null) => {
    setSelectedPatientForExport(patientName);
    setSelectedDocumentTypeForExport('all');
    setExportModalVisible(true);
  };

  const handleExportCancel = () => {
    setExportModalVisible(false);
    setSelectedPatientForExport(null);
    setSelectedDocumentTypeForExport('all');
  };

  const generatePDF = async () => {
    try {
      setExporting(true);
      
      // 确定要导出的记录
      let recordsToExport = [];
      if (selectedPatientForExport) {
        // 按患者导出
        const patientRecords = groupedRecords[selectedPatientForExport]?.records || [];
        if (selectedDocumentTypeForExport === 'all') {
          recordsToExport = patientRecords;
        } else {
          recordsToExport = patientRecords.filter(record => record.documentType === selectedDocumentTypeForExport);
        }
      } else {
        // 导出所有记录
        if (selectedDocumentTypeForExport === 'all') {
          recordsToExport = filteredRecords;
        } else {
          recordsToExport = filteredRecords.filter(record => record.documentType === selectedDocumentTypeForExport);
        }
      }

      if (recordsToExport.length === 0) {
        message.warning('没有符合条件的记录可导出');
        return;
      }

      // 创建HTML内容用于PDF生成
      const title = selectedPatientForExport 
        ? `${selectedPatientForExport}的医疗记录`
        : '医疗记录汇总';
      
      const exportInfo = `导出时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')} | 记录数量：${recordsToExport.length}`;
      
      // 生成表格HTML
      let tableHTML = `
        <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; padding: 15px; background: white; width: 100%; box-sizing: border-box;">
          <h1 style="color: #1890ff; text-align: center; margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">${title}</h1>
          <p style="text-align: center; color: #666; margin: 0 0 20px 0; font-size: 12px;">${exportInfo}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin: 0 auto; background: white;">
            <thead>
              <tr style="background-color: #1890ff; color: white;">
                <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; font-weight: bold; width: 12%;">患者姓名</th>
                <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; font-weight: bold; width: 12%;">出生日期</th>
                <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; font-weight: bold; width: 8%;">性别</th>
                <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; font-weight: bold; width: 12%;">文档类型</th>
                <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; font-weight: bold; width: 15%;">记录日期</th>
                <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; font-weight: bold; width: 20%;">相关疾病</th>
                <th style="border: 1px solid #333; padding: 6px 4px; text-align: center; font-weight: bold; width: 21%;">备注</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      recordsToExport.forEach((record, index) => {
        const patientInfo = record.patientInfo;
        const medicalData = record.medicalData || {};
        const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
        
        // 安全地处理可能包含特殊字符的文本
        const safeName = (patientInfo.name || '').replace(/[<>&"']/g, (match) => {
          const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
          return map[match];
        });
        const safeNotes = (medicalData.notes || '').replace(/[<>&"']/g, (match) => {
          const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
          return map[match];
        });
        const safeKeywords = record.keywords ? record.keywords.join(', ').replace(/[<>&"']/g, (match) => {
          const map = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' };
          return map[match];
        }) : '';
        
        tableHTML += `
          <tr style="background-color: ${bgColor};">
            <td style="border: 1px solid #333; padding: 4px 3px; text-align: center; vertical-align: middle;">${safeName}</td>
            <td style="border: 1px solid #333; padding: 4px 3px; text-align: center; vertical-align: middle;">${patientInfo.birthDate ? dayjs(patientInfo.birthDate).format('YYYY-MM-DD') : ''}</td>
            <td style="border: 1px solid #333; padding: 4px 3px; text-align: center; vertical-align: middle;">${patientInfo.gender || ''}</td>
            <td style="border: 1px solid #333; padding: 4px 3px; text-align: center; vertical-align: middle;">${getDocumentTypeText(record.documentType)}</td>
            <td style="border: 1px solid #333; padding: 4px 3px; text-align: center; vertical-align: middle;">${dayjs(record.date).format('YYYY-MM-DD HH:mm')}</td>
            <td style="border: 1px solid #333; padding: 4px 3px; text-align: left; vertical-align: middle; word-wrap: break-word; max-width: 150px;">${safeKeywords}</td>
            <td style="border: 1px solid #333; padding: 4px 3px; text-align: left; vertical-align: middle; word-wrap: break-word; max-width: 160px;">${safeNotes}</td>
          </tr>
        `;
      });
      
      tableHTML += `
            </tbody>
          </table>
          <div style="margin-top: 15px; text-align: center; color: #666; font-size: 9px; border-top: 1px solid #ccc; padding-top: 10px;">
            生成时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')} | 医疗软件管理系统
          </div>
        </div>
      `;

      // 创建临时div元素
      const element = document.createElement('div');
      element.innerHTML = tableHTML;
      
      // 设置元素样式，确保可见且有正确尺寸
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.left = '0';
      element.style.width = '1120px';  // 设置固定宽度
      element.style.backgroundColor = 'white';
      element.style.padding = '0';
      element.style.margin = '0';
      
      document.body.appendChild(element);

      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('开始生成PDF，元素尺寸:', element.scrollWidth, 'x', element.scrollHeight);
      console.log('导出记录数量:', recordsToExport.length);

      // 检查元素是否有内容
      if (element.scrollWidth === 0 || element.scrollHeight === 0) {
        console.error('元素尺寸为0，可能导致PDF空白');
        message.error('生成失败：元素尺寸异常');
        document.body.removeChild(element);
        return;
      }

      // 使用html2canvas截图
      console.log('开始使用html2canvas截图...');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      console.log('截图完成，canvas尺寸:', canvas.width, 'x', canvas.height);

      // 创建PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pdf.internal.pageSize.getWidth() - 20; // 留边距
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      console.log('PDF页面尺寸:', pdf.internal.pageSize.getWidth(), 'x', pdf.internal.pageSize.getHeight());
      console.log('图片尺寸:', imgWidth, 'x', imgHeight);

      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      
      // 保存PDF
      const filename = selectedPatientForExport 
        ? `${selectedPatientForExport}_医疗记录_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`
        : `医疗记录汇总_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
      
      pdf.save(filename);
      console.log('PDF生成成功:', filename);

      // 清理临时元素
      document.body.removeChild(element);

      message.success('PDF导出成功！');
      setExportModalVisible(false);
    } catch (error) {
      console.error('PDF导出失败:', error);
      message.error('PDF导出失败，请重试');
    } finally {
      setExporting(false);
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
      'outpatient_record': 'cyan',
      'lab_result': 'green',
      'diagnostic_report': 'orange',
      'other': 'default'
    };
    return colors[type] || 'default';
  };

  const getAllDiseases = () => {
    const diseases = new Set();
    records.forEach(record => {
      record.keywords.forEach(keyword => diseases.add(keyword));
    });
    return Array.from(diseases).sort();
  };

  const renderMedicalData = (record) => {
    const { medicalData, documentType, fileName, parseDetails } = record;
    return (
      <div>
        {/* 医疗机构显示 */}
        {medicalData.medicalInstitution && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>医疗机构：</Text>
            <Text>{medicalData.medicalInstitution}</Text>
          </div>
        )}
        {/* 文件名显示 */}
        {fileName && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>原始文件名：</Text>
            <Text>{fileName}</Text>
          </div>
        )}
        {/* 检验报告AI result字段显示 */}
        {documentType === 'lab_result' && medicalData.result && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>原始报告内容：</Text>
            <Text>{medicalData.result}</Text>
          </div>
        )}
        {/* 其他类型AI result字段显示 */}
        {documentType !== 'lab_result' && medicalData.result && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>AI提取内容：</Text>
            <Text>{medicalData.result}</Text>
          </div>
        )}
        {/* 继续原有渲染逻辑 */}
        {/* 检验报告等类型 */}
        {documentType === 'lab_result' && medicalData.testCategory && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>检验分类：</Text>
            <Text>{medicalData.testCategory}</Text>
          </div>
        )}
        {documentType === 'lab_result' && medicalData.testItem && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>检验项目：</Text>
            <Text>{medicalData.testItem}</Text>
          </div>
        )}
        {documentType === 'lab_result' && medicalData.subItems && medicalData.subItems.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>检验结果：</Text>
            <div style={{ marginTop: 4 }}>
              {medicalData.subItems.map((item, index) => (
                <div key={index} style={{ marginBottom: 4, paddingLeft: 16 }}>
                  <Text>{item.subItemName}: {item.result} {item.unit}</Text>
                  {item.normalRange && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      (正常范围: {item.normalRange})
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* 检查报告等类型 */}
        {documentType === 'diagnostic_report' && medicalData.checkType && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>检查类型：</Text>
            <Text>{medicalData.checkType}</Text>
          </div>
        )}
        {documentType === 'diagnostic_report' && medicalData.checkName && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>检查名称：</Text>
            <Text>{medicalData.checkName}</Text>
          </div>
        )}
        {documentType === 'diagnostic_report' && medicalData.checkDescription && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>检查描述：</Text>
            <Text>{medicalData.checkDescription}</Text>
          </div>
        )}
        {documentType === 'diagnostic_report' && medicalData.checkResult && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>检查结果：</Text>
            <Text>{medicalData.checkResult}</Text>
          </div>
        )}
        {documentType === 'diagnostic_report' && medicalData.useContrast && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>是否用造影剂：</Text>
            <Text>{medicalData.useContrast}</Text>
          </div>
        )}
        {/* 骨密度详细数据显示 */}
        {documentType === 'diagnostic_report' && medicalData.checkType === '骨密度' && medicalData.boneDensityTable && Array.isArray(medicalData.boneDensityTable) && medicalData.boneDensityTable.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>骨密度详细数据：</Text>
            <div style={{ marginTop: 8 }}>
              <Table
                dataSource={medicalData.boneDensityTable}
                columns={[
                  {
                    title: '分组',
                    dataIndex: 'group',
                    key: 'group',
                    width: 100,
                  },
                  {
                    title: '部位',
                    dataIndex: 'part',
                    key: 'part',
                    width: 150,
                  },
                  {
                    title: '骨密度',
                    dataIndex: 'density',
                    key: 'density',
                    width: 100,
                  },
                  {
                    title: 'T值',
                    dataIndex: 't',
                    key: 't',
                    width: 80,
                  },
                  {
                    title: 'Z值',
                    dataIndex: 'z',
                    key: 'z',
                    width: 80,
                  },
                ]}
                pagination={false}
                size="small"
                bordered
                style={{ fontSize: '12px' }}
              />
            </div>
          </div>
        )}
              {/* 门诊记录专用字段 */}
      {documentType === 'outpatient_record' && medicalData.department && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>科室：</Text>
          <Text>{medicalData.department}</Text>
        </div>
      )}
      {documentType === 'outpatient_record' && medicalData.doctorName && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>医生姓名：</Text>
          <Text>{medicalData.doctorName}</Text>
        </div>
      )}
      {documentType === 'outpatient_record' && medicalData.chiefComplaint && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>主诉：</Text>
          <Text>{medicalData.chiefComplaint}</Text>
        </div>
      )}
      {documentType === 'outpatient_record' && medicalData.presentIllness && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>现病史：</Text>
          <Text>{medicalData.presentIllness}</Text>
        </div>
      )}
      {documentType === 'outpatient_record' && medicalData.physicalExamination && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>体格检查：</Text>
          <Text>{medicalData.physicalExamination}</Text>
        </div>
      )}
      {documentType === 'outpatient_record' && medicalData.assessmentAndPlan && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>评估和计划：</Text>
          <Text>{medicalData.assessmentAndPlan}</Text>
        </div>
      )}
      {documentType === 'outpatient_record' && medicalData.followUp && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>随访：</Text>
          <Text>{medicalData.followUp}</Text>
        </div>
      )}
      {/* 住院记录专用字段 */}
      {documentType === 'inpatient_record' && medicalData.inpatientDepartment && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>科室：</Text>
          <Text>{medicalData.inpatientDepartment}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.attendingPhysician && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>主治医师：</Text>
          <Text>{medicalData.attendingPhysician}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.inpatientChiefComplaint && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>主诉：</Text>
          <Text>{medicalData.inpatientChiefComplaint}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.inpatientPresentIllness && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>现病史：</Text>
          <Text>{medicalData.inpatientPresentIllness}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.courseRecord && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>病程记录：</Text>
          <Text>{medicalData.courseRecord}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.consultationRecord && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>会诊记录：</Text>
          <Text>{medicalData.consultationRecord}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.surgeryRecord && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>手术记录：</Text>
          <Text>{medicalData.surgeryRecord}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.labAndImaging && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>实验室和影像学检查：</Text>
          <Text>{medicalData.labAndImaging}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.dischargePlan && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>出院计划：</Text>
          <Text>{medicalData.dischargePlan}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.dischargeExamination && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>出院检查：</Text>
          <Text>{medicalData.dischargeExamination}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.medicationGuidance && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>用药指导：</Text>
          <Text>{medicalData.medicationGuidance}</Text>
        </div>
      )}
      {documentType === 'inpatient_record' && medicalData.inpatientFollowUp && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>随访：</Text>
          <Text>{medicalData.inpatientFollowUp}</Text>
        </div>
      )}
      {/* 通用诊断、症状、治疗等（其他） */}
      {documentType !== 'outpatient_record' && documentType !== 'inpatient_record' && medicalData.diagnosis && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>诊断：</Text>
          <Text>{medicalData.diagnosis}</Text>
        </div>
      )}
      {documentType !== 'outpatient_record' && documentType !== 'inpatient_record' && medicalData.symptoms && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>症状：</Text>
          <Text>{medicalData.symptoms}</Text>
        </div>
      )}
      {documentType !== 'outpatient_record' && documentType !== 'inpatient_record' && medicalData.treatment && (
        <div style={{ marginBottom: 8 }}>
          <Text strong>治疗：</Text>
          <Text>{medicalData.treatment}</Text>
        </div>
      )}
        {medicalData.notes && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>备注：</Text>
            <Text>{medicalData.notes}</Text>
          </div>
        )}
        {/* AI解析详情折叠面板 */}
        {parseDetails && parseDetails.length > 0 && (
          <Collapse style={{ marginTop: 8 }}>
            <Panel header="AI解析详情" key="ai-details">
              <ul style={{ paddingLeft: 20 }}>
                {parseDetails.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </Panel>
          </Collapse>
        )}
      </div>
    );
  };

  const documentTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'inpatient_record', label: '住院记录' },
    { value: 'outpatient_record', label: '门诊记录' },
    { value: 'lab_result', label: '检验报告' },
    { value: 'diagnostic_report', label: '检查报告' },
    { value: 'other', label: '其他' }
  ];

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
      <Title level={2}>医疗记录管理</Title>
      <Text type="secondary">
        查看和管理所有医疗记录，按患者姓名分组显示，支持编辑和删除
      </Text>

      {/* 筛选器 */}
      <Card style={{ marginTop: 24, marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={5}>
            <Text strong>文档类型：</Text>
            <Select
              value={filters.documentType}
              onChange={(value) => setFilters({ ...filters, documentType: value })}
              style={{ width: '100%', marginTop: 8 }}
            >
              {documentTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <Text strong>疾病筛选：</Text>
            <Select
              value={filters.disease}
              onChange={(value) => setFilters({ ...filters, disease: value })}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="all">全部疾病</Option>
              {getAllDiseases().map(disease => (
                <Option key={disease} value={disease}>
                  {disease}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={10}>
            <Text strong>关键词搜索：</Text>
            <Search
              placeholder="搜索患者姓名、诊断、症状等"
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              style={{ marginTop: 8 }}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Text strong>导出功能：</Text>
            <div style={{ marginTop: 8 }}>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={() => showExportModal()}
                style={{ marginRight: 8 }}
              >
                导出PDF
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card className="stats-card">
            <div className="stats-number">{records.length}</div>
            <div className="stats-label">总记录数</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <div className="stats-number">{Object.keys(groupedRecords).length}</div>
            <div className="stats-label">家庭成员数量</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <div className="stats-number">{getAllDiseases().length}</div>
            <div className="stats-label">疾病类型</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stats-card">
            <div className="stats-number">
              {records.filter(r => dayjs(r.date).isSame(dayjs(), 'day')).length}
            </div>
            <div className="stats-label">今日新增</div>
          </Card>
        </Col>
      </Row>

      {/* 患者列表 */}
      <Card title={`家庭成员列表 (${Object.keys(groupedRecords).length} 位家庭成员)`}>
        {Object.keys(groupedRecords).length === 0 ? (
          <Empty description="暂无符合条件的家庭成员记录" />
        ) : (
          <List
            dataSource={Object.entries(groupedRecords)}
            renderItem={([patientName, patientData]) => (
              <List.Item className="patient-card">
                <List.Item.Meta
                  avatar={<UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong style={{ fontSize: 16 }}>{patientName}</Text>
                        {patientData.patientInfo.birthDate && (
                          <Text type="secondary" style={{ marginLeft: 12 }}>
                            {dayjs(patientData.patientInfo.birthDate).format('YYYY-MM-DD')} | {patientData.patientInfo.gender}
                          </Text>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color="blue">{patientData.records.length} 条记录</Tag>
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={() => showExportModal(patientName)}
                          size="small"
                        >
                          导出PDF
                        </Button>
                      </div>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 12 }}>
                        <Text strong>医疗记录概览：</Text>
                      </div>
                      <div>
                        {Object.entries(patientData.groupedRecords || {}).map(([documentType, groups]) => (
                          <div key={documentType} style={{ marginBottom: 16 }}>
                            <div style={{ marginBottom: 8 }}>
                              <Tag color={getDocumentTypeColor(documentType)} style={{ fontSize: 14, padding: '4px 8px' }}>
                                {getDocumentTypeText(documentType)}
                              </Tag>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {groups.map((group) => (
                                <Card
                                  key={group.key}
                                  size="small"
                                  style={{ 
                                    width: 320, 
                                    border: '1px solid #d9d9d9',
                                    transition: 'all 0.3s'
                                  }}
                                  title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Text strong style={{ fontSize: 13 }}>{group.title}</Text>
                                      <Text type="secondary" style={{ fontSize: 11 }}>
                                        {group.records.length} 条记录
                                      </Text>
                                    </div>
                                  }
                                >
                                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {group.records.map((record) => (
                                      <div
                                        key={record.id}
                                        style={{
                                          padding: 8,
                                          border: '1px solid #f0f0f0',
                                          borderRadius: 4,
                                          marginBottom: 8,
                                          cursor: 'pointer',
                                          backgroundColor: '#fafafa',
                                          transition: 'all 0.3s'
                                        }}
                                        onClick={() => showDetailModal(record)}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = '#fafafa';
                                        }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                          <Text type="secondary" style={{ fontSize: 11 }}>
                                            {dayjs(record.date).format('YYYY-MM-DD')}
                                          </Text>
                                          <div style={{ display: 'flex', gap: 4 }}>
                                            <Button
                                              type="primary"
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                showDetailModal(record);
                                              }}
                                              style={{ fontSize: 10, padding: '0 6px', height: 20 }}
                                            >
                                              详情
                                            </Button>
                                            <Button
                                              icon={<EditOutlined />}
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                showEditModal(record);
                                              }}
                                              style={{ fontSize: 10, padding: '0 6px', height: 20 }}
                                            >
                                              编辑
                                            </Button>
                                            <Popconfirm
                                              title="确认删除"
                                              description="确定要删除这条医疗记录吗？"
                                              onConfirm={(e) => {
                                                e.stopPropagation();
                                                handleDeleteRecord(record.id);
                                              }}
                                              okText="确认"
                                              cancelText="取消"
                                              okType="danger"
                                            >
                                              <Button
                                                type="primary"
                                                danger
                                                icon={<DeleteOutlined />}
                                                size="small"
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ fontSize: 10, padding: '0 6px', height: 20 }}
                                              >
                                                删除
                                              </Button>
                                            </Popconfirm>
                                          </div>
                                        </div>
                                        {record.keywords.length > 0 && (
                                          <div>
                                            <Text strong style={{ fontSize: 10 }}>相关疾病：</Text>
                                            <div style={{ marginTop: 2 }}>
                                              {record.keywords.slice(0, 2).map(keyword => (
                                                <Tag key={keyword} size="small" color="blue" style={{ fontSize: 9 }}>
                                                  {keyword}
                                                </Tag>
                                              ))}
                                              {record.keywords.length > 2 && (
                                                <Text type="secondary" style={{ fontSize: 9, marginLeft: 4 }}>
                                                  +{record.keywords.length - 2}
                                                </Text>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 详细记录模态框 */}
      <Modal
        title={`医疗记录详情 - ${selectedRecord?.patientInfo?.name || ''}`}
        open={detailModalVisible}
        onCancel={handleDetailCancel}
        footer={[
          <Button key="close" onClick={handleDetailCancel}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              showEditModal(selectedRecord);
            }}
          >
            编辑
          </Button>
        ]}
        width={900}
      >
        {selectedRecord && (
          <div>
            {/* 患者基本信息 */}
            <Card title="患者基本信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>姓名：</Text>
                  <Text>{selectedRecord.patientInfo.name}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>出生日期：</Text>
                  <Text>{selectedRecord.patientInfo.birthDate ? dayjs(selectedRecord.patientInfo.birthDate).format('YYYY-MM-DD') : '未填写'}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>性别：</Text>
                  <Text>{selectedRecord.patientInfo.gender || '未填写'}</Text>
                </Col>
              </Row>
            </Card>

            {/* 记录基本信息 */}
            <Card title="记录基本信息" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>记录类型：</Text>
                  <Tag color={getDocumentTypeColor(selectedRecord.documentType)}>
                    {getDocumentTypeText(selectedRecord.documentType)}
                  </Tag>
                </Col>
                <Col span={8}>
                  <Text strong>记录日期：</Text>
                  <Text>{dayjs(selectedRecord.date).format('YYYY-MM-DD')}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>医疗机构：</Text>
                  <Text>{selectedRecord.medicalData.medicalInstitution || '未填写'}</Text>
                </Col>
              </Row>
            </Card>

            {/* 医疗数据详情 */}
            <Card title="医疗数据详情">
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {renderMedicalData(selectedRecord)}
              </div>
            </Card>

            {/* 相关疾病 */}
            {selectedRecord.keywords.length > 0 && (
              <Card title="相关疾病" style={{ marginTop: 16 }}>
                <div>
                  {selectedRecord.keywords.map(keyword => (
                    <Tag key={keyword} color="blue" style={{ marginBottom: 8 }}>
                      {keyword}
                    </Tag>
                  ))}
                </div>
              </Card>
            )}

            {/* 备注信息 */}
            {selectedRecord.medicalData.notes && (
              <Card title="备注信息" style={{ marginTop: 16 }}>
                <Text>{selectedRecord.medicalData.notes}</Text>
              </Card>
            )}

            {/* 更新时间 */}
            {selectedRecord.updatedAt && (
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Text type="secondary">
                  最后更新：{dayjs(selectedRecord.updatedAt).format('YYYY-MM-DD HH:mm')}
                </Text>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 编辑医疗记录模态框 */}
      <Modal
        title={`编辑医疗记录 - ${currentRecord?.patientInfo?.name || ''}`}
        open={editModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditRecord}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['patientInfo', 'name']}
                label="患者姓名"
                rules={[{ required: true, message: '请输入患者姓名' }]}
              >
                <Input placeholder="请输入患者姓名" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['patientInfo', 'birthDate']}
                label="出生日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={['patientInfo', 'gender']}
                label="性别"
              >
                <Select placeholder="选择性别">
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="documentType"
                label="文档类型"
                rules={[{ required: true, message: '请选择文档类型' }]}
              >
                <Select placeholder="选择文档类型">
                  <Option value="inpatient_record">住院记录</Option>
                  <Option value="outpatient_record">门诊记录</Option>
                  <Option value="lab_result">检验报告</Option>
                  <Option value="diagnostic_report">检查报告</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="recordDate"
                label="记录时间"
                rules={[{ required: true, message: '请选择记录时间' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="选择记录时间"
                  showTime={false}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['medicalData', 'medicalInstitution']}
                label="医疗机构"
                rules={[{ required: true, message: '请输入医疗机构' }]}
              >
                <Input placeholder="请输入医疗机构名称" />
              </Form.Item>
            </Col>
          </Row>

          {/* 检验报告字段 */}
          {currentRecord?.documentType === 'lab_result' && (
            <>
              <Form.Item
                name={['medicalData', 'testCategory']}
                label="检验分类"
              >
                <Input placeholder="请输入检验分类" />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'testItem']}
                label="检验项目"
              >
                <Input placeholder="请输入检验项目" />
              </Form.Item>

              {/* 检验结果子项目 */}
              <Form.Item
                name={['medicalData', 'subItems']}
                label="检验结果"
              >
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}>
                  {subItemsData && subItemsData.length > 0 ? (
                    <div>
                      {subItemsData.map((item, index) => (
                        <div key={`subitem-${item.subItemName}-${index}`} style={{ marginBottom: 16, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>{item.subItemName}</Text>
                          <Row gutter={16}>
                            <Col span={8}>
                              <Form.Item
                                name={['medicalData', 'subItems', index, 'subItemName']}
                                hidden
                              >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                name={['medicalData', 'subItems', index, 'result']}
                                label="结果"
                                style={{ marginBottom: 8 }}
                              >
                                <Input placeholder="请输入结果" />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name={['medicalData', 'subItems', index, 'unit']}
                                label="单位"
                                style={{ marginBottom: 8 }}
                              >
                                <Input placeholder="单位" />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                name={['medicalData', 'subItems', index, 'normalRange']}
                                label="正常范围"
                                style={{ marginBottom: 8 }}
                              >
                                <Input placeholder="正常范围" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">暂无检验结果数据</Text>
                  )}
                </div>
              </Form.Item>
            </>
          )}

          {/* 门诊记录字段 */}
          {currentRecord?.documentType === 'outpatient_record' && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['medicalData', 'department']}
                    label="科室"
                  >
                    <Input placeholder="请输入科室" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['medicalData', 'doctorName']}
                    label="医生姓名"
                  >
                    <Input placeholder="请输入医生姓名" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name={['medicalData', 'chiefComplaint']}
                label="主诉"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="请输入患者主诉"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'presentIllness']}
                label="现病史"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入现病史"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'physicalExamination']}
                label="体格检查"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入体格检查结果"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'assessmentAndPlan']}
                label="评估和计划"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入评估和计划"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'followUp']}
                label="随访"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="请输入随访计划"
                />
              </Form.Item>
            </>
          )}

          {/* 检查报告字段 */}
          {currentRecord?.documentType === 'diagnostic_report' && (
            <>
              <Form.Item
                name={['medicalData', 'checkType']}
                label="检查类型"
              >
                <Select placeholder="请选择检查类型">
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

              {/* 骨密度表格 */}
              {(currentRecord?.medicalData?.checkType === '骨密度' || editForm.getFieldValue(['medicalData', 'checkType']) === '骨密度') && (
                <Form.Item
                  name={['medicalData', 'boneDensityTable']}
                  label="骨密度详细数据"
                >
                  <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}>
                    {Array.isArray(boneDensityData) && boneDensityData.length > 0 ? (
                      <div>
                        {boneDensityData.map((item, index) => (
                          <div key={`bone-${item.group}-${item.part}-${index}`} style={{ marginBottom: 16, padding: 12, backgroundColor: '#f9f9f9', borderRadius: 6 }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>{item.group} - {item.part}</Text>
                            <Row gutter={16}>
                              <Col span={6}>
                                <Form.Item
                                  name={['medicalData', 'boneDensityTable', index, 'group']}
                                  hidden
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  name={['medicalData', 'boneDensityTable', index, 'part']}
                                  hidden
                                >
                                  <Input />
                                </Form.Item>
                                <Form.Item
                                  name={['medicalData', 'boneDensityTable', index, 'density']}
                                  label="骨密度"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Input placeholder="请输入骨密度值" />
                                </Form.Item>
                              </Col>
                              <Col span={6}>
                                <Form.Item
                                  name={['medicalData', 'boneDensityTable', index, 't']}
                                  label="T值"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Input placeholder="请输入T值" />
                                </Form.Item>
                              </Col>
                              <Col span={6}>
                                <Form.Item
                                  name={['medicalData', 'boneDensityTable', index, 'z']}
                                  label="Z值"
                                  style={{ marginBottom: 8 }}
                                >
                                  <Input placeholder="请输入Z值" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Text type="secondary">暂无骨密度数据</Text>
                    )}
                  </div>
                </Form.Item>
              )}

              {/* 非骨密度检查的其他字段 */}
              {currentRecord?.medicalData?.checkType !== '骨密度' && editForm.getFieldValue(['medicalData', 'checkType']) !== '骨密度' && (
                <>
                  <Form.Item
                    name={['medicalData', 'checkName']}
                    label="检查名称"
                  >
                    <Input placeholder="请输入检查名称" />
                  </Form.Item>

                  <Form.Item
                    name={['medicalData', 'checkDescription']}
                    label="检查描述"
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="请输入检查描述"
                    />
                  </Form.Item>

                  <Form.Item
                    name={['medicalData', 'checkResult']}
                    label="检查结果"
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="请输入检查结果"
                    />
                  </Form.Item>

                  <Form.Item
                    name={['medicalData', 'useContrast']}
                    label="是否用造影剂"
                  >
                    <Select placeholder="选择是否使用造影剂">
                      <Option value="是">是</Option>
                      <Option value="否">否</Option>
                    </Select>
                  </Form.Item>
                </>
              )}
            </>
          )}

          {/* 住院记录字段 */}
          {currentRecord?.documentType === 'inpatient_record' && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={['medicalData', 'inpatientDepartment']}
                    label="科室"
                  >
                    <Input placeholder="请输入科室" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={['medicalData', 'attendingPhysician']}
                    label="主治医师"
                  >
                    <Input placeholder="请输入主治医师" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name={['medicalData', 'inpatientChiefComplaint']}
                label="主诉"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="请输入患者主诉"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'inpatientPresentIllness']}
                label="现病史"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入现病史"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'courseRecord']}
                label="病程记录"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入病程记录"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'consultationRecord']}
                label="会诊记录"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入会诊记录"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'surgeryRecord']}
                label="手术记录"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入手术记录"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'labAndImaging']}
                label="实验室和影像学检查"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="请输入实验室和影像学检查结果"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'dischargePlan']}
                label="出院计划"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="请输入出院计划"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'dischargeExamination']}
                label="出院检查"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="请输入出院检查"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'medicationGuidance']}
                label="用药指导"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="请输入用药指导"
                />
              </Form.Item>

              <Form.Item
                name={['medicalData', 'inpatientFollowUp']}
                label="随访"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="请输入随访计划"
                />
              </Form.Item>
            </>
          )}

          {/* 其他记录类型字段 - 已移除诊断、症状、治疗字段 */}

          <Form.Item
            name={['medicalData', 'notes']}
            label="备注"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入备注信息"
            />
          </Form.Item>

          <Form.Item
            name="keywords"
            label="相关疾病"
          >
            <Select
              mode="tags"
              placeholder="输入或选择相关疾病"
              style={{ width: '100%' }}
            >
              {getAllDiseases().map(disease => (
                <Option key={disease} value={disease}>
                  {disease}
                </Option>
              ))}
            </Select>
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

      {/* PDF导出模态框 */}
      <Modal
        title="导出医疗记录PDF"
        open={exportModalVisible}
        onCancel={handleExportCancel}
        footer={[
          <Button key="cancel" onClick={handleExportCancel}>
            取消
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<FilePdfOutlined />}
            loading={exporting}
            onClick={generatePDF}
          >
            生成PDF
          </Button>
        ]}
        width={500}
      >
        <div>
          <div style={{ marginBottom: 16 }}>
            <Text strong>导出范围：</Text>
            <div style={{ marginTop: 8 }}>
              {selectedPatientForExport ? (
                <Text>患者：{selectedPatientForExport}</Text>
              ) : (
                <Text>所有患者</Text>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>文档类型筛选：</Text>
            <Select
              value={selectedDocumentTypeForExport}
              onChange={setSelectedDocumentTypeForExport}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="all">全部类型</Option>
              {documentTypes.slice(1).map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>导出内容：</Text>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>患者基本信息（姓名、出生日期、性别）</li>
              <li>医疗记录详细信息</li>
              <li>根据文档类型显示相应字段</li>
              <li>相关疾病标签</li>
              <li>备注信息</li>
              <li>导出时间和记录统计</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 6 }}>
            <Text type="secondary">
              <Text strong>提示：</Text>
              {selectedPatientForExport 
                ? `将导出患者"${selectedPatientForExport}"的${selectedDocumentTypeForExport === 'all' ? '所有' : getDocumentTypeText(selectedDocumentTypeForExport)}记录`
                : `将导出所有患者的${selectedDocumentTypeForExport === 'all' ? '所有' : getDocumentTypeText(selectedDocumentTypeForExport)}记录`
              }
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Records; 