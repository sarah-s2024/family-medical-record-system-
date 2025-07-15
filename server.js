const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();

// 生产环境配置
const PORT = process.env.PORT || 5001;

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// 创建必要的目录
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(dataDir);

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 移除文件类型限制，支持所有文件类型
    cb(null, true);
  }
});

// 医疗数据存储
let medicalRecords = [];
let patients = [];

// 初始化数据文件
const initializeData = () => {
  try {
    if (fs.existsSync(path.join(dataDir, 'medicalRecords.json'))) {
      medicalRecords = JSON.parse(fs.readFileSync(path.join(dataDir, 'medicalRecords.json'), 'utf8'));
    }
    if (fs.existsSync(path.join(dataDir, 'patients.json'))) {
      patients = JSON.parse(fs.readFileSync(path.join(dataDir, 'patients.json'), 'utf8'));
    }
  } catch (error) {
    console.log('初始化数据文件...');
  }
};

// 保存数据到文件
const saveData = () => {
  fs.writeFileSync(path.join(dataDir, 'medicalRecords.json'), JSON.stringify(medicalRecords, null, 2));
  fs.writeFileSync(path.join(dataDir, 'patients.json'), JSON.stringify(patients, null, 2));
};

// 智能PDF解析函数 - AI增强版
const parsePDFContent = (text) => {
  const extractedData = {
    documentType: '',
    patientInfo: {},
    medicalData: {},
    date: new Date().toISOString(),
    keywords: [],
    parseConfidence: 0,
    parseDetails: []
  };

  // AI智能文档类型检测
  const lowerText = text.toLowerCase();
  const documentTypeScores = {
    'inpatient_record': 0,
    'outpatient_record': 0,
    'lab_result': 0,
    'diagnostic_report': 0,
    'other': 0
  };

  // 住院记录关键词
  const inpatientKeywords = ['住院', 'inpatient', 'hospitalization', '入院', '出院', '病房', '住院部'];
  inpatientKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      documentTypeScores.inpatient_record += 2;
    }
  });

  // 门诊记录关键词
  const outpatientKeywords = ['门诊', 'outpatient', 'visit', 'consultation', 'appointment', '就诊', '复诊'];
  outpatientKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      documentTypeScores.outpatient_record += 2;
    }
  });

  // 检验报告关键词
  const labKeywords = ['检验', 'lab', 'test', 'result', 'laboratory', '化验', '血常规', '尿常规', '生化'];
  labKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      documentTypeScores.lab_result += 2;
    }
  });

  // 检查报告关键词 - 包括骨密度
  const diagnosticKeywords = ['检查', 'diagnostic', 'diagnosis', '影像', 'ct', 'mri', 'x光', 'b超', '超声', '骨密度'];
  diagnosticKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      documentTypeScores.diagnostic_report += 2;
    }
  });
  
  // 骨密度特殊识别 - 如果包含骨密度，直接识别为检查报告
  if (lowerText.includes('骨密度')) {
    documentTypeScores.diagnostic_report += 5; // 给骨密度更高的权重
  }

  // 选择得分最高的文档类型
  const maxScore = Math.max(...Object.values(documentTypeScores));
  if (maxScore > 0) {
    extractedData.documentType = Object.keys(documentTypeScores).find(key => documentTypeScores[key] === maxScore);
  } else {
    extractedData.documentType = 'other';
  }

  // 计算解析置信度
  extractedData.parseConfidence = Math.min(maxScore / 4, 1) * 100;

  // AI智能家庭成员信息提取 - 支持多种格式
  const patientInfoPatterns = {
    name: [
      /姓名[：:]\s*([^\n\r,，]+)/,
      /name[：:]\s*([^\n\r,，]+)/i,
      /家庭成员[：:]\s*([^\n\r,，]+)/,
      /patient[：:]\s*([^\n\r,，]+)/i,
      /^([^\n\r,，]{2,4})\s*[男女]/,
      /^([^\n\r,，]{2,4})\s*[mf]/i
    ],
    birthDate: [
      /出生日期[：:]\s*([^\n\r,，]+)/,
      /birth[：:]\s*([^\n\r,，]+)/i,
      /出生[：:]\s*([^\n\r,，]+)/,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
      /(\d{4}年\d{1,2}月\d{1,2}日)/
    ],
    gender: [
      /性别[：:]\s*([男女])/,
      /gender[：:]\s*([mf]|male|female)/i,
      /([男女])\s*[，,]?\s*\d+[岁年]/,
      /([mf])\s*[，,]?\s*\d+[岁年]/i
    ],
    age: [
      /年龄[：:]\s*(\d+)/,
      /age[：:]\s*(\d+)/i,
      /(\d+)[岁年]/,
      /(\d+)\s*years?\s*old/i
    ]
  };

  // 提取家庭成员姓名
  for (const pattern of patientInfoPatterns.name) {
    const match = text.match(pattern);
    if (match && match[1].trim().length > 1) {
      extractedData.patientInfo.name = match[1].trim();
      extractedData.parseDetails.push(`成功提取家庭成员姓名: ${match[1].trim()}`);
      break;
    }
  }

  // 提取出生日期
  for (const pattern of patientInfoPatterns.birthDate) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      extractedData.patientInfo.birthDate = match[1].trim();
      extractedData.parseDetails.push(`成功提取出生日期: ${match[1].trim()}`);
      break;
    }
  }

  // 提取性别
  for (const pattern of patientInfoPatterns.gender) {
    const match = text.match(pattern);
    if (match && match[1].trim()) {
      const gender = match[1].toLowerCase();
      if (gender === 'm' || gender === 'male') {
        extractedData.patientInfo.gender = '男';
      } else if (gender === 'f' || gender === 'female') {
        extractedData.patientInfo.gender = '女';
      } else {
        extractedData.patientInfo.gender = gender;
      }
      extractedData.parseDetails.push(`成功提取性别: ${extractedData.patientInfo.gender}`);
      break;
    }
  }

  // 提取年龄（如果没有出生日期）
  if (!extractedData.patientInfo.birthDate) {
    for (const pattern of patientInfoPatterns.age) {
      const match = text.match(pattern);
      if (match && match[1].trim()) {
        extractedData.patientInfo.age = match[1].trim();
        extractedData.parseDetails.push(`成功提取年龄: ${match[1].trim()}岁`);
        break;
      }
    }
  }

  // AI智能医疗数据提取 - 支持多种格式和文档类型
  const medicalDataPatterns = {
    // 通用医疗字段
    medicalInstitution: [
      /医疗机构[：:]\s*([^\n\r]+)/,
      /medical institution[：:]\s*([^\n\r]+)/i,
      /医院[：:]\s*([^\n\r]+)/,
      /hospital[：:]\s*([^\n\r]+)/i,
      /诊所[：:]\s*([^\n\r]+)/,
      /clinic[：:]\s*([^\n\r]+)/i,
      /医疗中心[：:]\s*([^\n\r]+)/,
      /medical center[：:]\s*([^\n\r]+)/i,
      /(北京|上海|广州|深圳|杭州|南京|武汉|成都|西安|重庆|天津|青岛|大连|厦门|苏州|无锡|宁波|长沙|郑州|济南|哈尔滨|沈阳|长春|石家庄|太原|呼和浩特|合肥|福州|南昌|南宁|海口|贵阳|昆明|拉萨|兰州|西宁|银川|乌鲁木齐)[^医]*医院/,
      /(协和|同仁|天坛|宣武|友谊|朝阳|安贞|积水潭|北大|清华|复旦|交大|中山|华西|湘雅|同济|瑞金|华山|长海|长征|东方|仁济|新华|儿童|妇产|肿瘤|心血管|神经|骨科|眼科|口腔|皮肤|精神|传染|结核|职业病|职业病防治|职业病医院)[^医]*医院/
    ],
    diagnosis: [
      /诊断[：:]\s*([^\n\r]+)/,
      /diagnosis[：:]\s*([^\n\r]+)/i,
      /临床诊断[：:]\s*([^\n\r]+)/,
      /初步诊断[：:]\s*([^\n\r]+)/,
      /最终诊断[：:]\s*([^\n\r]+)/
    ],
    symptoms: [
      /症状[：:]\s*([^\n\r]+)/,
      /symptoms?[：:]\s*([^\n\r]+)/i,
      /临床表现[：:]\s*([^\n\r]+)/
    ],
    treatment: [
      /治疗[：:]\s*([^\n\r]+)/,
      /treatment[：:]\s*([^\n\r]+)/i,
      /用药[：:]\s*([^\n\r]+)/,
      /处方[：:]\s*([^\n\r]+)/
    ],
    // 门诊记录专用字段
    department: [
      /科室[：:]\s*([^\n\r]+)/,
      /department[：:]\s*([^\n\r]+)/i,
      /科别[：:]\s*([^\n\r]+)/,
      /门诊科室[：:]\s*([^\n\r]+)/
    ],
    doctorName: [
      /医生[：:]\s*([^\n\r]+)/,
      /doctor[：:]\s*([^\n\r]+)/i,
      /医师[：:]\s*([^\n\r]+)/,
      /主治医师[：:]\s*([^\n\r]+)/,
      /主诊医师[：:]\s*([^\n\r]+)/
    ],
    chiefComplaint: [
      /主诉[：:]\s*([^\n\r]+)/,
      /chief complaint[：:]\s*([^\n\r]+)/i,
      /主诉[：:]\s*([^\n\r]+)/,
      /家庭成员主诉[：:]\s*([^\n\r]+)/
    ],
    presentIllness: [
      /现病史[：:]\s*([^\n\r]+)/,
      /present illness[：:]\s*([^\n\r]+)/i,
      /现病史[：:]\s*([^\n\r]+)/,
      /病史[：:]\s*([^\n\r]+)/
    ],
    physicalExamination: [
      /体格检查[：:]\s*([^\n\r]+)/,
      /physical examination[：:]\s*([^\n\r]+)/i,
      /体检[：:]\s*([^\n\r]+)/,
      /检查[：:]\s*([^\n\r]+)/
    ],
    assessmentAndPlan: [
      /评估和计划[：:]\s*([^\n\r]+)/,
      /assessment and plan[：:]\s*([^\n\r]+)/i,
      /评估计划[：:]\s*([^\n\r]+)/,
      /诊疗计划[：:]\s*([^\n\r]+)/,
      /治疗方案[：:]\s*([^\n\r]+)/,
      /treatment plan[：:]\s*([^\n\r]+)/i,
      /治疗计划[：:]\s*([^\n\r]+)/,
      /治疗[：:]\s*([^\n\r]+)/
    ],
    followUp: [
      /随访[：:]\s*([^\n\r]+)/,
      /follow up[：:]\s*([^\n\r]+)/i,
      /随访计划[：:]\s*([^\n\r]+)/,
      /复诊[：:]\s*([^\n\r]+)/
    ],
    // 检验报告字段
    testItem: [
      /检验项目[：:]\s*([^\n\r]+)/,
      /test[：:]\s*([^\n\r]+)/i,
      /检查项目[：:]\s*([^\n\r]+)/,
      /化验项目[：:]\s*([^\n\r]+)/
    ],
    result: [
      /结果[：:]\s*([^\n\r]+)/,
      /result[：:]\s*([^\n\r]+)/i,
      /检验结果[：:]\s*([^\n\r]+)/,
      /检查结果[：:]\s*([^\n\r]+)/
    ],
    normalRange: [
      /正常范围[：:]\s*([^\n\r]+)/,
      /normal[：:]\s*([^\n\r]+)/i,
      /参考值[：:]\s*([^\n\r]+)/,
      /正常值[：:]\s*([^\n\r]+)/
    ],
    // 检查报告字段
    checkType: [
      /检查类型[：:]\s*([^\n\r]+)/,
      /check type[：:]\s*([^\n\r]+)/i,
      /检查方式[：:]\s*([^\n\r]+)/,
      /检查方法[：:]\s*([^\n\r]+)/,
      /(MRI|CT|X线|超声|骨密度|睡眠监测|肺功能|电生理|核医学|内镜)[：:]\s*([^\n\r]+)/,
      /(MRI|CT|X线|超声|骨密度|睡眠监测|肺功能|电生理|核医学|内镜)/
    ],
    checkName: [
      /检查名称[：:]\s*([^\n\r]+)/,
      /check name[：:]\s*([^\n\r]+)/i,
      /检查项目[：:]\s*([^\n\r]+)/,
      /影像检查[：:]\s*([^\n\r]+)/
    ],
    checkDescription: [
      /检查描述[：:]\s*([^\n\r]+)/,
      /description[：:]\s*([^\n\r]+)/i,
      /检查说明[：:]\s*([^\n\r]+)/,
      /影像描述[：:]\s*([^\n\r]+)/
    ],
    checkResult: [
      /检查结果[：:]\s*([^\n\r]+)/,
      /result[：:]\s*([^\n\r]+)/i,
      /检查结论[：:]\s*([^\n\r]+)/,
      /影像结果[：:]\s*([^\n\r]+)/
    ],
    useContrast: [
      /造影剂[：:]\s*([是否])/,
      /contrast[：:]\s*([yn]|yes|no)/i,
      /增强[：:]\s*([是否])/
    ],
    // 住院记录专用字段
    inpatientDepartment: [
      /住院科室[：:]\s*([^\n\r]+)/,
      /inpatient department[：:]\s*([^\n\r]+)/i,
      /科室[：:]\s*([^\n\r]+)/,
      /住院部[：:]\s*([^\n\r]+)/
    ],
    attendingPhysician: [
      /主治医师[：:]\s*([^\n\r]+)/,
      /attending physician[：:]\s*([^\n\r]+)/i,
      /主治医生[：:]\s*([^\n\r]+)/,
      /主诊医师[：:]\s*([^\n\r]+)/
    ],
    inpatientChiefComplaint: [
      /住院主诉[：:]\s*([^\n\r]+)/,
      /inpatient chief complaint[：:]\s*([^\n\r]+)/i,
      /主诉[：:]\s*([^\n\r]+)/,
      /家庭成员主诉[：:]\s*([^\n\r]+)/
    ],
    inpatientPresentIllness: [
      /住院现病史[：:]\s*([^\n\r]+)/,
      /inpatient present illness[：:]\s*([^\n\r]+)/i,
      /现病史[：:]\s*([^\n\r]+)/,
      /病史[：:]\s*([^\n\r]+)/
    ],
    courseRecord: [
      /病程记录[：:]\s*([^\n\r]+)/,
      /course record[：:]\s*([^\n\r]+)/i,
      /病程[：:]\s*([^\n\r]+)/,
      /病情记录[：:]\s*([^\n\r]+)/
    ],
    consultationRecord: [
      /会诊记录[：:]\s*([^\n\r]+)/,
      /consultation record[：:]\s*([^\n\r]+)/i,
      /会诊[：:]\s*([^\n\r]+)/,
      /专家会诊[：:]\s*([^\n\r]+)/
    ],
    surgeryRecord: [
      /手术记录[：:]\s*([^\n\r]+)/,
      /surgery record[：:]\s*([^\n\r]+)/i,
      /手术[：:]\s*([^\n\r]+)/,
      /手术过程[：:]\s*([^\n\r]+)/
    ],
    labAndImaging: [
      /实验室和影像学检查[：:]\s*([^\n\r]+)/,
      /lab and imaging[：:]\s*([^\n\r]+)/i,
      /实验室检查[：:]\s*([^\n\r]+)/,
      /影像学检查[：:]\s*([^\n\r]+)/,
      /检查结果[：:]\s*([^\n\r]+)/
    ],
    dischargePlan: [
      /出院计划[：:]\s*([^\n\r]+)/,
      /discharge plan[：:]\s*([^\n\r]+)/i,
      /出院安排[：:]\s*([^\n\r]+)/,
      /出院准备[：:]\s*([^\n\r]+)/
    ],
    dischargeExamination: [
      /出院检查[：:]\s*([^\n\r]+)/,
      /discharge examination[：:]\s*([^\n\r]+)/i,
      /出院体检[：:]\s*([^\n\r]+)/,
      /出院评估[：:]\s*([^\n\r]+)/
    ],
    medicationGuidance: [
      /用药指导[：:]\s*([^\n\r]+)/,
      /medication guidance[：:]\s*([^\n\r]+)/i,
      /用药说明[：:]\s*([^\n\r]+)/,
      /药物指导[：:]\s*([^\n\r]+)/
    ],
    inpatientFollowUp: [
      /住院随访[：:]\s*([^\n\r]+)/,
      /inpatient follow up[：:]\s*([^\n\r]+)/i,
      /随访[：:]\s*([^\n\r]+)/,
      /随访计划[：:]\s*([^\n\r]+)/
    ]
  };

  // 首先提取医疗机构信息（所有文档类型通用）
  for (const [field, patterns] of Object.entries(medicalDataPatterns)) {
    if (field === 'medicalInstitution') {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1] && match[1].trim()) {
          extractedData.medicalData[field] = match[1].trim();
          extractedData.parseDetails.push(`成功提取${field}: ${match[1].trim()}`);
          break;
        }
      }
    }
  }

  // 根据文档类型提取相应的医疗数据
  if (extractedData.documentType === 'lab_result') {
    // 检验报告数据提取
    for (const [field, patterns] of Object.entries(medicalDataPatterns)) {
      if (['testItem', 'result', 'normalRange'].includes(field)) {
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1].trim()) {
            extractedData.medicalData[field] = match[1].trim();
            extractedData.parseDetails.push(`成功提取${field}: ${match[1].trim()}`);
            break;
          }
        }
      }
    }
  } else if (extractedData.documentType === 'diagnostic_report') {
    // 检查报告数据提取
    // 检查类型为骨密度时，提取为骨密度表格结构
    let isBoneDensity = false;
    for (const [field, patterns] of Object.entries(medicalDataPatterns)) {
      if (field === 'checkType') {
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1] && match[1].trim()) {
            const checkTypeValue = match[1].trim();
            if (checkTypeValue === '骨密度') {
              extractedData.medicalData.checkType = '骨密度';
              isBoneDensity = true;
              extractedData.parseDetails.push('成功提取checkType: 骨密度');
              break;
            } else {
              extractedData.medicalData.checkType = checkTypeValue;
              extractedData.parseDetails.push(`成功提取checkType: ${checkTypeValue}`);
              break;
            }
          }
        }
      }
    }
    if (isBoneDensity) {
      // 解析骨密度表格（分组、部位、骨密度、T值、Z值）
      // 这里假设每行格式如：分组:部位 骨密度:T值:Z值
      // 例如：脊椎 第一腰椎正位 0.98 -1.2 -0.8
      const boneDensityGroups = [
        { group: '脊椎', parts: ['第一腰椎正位', '第二腰椎正位', '第三腰椎正位', '第四腰椎正位', '第一腰椎至第四腰椎正位'] },
        { group: '左髋部', parts: ['股骨颈', '股骨转子', '股骨转子间区', '股骨 Ward 区', '整个左侧髋部'] },
        { group: '右髋部', parts: ['股骨颈', '股骨转子', '股骨转子间区', '股骨 Ward 区', '整个右侧髋部'] }
      ];
      const boneDensityTable = [];
      boneDensityGroups.forEach(g => {
        g.parts.forEach(part => {
          // 匹配如“脊椎 第一腰椎正位 骨密度 T值 Z值”
          const regex = new RegExp(`${g.group}\s*${part}\s*([\d\.]+)?\s*([\-\d\.]+)?\s*([\-\d\.]+)?`);
          const match = text.match(regex);
          boneDensityTable.push({
            group: g.group,
            part,
            density: match && match[1] ? match[1] : '',
            t: match && match[2] ? match[2] : '',
            z: match && match[3] ? match[3] : ''
          });
        });
      });
      extractedData.medicalData.boneDensityTable = boneDensityTable;
      extractedData.parseDetails.push('成功提取骨密度表格');
    } else {
      // 其他检查类型，保留原有字段
      for (const [field, patterns] of Object.entries(medicalDataPatterns)) {
        if (["checkName", "checkDescription", "checkResult", "useContrast"].includes(field)) {
          for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1] && match[1].trim()) {
              extractedData.medicalData[field] = match[1].trim();
              extractedData.parseDetails.push(`成功提取${field}: ${match[1].trim()}`);
              break;
            }
          }
        }
      }
    }
  } else if (extractedData.documentType === 'outpatient_record') {
    // 门诊记录数据提取
    for (const [field, patterns] of Object.entries(medicalDataPatterns)) {
      if (['department', 'doctorName', 'chiefComplaint', 'presentIllness', 'physicalExamination', 'assessmentAndPlan', 'followUp'].includes(field)) {
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1].trim()) {
            extractedData.medicalData[field] = match[1].trim();
            extractedData.parseDetails.push(`成功提取${field}: ${match[1].trim()}`);
            break;
          }
        }
      }
    }
  } else if (extractedData.documentType === 'inpatient_record') {
    // 住院记录数据提取
    for (const [field, patterns] of Object.entries(medicalDataPatterns)) {
      if (['inpatientDepartment', 'attendingPhysician', 'inpatientChiefComplaint', 'inpatientPresentIllness', 'courseRecord', 'consultationRecord', 'surgeryRecord', 'labAndImaging', 'dischargePlan', 'dischargeExamination', 'medicationGuidance', 'inpatientFollowUp'].includes(field)) {
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1].trim()) {
            extractedData.medicalData[field] = match[1].trim();
            extractedData.parseDetails.push(`成功提取${field}: ${match[1].trim()}`);
            break;
          }
        }
      }
    }
  } else {
    // 其他 - 通用医疗数据提取
    for (const [field, patterns] of Object.entries(medicalDataPatterns)) {
      if (['diagnosis', 'symptoms', 'treatment'].includes(field)) {
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1].trim()) {
            extractedData.medicalData[field] = match[1].trim();
            extractedData.parseDetails.push(`成功提取${field}: ${match[1].trim()}`);
            break;
          }
        }
      }
    }
  }

  // AI智能关键词提取 - 支持中英文疾病名称和症状
  const keywords = [];
  const commonKeywords = [
    // 中文疾病
    '高血压', '糖尿病', '心脏病', '肺炎', '感冒', '发烧', '头痛', '咳嗽',
    '哮喘', '胃炎', '肝炎', '肾炎', '关节炎', '抑郁症', '焦虑症', '贫血',
    '冠心病', '脑梗塞', '脑出血', '肺癌', '胃癌', '肝癌', '乳腺癌', '前列腺癌',
    '甲状腺疾病', '肾病', '肝病', '胃病', '肠炎', '胆囊炎', '胰腺炎',
    // 中文症状
    '头痛', '头晕', '恶心', '呕吐', '腹痛', '腹泻', '便秘', '咳嗽',
    '咳痰', '胸闷', '气短', '心悸', '失眠', '多梦', '乏力', '消瘦',
    '水肿', '黄疸', '皮疹', '瘙痒', '发热', '寒战', '盗汗', '关节痛',
    // 英文疾病
    'hypertension', 'diabetes', 'heart disease', 'pneumonia', 'cold', 'fever', 'headache', 'cough',
    'asthma', 'gastritis', 'hepatitis', 'nephritis', 'arthritis', 'depression', 'anxiety',
    'cancer', 'stroke', 'obesity', 'allergy', 'infection', 'inflammation', 'anemia',
    'coronary heart disease', 'myocardial infarction', 'cerebral infarction', 'cerebral hemorrhage',
    'lung cancer', 'gastric cancer', 'liver cancer', 'breast cancer', 'prostate cancer',
    'thyroid disease', 'kidney disease', 'liver disease', 'gastric disease', 'enteritis',
    // 英文症状
    'headache', 'dizziness', 'nausea', 'vomiting', 'abdominal pain', 'diarrhea', 'constipation',
    'chest pain', 'shortness of breath', 'palpitation', 'insomnia', 'fatigue', 'weight loss',
    'edema', 'jaundice', 'rash', 'itching', 'fever', 'chills', 'night sweats', 'joint pain'
  ];
  
  // 智能关键词匹配
  commonKeywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    const lowerText = text.toLowerCase();
    
    // 精确匹配
    if (lowerText.includes(lowerKeyword)) {
      keywords.push(keyword);
      extractedData.parseDetails.push(`识别到疾病关键词: ${keyword}`);
    }
    // 模糊匹配（处理同义词）
    else if (lowerKeyword.includes('disease') && lowerText.includes(lowerKeyword.replace('disease', ''))) {
      keywords.push(keyword);
      extractedData.parseDetails.push(`识别到疾病关键词: ${keyword}`);
    }
  });

  // 去重并排序
  extractedData.keywords = [...new Set(keywords)];
  
  // 更新解析置信度
  if (extractedData.keywords.length > 0) {
    extractedData.parseConfidence += Math.min(extractedData.keywords.length * 10, 30);
  }
  
  // 确保置信度不超过100%
  extractedData.parseConfidence = Math.min(extractedData.parseConfidence, 100);

  return extractedData;
};

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '医疗数据管理系统API服务器',
    version: '1.0.0',
    endpoints: {
      'POST /api/upload-pdf': '上传PDF文件',
      'POST /api/add-record': '手动添加医疗记录',
      'GET /api/records': '获取所有医疗记录',
      'PUT /api/records/:id': '更新医疗记录',
      'DELETE /api/records/:id': '删除医疗记录',
      'GET /api/records/disease/:disease': '根据疾病获取相关记录',
      'POST /api/generate-report': '生成疾病报告',
      'GET /api/patients': '获取患者列表',
      'POST /api/patients': '添加患者',
      'PUT /api/patients/:id': '更新患者信息',
      'DELETE /api/patients/:id': '删除患者'
    },
    status: 'running'
  });
});

