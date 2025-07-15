import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// PDF上传
export const uploadPDF = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/upload-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// 手动添加医疗记录
export const addMedicalRecord = async (recordData) => {
  const response = await api.post('/add-record', recordData);
  return response.data;
};

// 获取所有医疗记录
export const getMedicalRecords = async () => {
  const response = await api.get('/records');
  return response.data;
};

// 更新医疗记录
export const updateMedicalRecord = async (id, recordData) => {
  const response = await api.put(`/records/${id}`, recordData);
  return response.data;
};

// 删除医疗记录
export const deleteMedicalRecord = async (id) => {
  const response = await api.delete(`/records/${id}`);
  return response.data;
};

// 根据疾病获取记录
export const getRecordsByDisease = async (disease) => {
  const response = await api.get(`/records/disease/${disease}`);
  return response.data;
};

// 生成疾病报告
export const generateDiseaseReport = async (disease, patientId, reportType, subItem) => {
  const response = await api.post('/generate-report', { disease, patientId, reportType, subItem });
  return response.data;
};

// 获取报告类型选项
export const getReportTypes = async () => {
  const response = await api.get('/report-types');
  return response.data;
};

// 获取子项目选项
export const getSubItems = async (reportType, disease) => {
  const params = disease ? `?disease=${encodeURIComponent(disease)}` : '';
  const response = await api.get(`/sub-items/${reportType}${params}`);
  return response.data;
};

// 获取家庭成员列表
export const getPatients = async () => {
  const response = await api.get('/patients');
  return response.data;
};

// 添加患者
export const addPatient = async (patientData) => {
  const response = await api.post('/patients', patientData);
  return response.data;
};

// 更新患者信息
export const updatePatient = async (id, patientData) => {
  const response = await api.put(`/patients/${id}`, patientData);
  return response.data;
};

// 删除患者
export const deletePatient = async (id) => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};

export default api; 