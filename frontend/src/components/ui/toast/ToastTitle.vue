<script setup>
import { ToastTitle } from 'reka-ui';

const props = defineProps({
  asChild: { type: Boolean, default: false },
  as: { type: null, default: undefined },
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <ToastTitle :class="`text-sm font-semibold [&+div]:text-xs ${props.class}`">
    <slot />
  </ToastTitle>
</template>