// API路由

// 上传PDF文件
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    console.log(`开始AI智能解析文件: ${req.file.originalname}`);
    
    let textContent = '';
    
    // 根据文件类型选择不同的解析方法
    if (req.file.mimetype === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      textContent = pdfData.text;
      console.log('PDF文本提取完成，开始AI智能分析...');
    } else {
      // 处理文本文件
      textContent = fs.readFileSync(req.file.path, 'utf8');
      console.log('文本文件读取完成，开始AI智能分析...');
    }
    
    const extractedData = parsePDFContent(textContent);
    
    // 根据解析出的姓名自动匹配家庭成员
    let matchedPatient = null;
    if (extractedData.patientInfo && extractedData.patientInfo.name) {
      matchedPatient = patients.find(p => p.name === extractedData.patientInfo.name);
      
      if (matchedPatient) {
        console.log(`✅ 自动匹配到家庭成员: ${matchedPatient.name}`);
        // 使用匹配到的患者信息覆盖解析的信息
        extractedData.patientInfo = {
          id: matchedPatient.id,
          name: matchedPatient.name,
          birthDate: matchedPatient.birthDate,
          gender: matchedPatient.gender,
          phone: matchedPatient.phone,
          height: matchedPatient.height
        };
      } else {
        console.log(`⚠️ 未找到匹配的家庭成员: ${extractedData.patientInfo.name}`);
        // 如果没有匹配到，创建一个新的家庭成员
        const newPatient = {
          id: uuidv4(),
          name: extractedData.patientInfo.name,
          birthDate: extractedData.patientInfo.birthDate || '',
          gender: extractedData.patientInfo.gender || '',
          phone: extractedData.patientInfo.phone || '',
          height: extractedData.patientInfo.height || ''
        };
        
        patients.push(newPatient);
        saveData();
        
        extractedData.patientInfo = {
          id: newPatient.id,
          name: newPatient.name,
          birthDate: newPatient.birthDate,
          gender: newPatient.gender,
          phone: newPatient.phone,
          height: newPatient.height
        };
        
        console.log(`✅ 自动创建新家庭成员: ${newPatient.name}`);
      }
    } else {
      // 如果没有解析出姓名，检查是否有手动选择的患者ID
      const patientId = req.body.patientId;
      if (patientId) {
        matchedPatient = patients.find(p => p.id === patientId);
        if (matchedPatient) {
          extractedData.patientInfo = {
            id: matchedPatient.id,
            name: matchedPatient.name,
            birthDate: matchedPatient.birthDate,
            gender: matchedPatient.gender,
            phone: matchedPatient.phone,
            height: matchedPatient.height
          };
        }
      } else {
        return res.status(400).json({ 
          error: '无法识别家庭成员信息', 
          suggestion: '请确保PDF中包含姓名信息，或手动选择家庭成员'
        });
      }
    }
    
    extractedData.fileName = req.file.originalname;
    extractedData.filePath = req.file.path;
    extractedData.id = uuidv4();

    // 保存到医疗记录库
    medicalRecords.push(extractedData);
    saveData();

    // 删除临时文件
    fs.unlinkSync(req.file.path);

    // 生成详细的解析成功提示
    const successMessage = `AI智能解析成功！\n` +
      `📄 文档类型: ${getDocumentTypeText(extractedData.documentType)}\n` +
      `🎯 解析置信度: ${extractedData.parseConfidence.toFixed(1)}%\n` +
      `👤 家庭成员: ${extractedData.patientInfo.name}\n` +
      `🏷️ 识别关键词: ${extractedData.keywords.length}个\n` +
      `✅ 已自动保存到医疗记录库`;

    console.log('AI解析完成:', successMessage);

    res.json({
      success: true,
      data: extractedData,
      message: successMessage,
      parseSummary: {
        documentType: extractedData.documentType,
        confidence: extractedData.parseConfidence,
        extractedFields: extractedData.parseDetails.length,
        keywords: extractedData.keywords.length,
        patientMatched: !!matchedPatient,
        patientName: extractedData.patientInfo.name
      }
    });
  } catch (error) {
    console.error('AI解析错误:', error);
    res.status(500).json({ 
      error: 'AI智能解析失败', 
      details: error.message,
      suggestion: '请检查文件格式是否正确，或尝试其他文件'
    });
  }
});

