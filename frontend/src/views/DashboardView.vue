<template>
  <div class="h-screen bg-background flex gap-4 p-4">
    <!-- 左侧面板 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 头部 -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 flex-shrink-0 overflow-hidden">
        <!-- 桌面端：所有内容在一行 -->
        <div class="hidden sm:flex sm:items-center sm:gap-3 flex-1">
          <span class="text-xl font-bold text-foreground tracking-wide flex-shrink-0">MEDB</span>
          
          <Input
            v-model="searchKeyword"
            placeholder="搜索服务器..."
            class="flex-1 min-w-[200px] rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 border-2 focus-visible:border-primary"
          />
          
          <!-- 主题切换 -->
          <ThemeToggle />
          
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- 未登录时显示登录按钮 -->
            <Button v-if="!isLoggedIn" @click="handleLogin" variant="outline">
              登录
            </Button>
            
            <!-- 登录后显示添加按钮 -->
            <Button v-else @click="openAddDialog" variant="default">
              <Plus class="w-4 h-4" />
              添加
            </Button>
            
            <!-- 用户信息 -->
            <div v-if="isLoggedIn && userInfo" class="flex items-center gap-2 px-3 py-1.5 rounded-full border">
              <Avatar class="h-7 w-7">
                <AvatarImage v-if="userInfo.avatar" :src="userInfo.avatar" />
                <AvatarFallback>{{ userInfo.username?.charAt(0) || 'U' }}</AvatarFallback>
              </Avatar>
              <span class="text-sm font-medium text-muted-foreground">{{ userInfo.username || '用户' }}</span>
              <button @click="handleLogout" class="text-xs text-muted-foreground bg-transparent border-none cursor-pointer px-1 hover:text-foreground transition-colors">退出</button>
            </div>
          </div>
        </div>
        
        <!-- 移动端：第一行 -->
        <div class="flex sm:hidden items-center justify-between gap-2">
          <span class="text-xl font-bold text-foreground tracking-wide flex-shrink-0">MEDB</span>
          
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- 主题切换 -->
            <ThemeToggle />
            
            <!-- 未登录时显示登录按钮（图标） -->
            <Button v-if="!isLoggedIn" @click="handleLogin" variant="outline" size="sm" class="w-8 h-8 p-0 rounded-full">
              <LogIn class="w-4 h-4" />
            </Button>
            
            <!-- 登录后显示添加按钮（图标） -->
            <Button v-else @click="openAddDialog" variant="default" size="sm" class="w-8 h-8 p-0 rounded-full">
              <Plus class="w-4 h-4" />
            </Button>
            
            <!-- 用户头像（点击显示退出） -->
            <div v-if="isLoggedIn && userInfo" class="relative user-menu-container">
              <button 
                @click="showUserMenu = !showUserMenu"
                class="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors flex items-center justify-center bg-secondary"
              >
                <!-- 使用 v-show 而不是 v-if，避免渲染问题 -->
                <img 
                  v-show="hasAvatar && !avatarLoadError"
                  :src="userInfo.avatar" 
                  class="w-full h-full object-cover"
                  @error="handleAvatarError"
                  @load="handleAvatarLoad"
                />
                <span 
                  v-show="!hasAvatar || avatarLoadError"
                  class="text-xs font-semibold text-primary"
                >{{ userInfo.username?.charAt(0) || 'U' }}</span>
              </button>
              
              <!-- 下拉菜单 -->
              <div 
                v-if="showUserMenu" 
                class="absolute right-0 top-10 bg-card border rounded-lg shadow-lg py-1 min-w-[100px] z-50"
              >
                <div 
                  @click="handleLogout; showUserMenu = false" 
                  class="w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors text-destructive cursor-pointer"
                >
                  退出登录
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 移动端：第二行搜索框 -->
        <Input
          v-model="searchKeyword"
          placeholder="搜索服务器..."
          class="w-full sm:hidden rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 border-2 focus-visible:border-primary text-sm"
        />
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-3 gap-2 mb-4 flex-shrink-0">
        <Card class="rounded-[18px]">
          <CardContent class="p-3 flex flex-col items-center gap-1">
            <Film class="text-primary w-6 h-6" />
            <div class="text-center">
              <div class="text-[10px] text-muted-foreground">电影</div>
              <div class="text-lg font-bold text-foreground">{{ formatNumber(totalStats.movie) }}</div>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-[18px]">
          <CardContent class="p-3 flex flex-col items-center gap-1">
            <Tv class="text-primary w-6 h-6" />
            <div class="text-center">
              <div class="text-[10px] text-muted-foreground">剧集</div>
              <div class="text-lg font-bold text-foreground">{{ formatNumber(totalStats.series) }}</div>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-[18px]">
          <CardContent class="p-3 flex flex-col items-center gap-1">
            <TrendingUp class="text-primary w-6 h-6" />
            <div class="text-center">
              <div class="text-[10px] text-muted-foreground">总量</div>
              <div class="text-lg font-bold text-foreground">{{ formatNumber(totalStats.all) }}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 服务器列表 -->
      <Card class="flex-1 overflow-hidden rounded-[18px] flex flex-col">
        <!-- 表头 - 固定在顶部 -->
        <div class="grid grid-cols-[2.5fr_1fr_1.2fr_1.3fr] px-3 py-3 pb-2 text-xs font-medium text-muted-foreground border-b bg-card flex-shrink-0">
          <div class="text-left">名称</div>
          <div class="text-center">类型</div>
          <div class="text-center">总数</div>
          <div class="text-center">更新时间</div>
        </div>
        
        <!-- 列表 - 可滚动 -->
        <div class="overflow-y-auto flex-1">
          <div 
            v-for="server in filteredServers" 
            :key="server.id"
            @click="handleServerClick(server)"
            class="grid grid-cols-[2.5fr_1fr_1.2fr_1.3fr] px-3 py-3.5 items-center cursor-pointer transition-colors border-b"
            :class="currentServer && currentServer.id === server.id ? 'bg-accent/50' : 'hover:bg-accent/30'"
          >
              <!-- 列1: 名称 -->
              <div class="text-left pr-2 flex items-center gap-2 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border overflow-hidden relative">
                  <img 
                    v-if="shouldShowIcon(server)"
                    :src="getIconUrl(server)" 
                    class="w-full h-full object-cover" 
                    @error="() => handleIconError(server.id)"
                  />
                  <span 
                    v-else
                    class="text-xs font-semibold text-muted-foreground absolute inset-0 flex items-center justify-center"
                  >{{ getInitial(server.name) }}</span>
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{{ server.name }}</div>
                </div>
              </div>
              
              <!-- 列2: 类型 -->
              <div class="text-center justify-self-center w-full flex items-center justify-center">
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-secondary border text-muted-foreground font-medium">
                  {{ server.type || 'emby' }}
                </span>
              </div>
              
              <!-- 列3: 总数 -->
              <div class="text-center justify-self-center w-full flex items-center justify-center">
                <span class="text-xs px-3 py-1 rounded-lg bg-secondary border text-muted-foreground font-semibold">
                  {{ formatNumber((server.counts?.movie || 0) + (server.counts?.episode || 0)) }}
                </span>
              </div>
              
              <!-- 列4: 更新时间 -->
              <div class="text-center justify-self-center w-full flex items-center justify-center">
                <span class="text-xs text-muted-foreground">
                  {{ formatUpdateTime(server.report_at) }}
                </span>
              </div>
          </div>
        </div>
      </Card>
    </div>
    
    <!-- 右侧详情面板 -->
    <div 
      v-if="currentServer && (!isMobile || showMobileDetail)" 
      class="w-[320px] bg-card rounded-[22px] p-4 border flex flex-col gap-3.5 overflow-y-auto flex-shrink-0"
      :class="isMobile ? 'fixed inset-0 z-50 w-full h-full rounded-none m-0' : ''"
    >
      <!-- 移动端返回按钮 -->
      <div v-if="isMobile" class="flex items-center justify-between mb-2 pb-3 border-b">
        <button @click="closeMobileDetail" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← 返回列表
        </button>
      </div>
      
      <DetailPanel 
        :server="currentServer"
        :is-logged-in="isLoggedIn"
        :subscribing="subscribingServerId === currentServer.id"
        :deleting="deletingServerId === currentServer.id"
        @subscribe="handleSubscribe"
        @edit="openEditDialog"
        @delete="handleDelete"
      />
    </div>
  </div>
  
  <!-- 添加/编辑对话框（仅桌面端使用） -->
  <ServerDialog 
    v-if="!isMobile"
    v-model="dialogVisible"
    :server="editingServer"
    @saved="handleSubmit"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Film, Tv, TrendingUp, LogIn } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useMediaStore } from '@/stores/media';
