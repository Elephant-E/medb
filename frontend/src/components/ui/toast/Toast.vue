<script setup>
import { computed } from 'vue';
import { ToastRoot, useForwardPropsEmits } from 'reka-ui';
import { toastVariants } from './utils';

const props = defineProps({
  class: { type: [String, Object, Array], default: '' },
  variant: { type: String, default: 'default' },
  onOpenChange: { type: Function, skipCheck: true, default: undefined },
});

const emits = defineEmits(['update:open']);

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ToastRoot
    v-bind="forwarded"
    :class="toastVariants({ variant, class: props.class })"
    @update:open="onOpenChange"
  >
    <slot />
  </ToastRoot>
</template>
