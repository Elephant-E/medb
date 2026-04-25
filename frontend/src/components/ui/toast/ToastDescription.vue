<script setup>
import { ToastDescription } from 'reka-ui';

const props = defineProps({
  asChild: { type: Boolean, default: false },
  as: { type: null, default: undefined },
  class: { type: [String, Object, Array], default: '' },
});
</script>

<template>
  <ToastDescription :class="`text-sm opacity-90 ${props.class}`">
    <slot />
  </ToastDescription>
</template>