import DetailPanel from '@/components/DetailPanel.vue';
import ServerDialog from '@/components/ServerDialog.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { deleteMedia, toggleSubscribe } from '@/api/media';
import toast from '@/utils/toast';

const authStore = useAuthStore();
const mediaStore = useMediaStore();
const router = useRouter();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const userInfo = computed(() => authStore.userInfo);
const servers = computed(() => mediaStore.servers);
const filteredServers = computed(() => mediaStore.filteredServers);
const totalStats = computed(() => mediaStore.totalStats);
const currentServer = computed(() => mediaStore.currentServer);
const searchKeyword = computed({
  get: () => mediaStore.searchKeyword,
  set: (val) => mediaStore.setSearchKeyword(val)
});

// 检查是否有头像
const hasAvatar = computed(() => {
  return userInfo.value && userInfo.value.avatar && userInfo.value.avatar.trim() !== '';
});

// 头像加载状态
const avatarLoadError = ref(false);

// 预检测头像是否可访问
const checkAvatarAccessible = async (url) => {
  if (!url) return false;
  
  try {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    return true;
  } catch (error) {
    return false;
  }
};

// 监听用户信息变化，重置头像加载状态并检测
watch(userInfo, async (newUserInfo) => {
  avatarLoadError.value = false;
  
  if (newUserInfo?.avatar) {
    const isAccessible = await checkAvatarAccessible(newUserInfo.avatar);
    if (!isAccessible) {
      avatarLoadError.value = true;
    }
  }
}, { immediate: true });

