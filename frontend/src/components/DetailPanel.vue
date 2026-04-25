<template>
  <div class="flex flex-col gap-3.5 min-h-full">
    <!-- 头部信息 -->
    <div class="flex items-center gap-3.5 pb-3 border-b flex-shrink-0 text-foreground">
      <div class="w-14 h-14 rounded-[18px] bg-secondary flex items-center justify-center text-2xl border-2 overflow-hidden">
        <img 
          v-if="shouldShowIcon" 
          :src="server.icon_url" 
          class="w-full h-full object-cover rounded-[16px]" 
          @error="handleIconError"
        />
        <span 
          v-else
          class="text-primary font-bold"
        >{{ getInitial(server.name) }}</span>
      </div>
      <div>
        <h3 class="text-xl font-bold text-foreground mb-1">{{ server.name }}</h3>
        <div class="flex items-center gap-1 text-xs text-muted-foreground">
          <span 
            class="w-3 h-3 rounded-full"
            :class="{
              'bg-success': server.status === 'online',
              'bg-destructive': server.status === 'offline',
              'bg-warning': server.status === 'maintain'
            }"
          ></span>
          <span>{{ getStatusText(server.status) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 信息卡片 -->
    <Card class="rounded-[18px]">
      <CardContent class="p-4">
        <div class="text-sm text-muted-foreground mb-2.5 font-semibold">信息</div>
        <div v-if="server.website" class="mb-2">
          <a :href="server.website" target="_blank" class="text-primary hover:underline text-sm break-all">{{ server.website }}</a>
        </div>
        <div v-else class="text-sm text-muted-foreground mb-2">未设置</div>
        <div class="text-sm text-muted-foreground leading-relaxed">
          {{ server.description || server.tagline || '暂无简介' }}
        </div>
      </CardContent>
    </Card>
    
    <!-- 统计卡片 -->
    <Card class="rounded-[18px]">
      <CardContent class="p-4">
        <div class="text-sm text-muted-foreground mb-2.5 font-semibold">统计</div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <span class="font-bold text-foreground text-base block">{{ formatNumber(server.counts?.movie) }}</span>
            <span class="text-xs text-muted-foreground">电影</span>
          </div>
          <div>
            <span class="font-bold text-foreground text-base block">{{ formatNumber(server.counts?.series) }}</span>
            <span class="text-xs text-muted-foreground">剧集</span>
          </div>
          <div>
            <span class="font-bold text-foreground text-base block">{{ formatNumber((server.counts?.movie || 0) + (server.counts?.episode || 0)) }}</span>
            <span class="text-xs text-muted-foreground">总量</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <!-- 统计图表 -->
    <StatisticsChart v-if="server.id" :server-id="server.id" ref="statsChartRef" />
    
    <!-- 操作按钮 -->
    <div class="pt-3 border-t flex flex-col gap-2.5 flex-shrink-0">
      <Button 
        v-if="isLoggedIn"
        variant="outline"
        @click="$emit('subscribe', server)"
        :disabled="subscribing"
        class="w-full rounded-[24px] font-medium"
      >
        <Loader2 v-if="subscribing" class="w-4 h-4 animate-spin" />
        <CheckCircle v-else-if="server.is_subscribe" class="w-4 h-4" />
        <Bell v-else class="w-4 h-4" />
        {{ subscribing ? '处理中...' : (server.is_subscribe ? '已订阅' : '订阅') }}
      </Button>
      
      <div v-if="isLoggedIn && server.is_can_edit" class="flex gap-2">
        <Button variant="outline" @click="$emit('edit', server)" class="flex-1" :disabled="deleting">
          <Pencil class="w-4 h-4" />
          编辑
        </Button>
        <Button variant="outline" @click="$emit('delete', server)" class="flex-1" :disabled="deleting">
          <Loader2 v-if="deleting" class="w-4 h-4 animate-spin" />
          <Trash2 v-else class="w-4 h-4" />
          {{ deleting ? '删除中...' : '删除' }}
        </Button>
      </div>
      
      <!-- 统计上报按钮 -->
      <Button 
        v-if="isLoggedIn && server.is_can_edit"
        variant="outline"
        @click="showStatsDialog = true"
        class="w-full rounded-[24px] font-medium"
      >
        <BarChart3 class="w-4 h-4" />
        上报统计
      </Button>
    </div>
    
    <!-- 页脚 - 固定在底部 -->
    <div class="mt-auto pt-3 text-center text-xs text-muted-foreground flex-shrink-0">
      Infrastructure by <a href="https://medb.lat" target="_blank" class="text-primary hover:underline">medb.lat</a>
    </div>
  </div>
  
  <!-- 统计上报模态框 -->
  <Dialog :open="showStatsDialog" @update:open="handleDialogOpen">
    <template #header>
      <DialogTitle class="text-lg font-semibold">上报统计数据</DialogTitle>
    </template>
    
    <div class="flex flex-col gap-4 py-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <Label>电影数量</Label>
          <Input 
            v-model.number="statsForm.movie" 
            type="number" 
            min="0"
            placeholder="0"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label>季数量</Label>
          <Input 
            v-model.number="statsForm.series" 
            type="number" 
            min="0"
            placeholder="0"
          />
        </div>
      </div>
      
      <div class="flex flex-col gap-2">
        <Label>剧集数量</Label>
        <Input 
          v-model.number="statsForm.episode" 
          type="number" 
          min="0"
          placeholder="0"
        />
      </div>
      
      <Card>
        <CardContent class="p-4">
          <div class="text-sm font-medium mb-2">当前数据</div>
          <div class="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div class="font-bold text-foreground">{{ formatNumber(server.counts?.movie) }}</div>
              <div class="text-xs text-muted-foreground">电影</div>
            </div>
            <div>
              <div class="font-bold text-foreground">{{ formatNumber(server.counts?.series) }}</div>
              <div class="text-xs text-muted-foreground">季</div>
            </div>
            <div>
              <div class="font-bold text-foreground">{{ formatNumber(server.counts?.episode) }}</div>
              <div class="text-xs text-muted-foreground">剧集</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <DialogFooter>
      <Button variant="outline" @click="showStatsDialog = false">
        取消
      </Button>
      <Button @click="handleSubmitStats" :disabled="submitting">
        <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
        {{ submitting ? '提交中...' : '提交' }}
      </Button>
    </DialogFooter>
  </Dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { CheckCircle, Bell, Pencil, Trash2, Loader2, BarChart3 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StatisticsChart from './StatisticsChart.vue';
import { createStatistics } from '@/api/media';
import toast from '@/utils/toast';

const statsChartRef = ref(null);
const showStatsDialog = ref(false);
const submitting = ref(false);
const iconLoadError = ref(false);

const statsForm = reactive({
  movie: 0,
  series: 0,
  episode: 0
});

const props = defineProps({
  server: {
    type: Object,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  subscribing: {
    type: Boolean,
    default: false
  },
  deleting: {
    type: Boolean,
    default: false
  }
});

defineEmits(['subscribe', 'edit', 'delete']);

const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e4) return (num / 1e4).toFixed(1) + 'w';
  return num.toLocaleString();
};

// 获取首字母
const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

// 处理图标加载失败
const handleIconError = () => {
  iconLoadError.value = true;
};

// 检查是否应该显示图标
const shouldShowIcon = computed(() => {
  return props.server?.icon_url && !iconLoadError.value;
});

const getStatusText = (status) => {
  const statusMap = {
    online: '在线',
    offline: '离线',
    maintain: '维护',
    unknown: '未知'
  };
  return statusMap[status] || '未知';
};

// 提交统计数据
const handleSubmitStats = async () => {
  // 验证输入
  if (statsForm.movie < 0 || statsForm.series < 0 || statsForm.episode < 0) {
    toast.error('数量不能为负数');
    return;
  }
  
  submitting.value = true;
  
  try {
    const result = await createStatistics({
      media_list_id: props.server.id,
      movie: statsForm.movie,
      series: statsForm.series,
      episode: statsForm.episode
    });
    
    if (result?.media_statistics_id) {
      toast.success('统计上报成功');
      showStatsDialog.value = false;
      
      // 刷新图表数据
      if (statsChartRef.value) {
        statsChartRef.value.refresh();
      }
      
      // 重置表单
      statsForm.movie = 0;
      statsForm.series = 0;
      statsForm.episode = 0;
    } else {
      toast.error('上报失败，请重试');
    }
  } catch (error) {
    console.error('提交统计失败:', error);
    toast.error('提交失败，请检查网络连接');
  } finally {
    submitting.value = false;
  }
};

// 处理模态框打开事件
const handleDialogOpen = (open) => {
  showStatsDialog.value = open;
  
  // 打开时填充当前数据
  if (open && props.server.counts) {
    statsForm.movie = props.server.counts.movie || 0;
    statsForm.series = props.server.counts.series || 0;
    statsForm.episode = props.server.counts.episode || 0;
  }
};
</script>
