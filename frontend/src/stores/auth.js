import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUserInfo } from '@/api/auth';

export const useAuthStore = defineStore('auth', () => {
  const userInfo = ref(null);
  const token = ref(localStorage.getItem('medb_token') || '');
  
  const isLoggedIn = computed(() => !!token.value);
  
  async function fetchUserInfo() {
    if (!token.value) return;
    
    try {
      const data = await getUserInfo();
      if (data.is_sign) {
        userInfo.value = data;
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      clearAuth();
    }
  }
  
  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem('medb_token', newToken);
  }
  
  function clearAuth() {
    userInfo.value = null;
    token.value = '';
    localStorage.removeItem('medb_token');
  }
  
  return { 
    userInfo, 
    token, 
    isLoggedIn, 
    fetchUserInfo, 
    setToken, 
    clearAuth 
  };
});