const dialogVisible = ref(false);
const editingServer = ref(null);
const subscribingServerId = ref(null); // 订阅加载状态
const deletingServerId = ref(null); // 删除加载状态
const iconLoadErrors = ref(new Set()); // 跟踪加载失败的图标ID
const isMobile = ref(false); // 移动端状态
const showMobileDetail = ref(false); // 移动端是否显示详情面板
const showUserMenu = ref(false); // 移动端用户菜单
const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e4) return (num / 1e4).toFixed(1) + 'w';
  return num.toLocaleString();
};

const formatUpdateTime = (timestamp) => {
  if (!timestamp) return '-';
  
  // 如果是字符串,转换为时间戳
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  const timeMs = date.getTime();
  
  if (isNaN(timeMs)) return '-';
  
  const now = Date.now();
  const diff = now - timeMs;
  
  // 小于 1 分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小于 1 小时
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前';
  }
  
  // 小于 24 小时
  if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
  }
  
  // 小于 7 天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
  }
  
  // 超过 7 天，显示日期
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 处理图标加载失败
const handleIconError = (serverId) => {
  iconLoadErrors.value.add(serverId);
};

// 检查图标是否应该显示
const shouldShowIcon = (server) => {
  return getIconUrl(server) && !iconLoadErrors.value.has(server.id);
};

// 获取图标 URL（统一使用 icon_url）
const getIconUrl = (server) => {
  return server.icon_url || '';
};

// 获取首字母
const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

// 对话框操作（仅桌面端使用）
const openAddDialog = () => {
  if (isMobile.value) {
    // 移动端跳转到独立页面
    router.push('/server-form');
  } else {
    // 桌面端使用模态框
    editingServer.value = null;
    dialogVisible.value = true;
  }
};

