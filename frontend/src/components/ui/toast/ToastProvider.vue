<script setup>
import { ToastProvider } from 'reka-ui';

const props = defineProps({
  label: { type: String, default: 'Notification' },
  duration: { type: Number, default: 5000 },
  swipeDirection: { type: String, default: 'right' },
});
</script>

<template>
  <ToastProvider v-bind="props">
    <slot />
  </ToastProvider>
</template>