// 辅助函数：获取文档类型文本
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

// 手动添加医疗记录
app.post('/api/add-record', (req, res) => {
  try {
    const record = {
      id: uuidv4(),
      documentType: req.body.documentType || 'manual',
      patientInfo: req.body.patientInfo || {},
      medicalData: req.body.medicalData || {},
      date: req.body.date || new Date().toISOString(), // 使用前端传递的日期，如果没有则使用当前时间
      keywords: req.body.keywords || [],
      isManual: true
    };

    medicalRecords.push(record);
    saveData();

    res.json({
      success: true,
      data: record,
      message: '医疗记录添加成功'
    });
  } catch (error) {
    res.status(500).json({ error: '添加记录失败', details: error.message });
  }
});

// 获取所有医疗记录
app.get('/api/records', (req, res) => {
  res.json({
    success: true,
    data: medicalRecords
  });
});

// 更新医疗记录
app.put('/api/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const recordIndex = medicalRecords.findIndex(r => r.id === id);
    if (recordIndex === -1) {
      return res.status(404).json({ error: '医疗记录不存在' });
    }

    // 保留原有的id和date，更新其他字段
    medicalRecords[recordIndex] = {
      ...medicalRecords[recordIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    saveData();

    res.json({
      success: true,
      data: medicalRecords[recordIndex],
      message: '医疗记录更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新医疗记录失败', details: error.message });
  }
});

