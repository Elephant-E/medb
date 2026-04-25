<template>
  <div class="min-h-screen bg-background p-4">
    <!-- 顶部导航栏 -->
    <div class="flex items-center justify-between mb-6 pb-4 border-b">
      <button @click="handleBack" class="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
        <ArrowLeft class="w-4 h-4" />
        返回
      </button>
      <h1 class="text-lg font-bold text-foreground">{{ isEdit ? '编辑服务器' : '添加服务器' }}</h1>
      <div class="w-16"></div> <!-- 占位保持标题居中 -->
    </div>
    
    <!-- 表单内容区域 -->
    <div class="max-w-2xl mx-auto flex flex-col gap-4 pb-20">
      <!-- 图标预览区域（点击打开选择器） -->
      <div 
        @click="openIconSelector"
        class="w-full h-40 rounded-lg border-2 border-dashed cursor-pointer flex items-center justify-center overflow-hidden relative transition-colors"
        :class="form.icon_url ? 'border-primary bg-secondary/50' : 'border-muted-foreground/30 hover:border-primary/50'"
      >
        <!-- 有图标时显示预览 -->
        <img 
          v-if="form.icon_url" 
          :src="form.icon_url" 
          class="w-full h-full object-contain p-2"
        />
        
        <!-- 无图标时显示提示 -->
        <div v-else class="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon class="w-8 h-8" />
          <span class="text-sm">点击选择图标</span>
        </div>
        
        <!-- 编辑时的移除按钮 -->
        <button
          v-if="form.icon_path && isEdit"
          class="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90"
          @click.stop="removeIcon"
        >
          <Trash2 class="w-3 h-3" />
        </button>
      </div>
      
      <!-- 名称 -->
      <div class="flex flex-col gap-2">
        <Label>名称 <span class="text-muted-foreground text-xs">(英文名)</span></Label>
        <Input 
          v-model="form.name" 
          placeholder="示例：ZhangSan Server"
          maxlength="50"
        />
      </div>
      
      <!-- 标题 -->
      <div class="flex flex-col gap-2">
        <Label>标题 <span class="text-muted-foreground text-xs">(中文名)</span></Label>
        <Input 
          v-model="form.title" 
          placeholder="示例：张三的服"
          maxlength="100"
        />
      </div>
      
      <!-- 类型 -->
      <div class="flex flex-col gap-2">
        <Label>类型</Label>
        <select 
          v-model="form.type"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="emby">Emby</option>
          <option value="jellyfin">Jellyfin</option>
          <option value="plex">Plex</option>
          <option value="other">其他</option>
        </select>
      </div>
      
      <!-- 状态 -->
      <div class="flex flex-col gap-2">
        <Label>状态</Label>
        <select 
          v-model="form.status"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="online">在线</option>
          <option value="offline">离线</option>
          <option value="maintain">维护</option>
          <option value="unknown">未知</option>
        </select>
      </div>
      
      <!-- 成立时间 -->
      <div class="flex flex-col gap-2">
        <Label>成立时间</Label>
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              class="w-full justify-start text-left font-normal rounded-md"
              :class="!form.establish_date && 'text-muted-foreground'"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              {{ form.establish_date || '选择日期' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar 
              v-model="form.establish_date" 
              mode="single"
              :from-date="new Date(1900, 0, 1)"
              :to-date="new Date()"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <!-- 官网 -->
      <div class="flex flex-col gap-2">
        <Label>官网</Label>
        <Input 
          v-model="form.website" 
          type="url"
          placeholder="https://..."
        />
      </div>
      
      <!-- 宣传词 -->
      <div class="flex flex-col gap-2">
        <Label>宣传词</Label>
        <Input 
          v-model="form.tagline" 
          placeholder="示例：公益服，欢迎加入！"
          maxlength="200"
        />
      </div>
      
      <!-- 简介 -->
      <div class="flex flex-col gap-2">
        <Label>简介</Label>
        <Textarea
          v-model="form.description"
          placeholder="示例：公益服，欢迎加入！"
          maxlength="500"
          rows="4"
          class="resize-vertical"
        />
      </div>
    </div>
    
    <!-- 固定在底部的按钮 -->
    <div class="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:static md:border-t-0 md:p-0 md:mt-6 md:pt-4">
      <div class="max-w-2xl mx-auto flex gap-3">
        <Button variant="outline" @click="handleBack" class="flex-1">
          取消
        </Button>
        <Button @click="handleSave" :disabled="saving" class="flex-1">
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <span v-else>{{ isEdit ? '保存' : '添加' }}</span>
        </Button>
      </div>
    </div>
  </div>
  
  <!-- 图标选择器模态框 -->
  <Dialog :open="showIconSelector" @update:open="showIconSelector = $event">
    <template #header>
      <DialogTitle>选择图标</DialogTitle>
    </template>
    
    <!-- 图标库 -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <Label>图标库</Label>
        <Button 
          v-if="iconLibrary.length > 0"
          variant="ghost" 
          size="sm"
          @click="loadIconLibrary"
        >
          <RefreshCw class="w-3 h-3 mr-1" />
          刷新
        </Button>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loadingIcons" class="flex items-center justify-center py-8">
        <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="iconLibrary.length === 0" class="text-center py-8 text-muted-foreground text-sm">
        暂无图标，请点击底部"上传"按钮
      </div>
      
      <!-- 图标网格 -->
      <div v-else class="grid grid-cols-4 gap-2 max-h-[320px] overflow-y-auto pb-16">
        <div 
          v-for="icon in iconLibrary" 
          :key="icon.id"
          class="aspect-square rounded-lg bg-secondary border-2 cursor-pointer flex items-center justify-center overflow-hidden relative group"
          :class="form.icon_path === icon.path ? 'border-primary' : 'border-transparent hover:border-primary/50'"
          @click="selectIcon(icon)"
        >
          <img :src="icon.url" class="w-full h-full object-cover" />
          
          <!-- 删除按钮 -->
          <button
            class="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            @click.stop="handleDeleteIcon(icon)"
            :disabled="deletingIconId === icon.id"
          >
            <Trash2 v-if="deletingIconId !== icon.id" class="w-3 h-3" />
            <Loader2 v-else class="w-3 h-3 animate-spin" />
          </button>
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <Button @click="triggerUploadFromSelector">
        <Upload class="w-4 h-4" />
        上传
      </Button>
    </DialogFooter>
  </Dialog>
  
  <!-- 隐藏的文件输入框 -->
  <input 
    ref="fileInputRef"
    type="file" 
    accept="image/*"
    class="hidden"
    @change="handleFileUpload"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, ImageIcon, Upload, Trash2, RefreshCw, Loader2, Calendar as CalendarIcon } from 'lucide-vue-next';
import { Dialog, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createOrUpdateMedia, getIconLibrary, uploadFile, createIcon, deleteIcon } from '@/api/media';
import toast from '@/utils/toast';

const router = useRouter();
const route = useRoute();

// 从路由参数获取服务器ID
const serverId = computed(() => route.query.id ? parseInt(route.query.id) : null);
const isEdit = computed(() => !!serverId.value);

// 表单数据
const form = ref({
  name: '',
  title: '',
  type: 'emby',
  status: 'online',
  icon_path: '',
  icon_url: '', // 用于显示
  website: '',
  tagline: '',
  description: '',
  establish_date: '',
});

const saving = ref(false);
const showIconSelector = ref(false); // 图标选择器模态框
const fileInputRef = ref(null); // 文件输入引用
const uploading = ref(false); // 上传状态
const iconLibrary = ref([]); // 图标库
const loadingIcons = ref(false); // 加载图标库状态
const deletingIconId = ref(null); // 正在删除的图标ID

// 初始化表单数据
onMounted(async () => {
  if (isEdit.value) {
    await loadServerData();
  }
});

// 加载服务器数据
async function loadServerData() {
  try {
    // 从 sessionStorage 中获取编辑的服务器数据
    const serverData = sessionStorage.getItem('editing_server');
    if (serverData) {
      const server = JSON.parse(serverData);
      form.value = {
        name: server.name || '',
        title: server.title || '',
        type: server.type || 'emby',
        status: server.status || 'online',
        icon_path: server.icon_path || '',
        icon_url: server.icon_url || '',
        website: server.website || '',
        tagline: server.tagline || '',
        description: server.description || '',
        establish_date: server.establish_date || '',
      };
    }
  } catch (error) {
    console.error('加载服务器数据失败:', error);
    toast.error('加载数据失败');
  }
}

// 移除图标
function removeIcon() {
  form.value.icon_path = '';
  form.value.icon_url = '';
}

// 打开图标选择器
async function openIconSelector() {
  showIconSelector.value = true;
  // 加载图标库
  if (iconLibrary.value.length === 0) {
    await loadIconLibrary();
  }
}

// 选择图标
function selectIcon(icon) {
  // 图标库只返回 url，需要从 url 中提取 path
  const url = icon.url;
  let path = '';
  
  // 从 URL 中提取 path（去掉域名和 /storage/ 前缀）
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname; // /storage/storage/emby.png
    // 去掉开头的 /storage/
    path = pathname.replace(/^\/storage\//, '');
  } catch (e) {
    // 如果解析失败，尝试直接处理字符串
    path = url.replace(/^https?:\/\/[^/]+\/storage\//, '');
  }
  
  form.value.icon_path = path;
  form.value.icon_url = url;
  showIconSelector.value = false;
}

// 从选择器触发上传
function triggerUploadFromSelector() {
  // 关闭选择器
  showIconSelector.value = false;
  // 触发文件选择
  setTimeout(() => {
    fileInputRef.value?.click();
  }, 100);
}

// 加载图标库
async function loadIconLibrary() {
  loadingIcons.value = true;
  try {
    const res = await getIconLibrary();
    iconLibrary.value = res.icons || [];
  } catch (error) {
    console.error('加载图标库失败:', error);
    toast.error('加载图标库失败');
  } finally {
    loadingIcons.value = false;
  }
}

// 删除图标
async function handleDeleteIcon(icon) {
  if (!confirm(`确定要删除图标 "${icon.name}" 吗？`)) {
    return;
  }
  
  deletingIconId.value = icon.id;
  
  try {
    const result = await deleteIcon(icon.id);
    if (result?.is_delete) {
      toast.success('图标删除成功');
      // 从列表中移除
      iconLibrary.value = iconLibrary.value.filter(i => i.id !== icon.id);
      
      // 如果删除的是当前使用的图标，清空
      if (form.value.icon_path === icon.path) {
        form.value.icon_path = '';
        form.value.icon_url = '';
      }
    } else {
      throw new Error('删除失败');
    }
  } catch (error) {
    console.error('删除图标失败:', error);
    toast.error('删除失败，请重试');
  } finally {
    deletingIconId.value = null;
  }
}

// 处理文件上传
async function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (file) {
    await processUpload(file);
  }
}

// 处理上传逻辑
async function processUpload(file) {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    toast.error('请选择图片文件');
    return;
  }
  
  // 验证文件大小（2MB）
  if (file.size > 2 * 1024 * 1024) {
    toast.error('文件大小不能超过 2MB');
    return;
  }
  
  uploading.value = true;
  
  try {
    // 上传文件
    const uploadResult = await uploadFile(file);
    if (!uploadResult?.path) {
      throw new Error('文件上传失败');
    }
    
    // 创建图标记录
    const iconResult = await createIcon({
      name: file.name,
      path: uploadResult.path
    });
    
    if (iconResult?.id) {
      toast.success('图标上传成功');
      
      // 使用 uploadResult 的 path（相对路径）
      form.value.icon_path = uploadResult.path;
      // 拼接完整 URL 用于显示（使用 API_BASE）
      const apiBase = import.meta.env.VITE_API_BASE || '/api';
      form.value.icon_url = `${apiBase === '/api' ? '' : apiBase}/${uploadResult.path}`;
      
      // 刷新图标库
      await loadIconLibrary();
      
      // 清空文件输入
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
    }
  } catch (error) {
    console.error('上传失败:', error);
    toast.error(error.message || '上传失败，请重试');
  } finally {
    uploading.value = false;
  }
}

