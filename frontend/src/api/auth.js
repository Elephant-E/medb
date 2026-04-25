import apiClient from './index';

export const getLoginUrl = (url) => 
  apiClient.get('/sign', { params: { url } });

export const getUserInfo = () => 
  apiClient.get('/sign/info');

export const logout = () => {
  localStorage.removeItem('medb_token');
  window.location.href = '/';
};
