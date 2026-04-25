<template>
  <router-view />
  <Toaster />
</template>

<script setup>
import Toaster from '@/components/ui/toast/Toaster.vue';
// 根组件
</script>

<style scoped>
#app {
  height: 100vh;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}
</style>
