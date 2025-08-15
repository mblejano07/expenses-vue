<script setup lang="ts">
import { defineProps } from 'vue';

defineProps<{
  title: string;
}>();
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    <h3 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{{ title }}</h3>
    <slot></slot>
  </div>
</template>
