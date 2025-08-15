<script setup lang="ts">
import { defineProps, defineEmits, computed } from "vue";

// Define the interface for an invoice item
interface InvoiceItem {
  particulars: string;
  project_class: string;
  account: string;
  vatable: boolean;
  amount: number;
}

// Define props with TypeScript to accept the array of items
const props = defineProps<{
  items: InvoiceItem[];
}>();

// Define custom events that this component can emit
const emit = defineEmits<{
  (e: "addItem"): void;
  (e: "removeItem", index: number): void;
}>();

// Helper function to emit the addItem event
const handleAddItem = () => {
  emit("addItem");
};

// Helper function to emit the removeItem event
const handleRemoveItem = (index: number) => {
  emit("removeItem", index);
};

// Computed property to calculate the total sales from all items
const totalSales = computed(() => {
  return props.items.reduce((sum, item) => sum + (item.amount || 0), 0);
});

// Computed property to calculate the total VAT amount (12% of vatable items)
const totalVatAmount = computed(() => {
  return props.items.reduce((sum, item) => {
    if (item.vatable) {
      return sum + (item.amount || 0) * 0.12;
    }
    return sum;
  }, 0);
});
</script>

<template>
  <div>
    <h3 class="text-lg font-bold text-gray-900 mb-4">Invoice Items</h3>
    <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Class</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vatable</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th class="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in items" :key="index">
            <td class="p-3 whitespace-nowrap">
              <input v-model="item.particulars" type="text" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </td>
            <td class="p-3 whitespace-nowrap">
              <input v-model="item.project_class" type="text" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </td>
            <td class="p-3 whitespace-nowrap">
              <input v-model="item.account" type="text" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </td>
            <td class="p-3 whitespace-nowrap">
              <input v-model="item.vatable" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            </td>
            <td class="p-3 whitespace-nowrap">
              <input v-model.number="item.amount" type="number" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </td>
            <td class="p-3 whitespace-nowrap">
              <button v-if="items.length > 1" @click="handleRemoveItem(index)" type="button" class="text-red-600 hover:text-red-900">Remove</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="6" class="p-3 bg-gray-50">
              <button @click="handleAddItem" type="button" class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add Item
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- New card for Total Sales and Total VAT Amount -->
    <div class="mt-8 flex flex-col sm:flex-row justify-end items-end gap-4">
      <div class="w-full sm:w-1/2 md:w-1/3 bg-gray-100 p-6 rounded-lg shadow-sm">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700">Total Sales:</span>
          <span class="text-lg font-bold text-gray-900">{{ totalSales.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-700">Total VAT Amount (12%):</span>
          <span class="text-lg font-bold text-gray-900">{{ totalVatAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
