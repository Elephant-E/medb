import apiClient from './index';

// 媒体列表
export const getMediaList = (params) => 
  apiClient.get('/media/list/index', { params });

export const createOrUpdateMedia = (data) => 
  apiClient.post('/media/list/updateOrCreate', data);

export const deleteMedia = (id) => 
  apiClient.delete('/media/list/delete', { params: { id } });

export const toggleSubscribe = (id) => 
  apiClient.put('/media/list/subscribe', null, { params: { id } });

// 图标
export const getIconList = (params) => 
  apiClient.get('/media/icon/index', { params });

export const createIcon = (data) => 
  apiClient.post('/media/icon/create', data);

export const deleteIcon = (id) => 
  apiClient.delete('/media/icon/delete', { params: { id } });

export const getIconLibrary = () => 
  apiClient.get('/media/icon/library');

// 统计
export const getStatistics = (params) => 
  apiClient.get('/media/statistics/index', { params });

export const createStatistics = (data) => 
  apiClient.post('/media/statistics/create', data);

export const saveStatistics = (formData) => 
  apiClient.post('/media/statistics/save', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const deleteStatistics = (params) => 
  apiClient.delete('/media/statistics/delete', { params });

// 文件上传
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
