<template>
  <Card class="rounded-[18px] flex-shrink-0">
    <CardHeader class="p-4 pb-2">
      <CardTitle class="text-sm font-semibold">近7日入库</CardTitle>
    </CardHeader>
    <CardContent class="p-4 pt-0">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <!-- 无数据 -->
      <div v-else-if="!hasData" class="text-center py-8 text-muted-foreground text-sm">
        暂无统计数据
      </div>
      
      <!-- 图表 -->
      <div v-else>
        <!-- 柱状图容器 -->
        <div class="flex items-end gap-1.5 h-28 mb-2">
          <!-- 数据柱 -->
          <div 
            v-for="(item, index) in chartData" 
            :key="index"
            class="flex-1 flex flex-col items-center justify-end gap-1"
          >
            <!-- 数值标签 -->
            <span class="text-[10px] text-muted-foreground font-medium">{{ formatNumber(item.total) }}</span>
            
            <!-- 柱子 -->
            <div 
              class="w-full bg-primary rounded-sm"
              :style="{ height: `${getColumnHeight(item.total)}px` }"
            ></div>
          </div>
        </div>
        
        <!-- 日期标签 -->
        <div class="flex gap-1.5 mb-1">
          <div 
            v-for="(item, index) in chartData" 
            :key="index"
            class="flex-1 text-center text-xs text-muted-foreground"
          >
            {{ item.date }}
          </div>
        </div>
        
        <!-- 图例 -->
        <div class="flex items-center justify-center gap-2 pt-2 border-t">
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 rounded-full bg-primary"></div>
            <span class="text-xs text-muted-foreground">总入库 {{ formatNumber(totalCount) }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStatistics } from '@/api/media';

const props = defineProps({
  serverId: {
    type: [Number, String],
    required: true
  }
});

const loading = ref(false);
const statistics = ref([]);

const hasData = computed(() => statistics.value.length > 0);

// 近7日总入库数（所有增量的总和）
const totalCount = computed(() => {
  if (!chartData.value.length) return 0;
  return chartData.value.reduce((sum, item) => sum + item.total, 0);
});

const chartData = computed(() => {
  if (!statistics.value.length) return [];
  
  // 获取今天的日期
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 生成最近7天的日期数组（从今天往前推6天）
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      dateKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      movie: 0,
      series: 0,
      episode: 0,
      total: 0
    });
  }
  
  // 将统计数据按日期匹配到对应的天（按日期排序）
  const sortedStats = [...statistics.value].sort((a, b) => {
    return new Date(a.report_at) - new Date(b.report_at);
  });
  
  // 计算每日增量：当天总数 - 前一天总数
  let prevCounts = { movie: 0, series: 0, episode: 0 };
  
  sortedStats.forEach(item => {
    const date = new Date(item.report_at);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // 找到对应的日期
    const dayData = last7Days.find(day => day.dateKey === dateKey);
    if (dayData) {
      const currentCounts = {
        movie: item.counts?.movie || 0,
        series: item.counts?.series || 0,
        episode: item.counts?.episode || 0
      };
      
      // 计算增量（只计算电影和集数，不包括季数）
      dayData.movie = Math.max(currentCounts.movie - prevCounts.movie, 0);
      dayData.series = Math.max(currentCounts.series - prevCounts.series, 0);
      dayData.episode = Math.max(currentCounts.episode - prevCounts.episode, 0);
      dayData.total = dayData.movie + dayData.episode;
      
      // 更新前一天的数据
      prevCounts = currentCounts;
    }
  });
  
  return last7Days;
});

const maxTotal = computed(() => {
  if (!chartData.value.length) return 1;
  return Math.max(...chartData.value.map(item => item.total), 1);
});

const getColumnHeight = (total) => {
  if (!total) return 2;
  return Math.max((total / maxTotal.value) * 72, 2);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

const formatNumber = (num) => {
  if (!num || num === 0) return '0';
  if (num >= 1e4) return (num / 1e4).toFixed(1) + 'w';
  return num.toString();
};

const loadStatistics = async () => {
  if (!props.serverId) return;
  
  loading.value = true;
  try {
    // 计算最近7天的日期范围
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    
    // 格式化为 YYYY-MM-DD
    const formatDate = (date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    
    const params = {
      media_list_id: props.serverId,
      date_start: formatDate(sevenDaysAgo),
      date_end: formatDate(today)
    };
    
    const response = await getStatistics(params);
    statistics.value = response?.items || [];
  } catch (error) {
    console.error('加载统计数据失败:', error);
    statistics.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听 serverId 变化
watch(() => props.serverId, () => {
  loadStatistics();
}, { immediate: true });

// 暴露刷新方法
defineExpose({
  refresh: loadStatistics
});
</script>