// 删除医疗记录
app.delete('/api/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const recordIndex = medicalRecords.findIndex(r => r.id === id);
    if (recordIndex === -1) {
      return res.status(404).json({ error: '医疗记录不存在' });
    }

    const deletedRecord = medicalRecords.splice(recordIndex, 1)[0];
    saveData();

    res.json({
      success: true,
      data: deletedRecord,
      message: '医疗记录删除成功'
    });
  } catch (error) {
    res.status(500).json({ error: '删除医疗记录失败', details: error.message });
  }
});

// 根据疾病获取相关记录
app.get('/api/records/disease/:disease', (req, res) => {
  const disease = req.params.disease;
  const filteredRecords = medicalRecords.filter(record => 
    record.keywords.includes(disease) ||
    (record.medicalData.diagnosis && record.medicalData.diagnosis.includes(disease)) ||
    (record.medicalData.symptoms && record.medicalData.symptoms.includes(disease))
  );

  res.json({
    success: true,
    data: filteredRecords,
    disease: disease
  });
});

// 生成疾病报告
app.post('/api/generate-report', (req, res) => {
  try {
    const { disease, patientId, reportType, subItem } = req.body;
    
    // 筛选相关记录
    let relevantRecords = medicalRecords.filter(record => {
      // 基础疾病筛选
      const hasDisease = record.keywords.includes(disease) ||
        (record.medicalData.diagnosis && record.medicalData.diagnosis.includes(disease)) ||
        (record.medicalData.symptoms && record.medicalData.symptoms.includes(disease));
      
      // 如果指定了患者，进一步筛选
      if (patientId && hasDisease) {
        return record.patientId === patientId || record.patientInfo?.id === patientId;
      }
      
      return hasDisease;
    });

    // 如果指定了报告类型，进一步筛选
    if (reportType && reportType !== 'all') {
      relevantRecords = relevantRecords.filter(record => record.documentType === reportType);
    }

    // 如果指定了子项目，进一步筛选
    if (subItem && subItem !== 'all') {
      relevantRecords = relevantRecords.filter(record => {
        if (record.documentType === 'lab_result') {
          // 检验报告子项目筛选
          return record.medicalData.subItems && 
                 record.medicalData.subItems.some(item => 
                   item.subItemName.includes(subItem) || 
                   item.result.includes(subItem)
                 );
        } else if (record.documentType === 'diagnostic_report') {
          // 检查报告子项目筛选
          return (record.medicalData.checkName && record.medicalData.checkName.includes(subItem)) ||
                 (record.medicalData.checkDescription && record.medicalData.checkDescription.includes(subItem)) ||
                 (record.medicalData.checkResult && record.medicalData.checkResult.includes(subItem));
        } else if (record.documentType === 'outpatient_record') {
          // 门诊报告子项目筛选
          return (record.medicalData.chiefComplaint && record.medicalData.chiefComplaint.includes(subItem)) ||
                 (record.medicalData.diagnosis && record.medicalData.diagnosis.includes(subItem)) ||
                 (record.medicalData.treatment && record.medicalData.treatment.includes(subItem));
        } else if (record.documentType === 'inpatient_record') {
          // 住院报告子项目筛选
          return (record.medicalData.inpatientChiefComplaint && record.medicalData.inpatientChiefComplaint.includes(subItem)) ||
                 (record.medicalData.inpatientDiagnosis && record.medicalData.inpatientDiagnosis.includes(subItem)) ||
                 (record.medicalData.inpatientTreatment && record.medicalData.inpatientTreatment.includes(subItem));
        }
        return false;
      });
    }

    // 生成报告
    const report = {
      id: uuidv4(),
      disease: disease,
      patientId: patientId,
      reportType: reportType || 'all',
      subItem: subItem || 'all',
      generatedDate: new Date().toISOString(),
      summary: {
        totalRecords: relevantRecords.length,
        dateRange: {
          start: relevantRecords.length > 0 ? Math.min(...relevantRecords.map(r => new Date(r.date))) : null,
          end: relevantRecords.length > 0 ? Math.max(...relevantRecords.map(r => new Date(r.date))) : null
        },
        reportTypeBreakdown: getReportTypeBreakdown(relevantRecords),
        subItemBreakdown: getSubItemBreakdown(relevantRecords, reportType)
      },
      records: relevantRecords,
      analysis: {
        commonSymptoms: extractCommonSymptoms(relevantRecords),
        treatments: extractTreatments(relevantRecords),
        labResults: extractLabResults(relevantRecords),
        diagnosticResults: extractDiagnosticResults(relevantRecords),
        outpatientData: extractOutpatientData(relevantRecords),
        inpatientData: extractInpatientData(relevantRecords)
      }
    };

    res.json({
      success: true,
      data: report,
      message: '疾病报告生成成功'
    });
  } catch (error) {
    res.status(500).json({ error: '生成报告失败', details: error.message });
  }
});

