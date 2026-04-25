import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getMediaList, getIconLibrary } from '@/api/media';

export const useMediaStore = defineStore('media', () => {
  const servers = ref([]);
  const iconLibrary = ref([]);
  const currentServer = ref(null);
  const searchKeyword = ref('');
  
  const filteredServers = computed(() => {
    if (!searchKeyword.value) return servers.value;
    return servers.value.filter(s => 
      s.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  });
  
  const totalStats = computed(() => {
    let movie = 0, series = 0, episode = 0, all = 0;
    servers.value.forEach(s => {
      if (s.counts) {
        movie += s.counts.movie || 0;
        series += s.counts.series || 0;
        episode += s.counts.episode || 0;
        all += (s.counts.movie || 0) + (s.counts.episode || 0);
      }
    });
    return { movie, series, episode, all };
  });
  
  async function fetchServers(params = {}) {
    try {
      const data = await getMediaList(params);
      if (data?.items) {
        servers.value = data.items;
      }
    } catch (error) {
      console.error('获取服务器列表失败:', error);
    }
  }
  
  async function fetchIconLibrary() {
    try {
      const data = await getIconLibrary();
      if (data?.icons) {
        iconLibrary.value = data.icons;
      }
    } catch (error) {
      console.error('获取图标库失败:', error);
    }
  }
  
  function setCurrentServer(server) {
    currentServer.value = server;
  }
  
  function setSearchKeyword(keyword) {
    searchKeyword.value = keyword;
  }
  
  return {
    servers, 
    iconLibrary, 
    currentServer, 
    searchKeyword,
    filteredServers, 
    totalStats,
    fetchServers, 
    fetchIconLibrary, 
    setCurrentServer, 
    setSearchKeyword
  };
});