// 保存
async function handleSave() {
  // 验证必填字段
  if (!form.value.name || !form.value.name.trim()) {
    toast.error('请输入服务器名称');
    return;
  }
  
  // 验证图标必填
  if (!form.value.icon_path || !form.value.icon_path.trim()) {
    toast.error('请上传或选择图标');
    return;
  }
  
  // 验证 URL 格式（如果填写了）
  if (form.value.website && form.value.website.trim()) {
    if (!isValidUrl(form.value.website)) {
      toast.error('官网地址格式不正确，请以 http:// 或 https:// 开头');
      return;
    }
  }

  saving.value = true;
  try {
    const payload = {
      // 编辑时添加 id
      ...(isEdit.value && serverId.value ? { id: serverId.value } : {}),
      // 必填字段
      type: form.value.type,
      name: form.value.name.trim(),
      status: form.value.status,
      icon_path: form.value.icon_path.trim(), // 必填，相对路径
      // 可选字段
      title: form.value.title?.trim() || null,
      website: form.value.website?.trim() || null,
      tagline: form.value.tagline?.trim() || null,
      description: form.value.description?.trim() || null,
      establish_date: form.value.establish_date || null,
      tags: [],
    };
    
    await createOrUpdateMedia(payload);
    toast.success(isEdit.value ? '更新成功' : '添加成功');
    
    // 清除 sessionStorage
    sessionStorage.removeItem('editing_server');
    
    // 返回上一页
    handleBack();
  } catch (error) {
    console.error('保存失败:', error);
    console.error('错误响应:', error.response);
    console.error('错误数据:', error.response?.data);
    
    // 优先显示后端返回的错误信息
    const errorMessage = error.response?.data?.error 
      || error.response?.data?.message 
      || error.message 
      || '操作失败';
    
    toast.error(errorMessage);
  } finally {
    saving.value = false;
  }
}

// URL 格式验证（用于官网地址）
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// 返回
function handleBack() {
  // 清除 sessionStorage
  sessionStorage.removeItem('editing_server');
  router.back();
}
</script>
