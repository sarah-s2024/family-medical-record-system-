import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

// 患者相关API
export const getPatients = async () => {
  const response = await api.get('/patients');
  return response.data;
};

export const createPatient = async (patientData) => {
  const response = await api.post('/patients', patientData);
  return response.data;
};

export const updatePatient = async (id, patientData) => {
  const response = await api.put(`/patients/${id}`, patientData);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await api.delete(`/patients/${id}`);
  return response.data;
};

// 医疗记录相关API
export const getMedicalRecords = async () => {
  const response = await api.get('/records');
  return response.data;
};

export const createMedicalRecord = async (recordData) => {
  const response = await api.post('/records', recordData);
  return response.data;
};

export const updateMedicalRecord = async (id, recordData) => {
  const response = await api.put(`/records/${id}`, recordData);
  return response.data;
};

export const deleteMedicalRecord = async (id) => {
  const response = await api.delete(`/records/${id}`);
  return response.data;
};

// 报告生成相关API
export const generateReport = async (reportData) => {
  const response = await api.post('/generate-report', reportData);
  return response.data;
};

export const generateCustomReport = async (patientId, keywords) => {
  const response = await api.post('/reports/generate-custom', { patientId, keywords });
  return response.data;
};

export const getReportTypes = async () => {
  const response = await api.get('/report-types');
  return response.data;
};

export const getSubItems = async (reportType, disease) => {
  const response = await api.get(`/sub-items/${reportType}`, {
    params: { disease }
  });
  return response.data;
};

export default api; 