const openEditDialog = (server) => {
  if (isMobile.value) {
    // 移动端跳转到独立页面，传递服务器数据
    sessionStorage.setItem('editing_server', JSON.stringify(server));
    router.push({ path: '/server-form', query: { id: server.id } });
  } else {
    // 桌面端使用模态框
    editingServer.value = server;
    dialogVisible.value = true;
  }
};

const handleSubmit = async (formData) => {
  try {
    dialogVisible.value = false;
    await mediaStore.fetchServers();
  } catch (error) {
    console.error('提交失败:', error);
  }
};

// 工具函数

const handleDelete = async (server) => {
  if (!confirm(`确定删除 "${server.name}"？`)) return;
  
  deletingServerId.value = server.id;
  
  try {
    // 获取当前选中项的索引
    const currentIndex = filteredServers.value.findIndex(s => s.id === server.id);
    
    await deleteMedia(server.id);
    await mediaStore.fetchServers();
    
    // 删除后选中下一个（如果没有下一个则选中上一个）
    const nextIndex = Math.min(currentIndex, filteredServers.value.length - 1);
    if (nextIndex >= 0 && filteredServers.value[nextIndex]) {
      mediaStore.setCurrentServer(filteredServers.value[nextIndex]);
    } else if (filteredServers.value.length === 0) {
      mediaStore.setCurrentServer(null);
    }
  } catch (error) {
    console.error('删除失败:', error);
    toast.error('删除失败，请重试');
  } finally {
    deletingServerId.value = null;
  }
};

const handleSubscribe = async (server) => {
  subscribingServerId.value = server.id;
  try {
    const response = await toggleSubscribe(server.id);
    // 使用 API 返回的 is_subscribe 更新当前服务器状态
    if (mediaStore.currentServer?.id === server.id) {
      mediaStore.currentServer.is_subscribe = response.is_subscribe;
    }
    // 更新服务器列表中的状态
    const serverInList = mediaStore.servers.find(s => s.id === server.id);
    if (serverInList) {
      serverInList.is_subscribe = response.is_subscribe;
    }
    toast.success(response.is_subscribe ? '已订阅' : '已取消订阅');
  } catch (error) {
    console.error('订阅失败:', error);
    toast.error('操作失败，请重试');
  } finally {
    subscribingServerId.value = null;
  }
};

const handleLogout = () => {
  authStore.clearAuth();
  window.location.href = '/';
};

const handleLogin = () => {
  // 跳转到 medb.lat 进行认证
  const callbackUrl = window.location.origin + '/';
  const loginUrl = new URL('/sign', 'https://medb.lat');
  loginUrl.searchParams.set('url', callbackUrl);
  window.location.href = loginUrl.toString();
};

// 检测是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    showMobileDetail.value = false;
    showUserMenu.value = false;
  }
};

// 关闭用户菜单
const closeUserMenu = () => {
  showUserMenu.value = false;
};

// 处理头像加载失败
const handleAvatarError = () => {
  avatarLoadError.value = true;
};

// 处理头像加载成功
const handleAvatarLoad = () => {
  // 头像加载成功，无需处理
};

// 处理列表行点击
const handleServerClick = (server) => {
  mediaStore.setCurrentServer(server);
  if (isMobile.value) {
    showMobileDetail.value = true;
  }
};

// 关闭移动端详情面板
const closeMobileDetail = () => {
  showMobileDetail.value = false;
};

// 初始化
onMounted(async () => {
  // 检测移动端
  checkMobile();
  window.addEventListener('resize', checkMobile);
  
  // 点击外部关闭用户菜单
  document.addEventListener('click', (e) => {
    const userMenu = e.target.closest('.user-menu-container');
    if (!userMenu && showUserMenu.value) {
      closeUserMenu();
    }
  });
  
  // 检查 URL 中是否有 token (登录回调)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    authStore.setToken(token);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  await authStore.fetchUserInfo();
  await mediaStore.fetchServers();
  await mediaStore.fetchIconLibrary();
  
  // 默认选中第一个
  if (servers.value.length > 0 && !currentServer.value) {
    mediaStore.setCurrentServer(servers.value[0]);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>
