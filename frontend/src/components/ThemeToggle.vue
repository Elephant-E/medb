<script setup>
import { computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import { Button } from '@/components/ui/button'

const { theme, setTheme, toggleTheme } = useTheme()

const themeIcon = computed(() => {
  switch (theme.value) {
    case 'light':
      return Sun
    case 'dark':
      return Moon
    case 'auto':
    default:
      return Monitor
  }
})

const themeText = computed(() => {
  switch (theme.value) {
    case 'light': return '浅色'
    case 'dark': return '深色'
    case 'auto': return '自动'
    default: return '自动'
  }
})
</script>

<template>
  <Button 
    variant="outline" 
    size="icon" 
    class="rounded-full" 
    @click="toggleTheme"
    :title="`当前: ${themeText}，点击切换`"
  >
    <component :is="themeIcon" class="h-[1.2rem] w-[1.2rem]" />
    <span class="sr-only">切换主题</span>
  </Button>
</template>
