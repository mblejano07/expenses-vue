<script setup lang="ts">
import { computed } from "vue";
import type { Invoice } from "@/services/invoices";

// Define the props this component will accept
const props = defineProps<{
  invoices: Invoice[];
  // The userRole is now an array of strings to support multiple roles.
  userRole: ('encoder' | 'payee' | 'approver' | 'admin' | 'receiver' | 'standard')[];
}>();

// Define the emits for the 'receive' action
const emit = defineEmits(['receive-invoice']);

// A helper function to format a number as a currency string
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Computed property to transform the invoices data for display
const invoicesWithCalculatedFields = computed(() => {
  return props.invoices.map(invoice => {
    // Calculate total sales by summing up all item amounts
    const totalSales = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate total VAT amount (VATable items only)
    const vatableAmount = invoice.items
      .filter(item => item.vatable)
      .reduce((sum, item) => sum + item.amount, 0);
    
    // VAT is 12% of the vatable amount in the Philippines
    const vatAmount = vatableAmount * 0.12;

    return {
      ...invoice,
      totalSales,
      vatAmount,
      // Create a display name for the payee
      payeeName: `${invoice.payee.first_name} ${invoice.payee.last_name}`,
      // Create a display name for the approver
      approverName: `${invoice.approver.first_name} ${invoice.approver.last_name}`,
      // Create a display name for the encoder
      encoderName: `${invoice.encoder.first_name} ${invoice.encoder.last_name}`,
    };
  });
});

// A computed property to check if the "Receive" button should be visible.
// This is true if the user's roles include 'receiver' OR 'admin'.
const isReceivedButtonVisible = computed(() => {
  return props.userRole.includes('receiver') || props.userRole.includes('admin');
});

</script>

<template>
  <!-- The `overflow-x-auto` class makes the container horizontally scrollable on smaller screens. -->
  <div class="overflow-x-auto">
    <!-- The `min-w-full` class ensures the table takes up the full width of its container, even if its content is wider. -->
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ref ID
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Encoder
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Payee
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Encoding Date
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Approver
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Transaction Date
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            VAT Amount
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Sales
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <!-- The 'Receive' button header only appears if the user has the 'receiver' or 'admin' role. -->
          <th v-if="isReceivedButtonVisible" scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="invoice in invoicesWithCalculatedFields" :key="invoice.reference_id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ invoice.reference_id }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.encoderName }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.payeeName }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ new Date(invoice.encoding_date).toLocaleDateString() }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.approverName }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.transaction_date }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(invoice.vatAmount) }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(invoice.totalSales) }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <span :class="{
              'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
              'bg-yellow-100 text-yellow-800': invoice.status === 'Pending',
              'bg-green-100 text-green-800': invoice.status === 'Approved',
              'bg-red-100 text-red-800': invoice.status === 'Rejected',
              'bg-blue-100 text-blue-800': invoice.status === 'Received',
            }">
              {{ invoice.status }}
            </span>
          </td>
          <!-- The "Receive" button column -->
          <td v-if="isReceivedButtonVisible" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              v-if="invoice.status === 'Pending'"
              @click="emit('receive-invoice', invoice.reference_id)"
              class="text-indigo-600 hover:text-indigo-900"
            >
              Receive
            </button>
            <span v-else class="text-gray-400">N/A</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
