<script setup>
import { ToastViewport } from 'reka-ui';

const props = defineProps({
  hotkey: { type: Array, default: () => [] },
  label: { type: [String, Function], default: 'Notifications' },
  asChild: { type: Boolean, default: false },
  as: { type: null, default: undefined },
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <ToastViewport :class="`fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-0 sm:right-0 sm:flex-col md:max-w-[420px] ${props.class}`" v-bind="props" />
</template>
