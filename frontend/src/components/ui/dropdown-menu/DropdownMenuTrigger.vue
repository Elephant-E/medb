<script setup lang="ts">
import { DropdownMenuTrigger, type DropdownMenuTriggerProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<DropdownMenuTriggerProps & {
  class?: string
}>(), {
  class: ''
})
</script>

<template>
  <DropdownMenuTrigger v-bind="{ ...props, ...$attrs }" :class="cn('', props.class)">
    <slot />
  </DropdownMenuTrigger>
</template>