// 获取报告类型选项
app.get('/api/report-types', (req, res) => {
  const reportTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'lab_result', label: '检验报告' },
    { value: 'diagnostic_report', label: '检查报告' },
    { value: 'outpatient_record', label: '门诊报告' },
    { value: 'inpatient_record', label: '住院报告' }
  ];
  
  res.json({
    success: true,
    data: reportTypes
  });
});

// 获取子项目选项
app.get('/api/sub-items/:reportType', (req, res) => {
  try {
    const { reportType } = req.params;
    const { disease } = req.query;
    
    let subItems = [{ value: 'all', label: '全部子项' }];
    
    if (reportType === 'lab_result') {
      // 获取检验报告的子项目
      const labRecords = medicalRecords.filter(record => 
        record.documentType === 'lab_result' &&
        (record.keywords.includes(disease) || !disease)
      );
      
      const uniqueSubItems = new Set();
      labRecords.forEach(record => {
        if (record.medicalData.subItems) {
          record.medicalData.subItems.forEach(item => {
            uniqueSubItems.add(item.subItemName);
          });
        }
      });
      
      subItems = subItems.concat(Array.from(uniqueSubItems).map(item => ({
        value: item,
        label: item
      })));
    } else if (reportType === 'diagnostic_report') {
      // 获取检查报告的子项目
      const diagnosticRecords = medicalRecords.filter(record => 
        record.documentType === 'diagnostic_report' &&
        (record.keywords.includes(disease) || !disease)
      );
      
      const uniqueCheckTypes = new Set();
      diagnosticRecords.forEach(record => {
        if (record.medicalData.checkType) {
          uniqueCheckTypes.add(record.medicalData.checkType);
        }
      });
      
      subItems = subItems.concat(Array.from(uniqueCheckTypes).map(item => ({
        value: item,
        label: item
      })));
    }
    
    res.json({
      success: true,
      data: subItems
    });
  } catch (error) {
    res.status(500).json({ error: '获取子项目失败', details: error.message });
  }
});

