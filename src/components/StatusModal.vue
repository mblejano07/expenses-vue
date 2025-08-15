<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  title: string;
  message: string;
  isSuccess: boolean;
}>();

const emit = defineEmits(['close']);

// The main container for the modal, handling visibility and positioning
const modalWrapperClasses = computed(() => [
  'fixed',
  'inset-0',
  'z-50',
  'flex',
  'items-center',
  'justify-center',
  'p-4',
  'transition-opacity',
  'ease-out',
  'duration-300',
  props.isVisible ? 'opacity-100' : 'opacity-0',
  props.isVisible ? 'pointer-events-auto' : 'pointer-events-none'
]);

const iconClasses = computed(() => [
  'mx-auto',
  'flex',
  'h-12',
  'w-12',
  'items-center',
  'justify-center',
  'rounded-full',
  props.isSuccess ? 'bg-green-100' : 'bg-red-100'
]);

</script>

<template>
  <!-- Main modal wrapper with z-index to sit on top of everything -->
  <div v-if="isVisible" :class="modalWrapperClasses">
    <!-- Modal backdrop -->
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

    <!-- Modal dialog box. It's now explicitly z-indexed higher than the backdrop. -->
    <div class="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-sm sm:w-full sm:p-6 z-50 relative">
      <div>
        <!-- Icon -->
        <div :class="iconClasses">
          <!-- The heroicons path is long and complex, but we can simplify using the boolean props -->
          <svg class="h-6 w-6" :class="isSuccess ? 'text-green-600' : 'text-red-600'" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <!-- Success checkmark icon -->
            <path v-if="isSuccess" fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.545a.75.75 0 001.144 1.077l3.236-4.545a.75.75 0 00-.872-1.22zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" clip-rule="evenodd" />
            <!-- Error exclamation icon -->
            <path v-else fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.06 1.06a.75.75 0 101.06 1.06L12 13.06l1.06 1.06a.75.75 0 101.06-1.06L13.06 12l1.06-1.06a.75.75 0 10-1.06-1.06L12 10.94l-1.06-1.06z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="mt-3 text-center sm:mt-5">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ title }}</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">{{ message }}</p>
          </div>
        </div>
      </div>
      <div class="mt-5 sm:mt-6">
        <button
          type="button"
          class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          @click="emit('close')"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>
