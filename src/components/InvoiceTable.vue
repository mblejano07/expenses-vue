<script setup lang="ts">
import { computed } from "vue";
import type { Invoice } from "@/services/invoices";

// Define the props this component will accept
const props = defineProps<{
  invoices: Invoice[];
}>();

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
</script>

<template>
  <div class="overflow-x-auto bg-white rounded-lg shadow-md p-4">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Reference ID
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Encoder
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Payee
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Encoded Date
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Approver
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Transaction Date
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Vat Amount
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Sales
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-if="invoicesWithCalculatedFields.length === 0">
          <td colspan="9" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
            No expenses found.
          </td>
        </tr>
        <tr v-else v-for="invoice in invoicesWithCalculatedFields" :key="invoice.reference_id">
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
            }">
              {{ invoice.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