// 辅助函数
const getReportTypeBreakdown = (records) => {
  const breakdown = {};
  records.forEach(record => {
    const type = record.documentType;
    breakdown[type] = (breakdown[type] || 0) + 1;
  });
  return breakdown;
};

const getSubItemBreakdown = (records, reportType) => {
  const breakdown = {};
  
  if (reportType === 'lab_result') {
    records.forEach(record => {
      if (record.medicalData.subItems) {
        record.medicalData.subItems.forEach(item => {
          breakdown[item.subItemName] = (breakdown[item.subItemName] || 0) + 1;
        });
      }
    });
  } else if (reportType === 'diagnostic_report') {
    records.forEach(record => {
      if (record.medicalData.checkType) {
        breakdown[record.medicalData.checkType] = (breakdown[record.medicalData.checkType] || 0) + 1;
      }
    });
  }
  
  return breakdown;
};

const extractCommonSymptoms = (records) => {
  const symptoms = [];
  records.forEach(record => {
    if (record.medicalData.symptoms) {
      symptoms.push(record.medicalData.symptoms);
    }
  });
  return symptoms;
};

const extractTreatments = (records) => {
  const treatments = [];
  records.forEach(record => {
    if (record.medicalData.treatment) {
      treatments.push(record.medicalData.treatment);
    }
  });
  return treatments;
};

