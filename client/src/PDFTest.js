import React, { useState } from 'react';
import { Button, Card, Typography, message } from 'antd';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const PDFTest = () => {
  const [exporting, setExporting] = useState(false);

  const testData = [
    {
      id: '1',
      patientInfo: {
        name: '测试患者',
        birthDate: '1990-01-01',
        gender: '男'
      },
      documentType: 'outpatient_record',
      date: '2025-01-12T10:00:00.000Z',
      keywords: ['高血压', '糖尿病'],
      medicalData: {
        notes: '测试备注信息'
      }
    },
    {
      id: '2',
      patientInfo: {
        name: '测试患者2',
        birthDate: '1985-05-15',
        gender: '女'
      },
      documentType: 'lab_result',
      date: '2025-01-11T09:00:00.000Z',
      keywords: ['血脂异常'],
      medicalData: {
        notes: '血脂检查结果异常'
      }
    }
  ];

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

  const generateTestPDF = async () => {
    try {
      setExporting(true);
      console.log('开始生成测试PDF (使用 jsPDF + html2canvas)...');
      console.log('测试数据:', testData);

      const title = '测试医疗记录PDF';
      const exportInfo = `导出时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')} | 记录数量：${testData.length}`;

      // 创建简单的HTML表格
      let tableHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: white; width: 100%; box-sizing: border-box;">
          <h1 style="color: #1890ff; text-align: center; margin-bottom: 15px; font-size: 24px;">${title}</h1>
          <div style="text-align: center; color: #666; margin-bottom: 20px; font-size: 14px;">${exportInfo}</div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
            <thead>
              <tr style="background-color: #1890ff; color: white;">
                <th style="border: 1px solid #333; padding: 12px; text-align: center; font-weight: bold;">患者姓名</th>
                <th style="border: 1px solid #333; padding: 12px; text-align: center; font-weight: bold;">出生日期</th>
                <th style="border: 1px solid #333; padding: 12px; text-align: center; font-weight: bold;">性别</th>
                <th style="border: 1px solid #333; padding: 12px; text-align: center; font-weight: bold;">文档类型</th>
                <th style="border: 1px solid #333; padding: 12px; text-align: center; font-weight: bold;">记录日期</th>
                <th style="border: 1px solid #333; padding: 12px; text-align: center; font-weight: bold;">相关疾病</th>
                <th style="border: 1px solid #333; padding: 12px; text-align: center; font-weight: bold;">备注</th>
              </tr>
            </thead>
            <tbody>
      `;

      testData.forEach((record, index) => {
        const patientInfo = record.patientInfo;
        const medicalData = record.medicalData || {};
        const bgColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff';
        
        tableHTML += `
          <tr style="background-color: ${bgColor};">
            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${patientInfo.name || ''}</td>
            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${patientInfo.birthDate ? dayjs(patientInfo.birthDate).format('YYYY-MM-DD') : ''}</td>
            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${patientInfo.gender || ''}</td>
            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${getDocumentTypeText(record.documentType)}</td>
            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${dayjs(record.date).format('YYYY-MM-DD HH:mm')}</td>
            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${record.keywords ? record.keywords.join(', ') : ''}</td>
            <td style="border: 1px solid #333; padding: 8px; text-align: center;">${medicalData.notes || ''}</td>
          </tr>
        `;
      });

      tableHTML += `
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 10px; border-top: 1px solid #ccc; padding-top: 10px;">
            生成时间：${dayjs().format('YYYY-MM-DD HH:mm:ss')} | 医疗软件管理系统 (测试版)
          </div>
        </div>
      `;

      console.log('生成的HTML内容长度:', tableHTML.length);

      // 创建临时div元素
      const element = document.createElement('div');
      element.innerHTML = tableHTML;
      
      // 设置元素样式，确保可见和有正确尺寸
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.left = '0';
      element.style.width = '1120px';  // 设置固定宽度
      element.style.backgroundColor = 'white';
      element.style.padding = '0';
      element.style.margin = '0';
      
      document.body.appendChild(element);
      console.log('元素已添加到DOM');

      // 等待DOM更新
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('元素尺寸:', element.scrollWidth, 'x', element.scrollHeight);
      console.log('元素offsetWidth:', element.offsetWidth);
      console.log('元素offsetHeight:', element.offsetHeight);

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
        logging: true,
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
      const filename = `测试医疗记录_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
      pdf.save(filename);

      console.log('PDF生成成功:', filename);
      message.success('测试PDF生成成功！');

      // 清理临时元素
      document.body.removeChild(element);
      console.log('临时元素已清理');

    } catch (error) {
      console.error('生成测试PDF失败:', error);
      message.error(`生成测试PDF失败: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const generateSimplePDF = async () => {
    try {
      setExporting(true);
      console.log('开始生成简单测试PDF (使用 jsPDF + html2canvas)...');

      // 更简单的HTML
      const simpleHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; background: white; width: 100%; box-sizing: border-box;">
          <h1 style="color: #1890ff; text-align: center; margin-bottom: 30px; font-size: 28px;">简单测试PDF</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">这是一个简单的测试文档。</p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">当前时间: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">如果你能看到这个内容，说明PDF生成基本功能正常。</p>
          <div style="border: 2px solid #1890ff; padding: 20px; margin-top: 30px; border-radius: 8px;">
            <h2 style="color: #1890ff; margin-top: 0;">测试信息</h2>
            <ul style="font-size: 14px; line-height: 1.8;">
              <li>使用库: jsPDF + html2canvas</li>
              <li>页面方向: 纵向</li>
              <li>生成时间: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}</li>
              <li>状态: 测试中</li>
            </ul>
          </div>
        </div>
      `;

      const element = document.createElement('div');
      element.innerHTML = simpleHTML;
      element.style.position = 'absolute';
      element.style.top = '-9999px';
      element.style.left = '0';
      element.style.width = '800px';
      element.style.backgroundColor = 'white';
      element.style.padding = '0';
      element.style.margin = '0';

      document.body.appendChild(element);
      console.log('简单测试元素已添加到DOM');
      
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('简单测试元素尺寸:', element.scrollWidth, 'x', element.scrollHeight);

      // 使用html2canvas截图
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      console.log('简单测试截图完成，canvas尺寸:', canvas.width, 'x', canvas.height);

      // 创建PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      
      const filename = `简单测试_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`;
      pdf.save(filename);

      document.body.removeChild(element);
      
      console.log('简单PDF生成成功:', filename);
      message.success('简单测试PDF生成成功！');

    } catch (error) {
      console.error('生成简单PDF失败:', error);
      message.error(`生成简单PDF失败: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Title level={2}>PDF生成测试</Title>
      <Text type="secondary">
        这个页面用于测试和调试PDF生成功能
      </Text>

      <Card style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={4}>测试数据</Title>
          <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Button
            type="primary"
            onClick={generateSimplePDF}
            loading={exporting}
            size="large"
          >
            生成简单测试PDF
          </Button>

          <Button
            type="default"
            onClick={generateTestPDF}
            loading={exporting}
            size="large"
          >
            生成表格测试PDF
          </Button>
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>调试信息</Title>
        <Text>请打开浏览器开发者工具的控制台查看详细日志</Text>
        <div style={{ marginTop: 8 }}>
          <Text strong>检查步骤：</Text>
          <ol>
            <li>点击生成PDF按钮</li>
            <li>查看控制台日志</li>
            <li>检查元素尺寸信息</li>
            <li>查看PDF生成过程</li>
            <li>确认下载的PDF文件</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default PDFTest; 