const extractLabResults = (records) => {
  return records.filter(record => record.documentType === 'lab_result');
};

const extractDiagnosticResults = (records) => {
  return records.filter(record => record.documentType === 'diagnostic_report');
};

const extractOutpatientData = (records) => {
  return records.filter(record => record.documentType === 'outpatient_record');
};

const extractInpatientData = (records) => {
  return records.filter(record => record.documentType === 'inpatient_record');
};

// 获取患者列表
app.get('/api/patients', (req, res) => {
  res.json({
    success: true,
    data: patients
  });
});

// 添加患者
app.post('/api/patients', (req, res) => {
  try {
    const patient = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };

    patients.push(patient);
    saveData();

    res.json({
      success: true,
      data: patient,
      message: '患者信息添加成功'
    });
  } catch (error) {
    res.status(500).json({ error: '添加患者失败', details: error.message });
  }
});

// 更新患者信息
app.put('/api/patients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const patientIndex = patients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
      return res.status(404).json({ error: '患者不存在' });
    }

    // 保留原有的id和createdAt，更新其他字段
    patients[patientIndex] = {
      ...patients[patientIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    saveData();

    res.json({
      success: true,
      data: patients[patientIndex],
      message: '患者信息更新成功'
    });
  } catch (error) {
    res.status(500).json({ error: '更新患者失败', details: error.message });
  }
});

// 删除患者
app.delete('/api/patients/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const patientIndex = patients.findIndex(p => p.id === id);
    if (patientIndex === -1) {
      return res.status(404).json({ error: '患者不存在' });
    }

    const deletedPatient = patients.splice(patientIndex, 1)[0];
    
    // 删除与该患者相关的所有医疗记录
    const initialRecordCount = medicalRecords.length;
    const filteredRecords = medicalRecords.filter(record => 
      record.patientId !== id && 
      record.patientInfo?.id !== id
    );
    const deletedRecordCount = initialRecordCount - filteredRecords.length;
    
    // 更新医疗记录数组
    medicalRecords.length = 0;
    medicalRecords.push(...filteredRecords);
    
    saveData();

    res.json({
      success: true,
      data: deletedPatient,
      message: `患者删除成功，同时删除了 ${deletedRecordCount} 条相关医疗记录`
    });
  } catch (error) {
    res.status(500).json({ error: '删除患者失败', details: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  initializeData();
  console.log(`医疗数据管理系统服务器运行在端口 ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`访问 http://localhost:${PORT} 查看前端界面`);
  }
}); 