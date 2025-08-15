<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { createInvoice, type InvoicePayload } from "@/services/invoices";
import ConfirmationCard from "@/components/ConfirmationCard.vue";

const router = useRouter();
const isLoading = ref(false);
const result = ref<string>("");

// Invoice data will now be populated from local storage on component mount
const invoiceData = ref<InvoicePayload | null>(null);

// A simple helper function to format currency
const formatCurrency = (amount: number) => {
  return `₱${amount.toFixed(2)}`;
};

// Computed properties for calculations
const totalSales = computed(() => {
  if (!invoiceData.value || !invoiceData.value.items) {
    return 0;
  }
  return invoiceData.value.items.reduce((sum, item) => sum + item.amount, 0);
});

const vatAmount = computed(() => {
  return totalSales.value * 0.12;
});

// This function handles the actual API call
const confirmAndSubmitInvoice = async () => {
  if (!invoiceData.value) {
    result.value = "Error: No invoice data found.";
    return;
  }

  isLoading.value = true;
  result.value = ""; // Clear previous results

  try {
    const payloadToSend: InvoicePayload = { ...invoiceData.value };
    // The file object is not stored in local storage, so we check and remove if it exists
    if ('file' in payloadToSend) {
        delete (payloadToSend as any).file;
    }

    // Create a deep copy of the items array to remove the 'id' property
    payloadToSend.items = invoiceData.value.items.map(item => {
      const newItem = { ...item };
      // The 'id' property is only for client-side use, so we remove it for the backend payload
      if ('id' in newItem) {
        delete (newItem as any).id;
      }
      return newItem;
    });

    const response = await createInvoice(payloadToSend);

    if (response.success) {
      result.value = "Invoice created successfully!";
      // Clear local storage after successful submission to prevent stale data
      localStorage.removeItem("pendingInvoiceData");
    } else {
      result.value = `Error: ${response.message || "An unknown error occurred."}`;
    }
  } catch (err: any) {
    console.error("Error creating invoice:", err);
    result.value = "An unexpected error occurred.";
  } finally {
    isLoading.value = false;
  }
};

const goBackToForm = () => {
  router.push('/create-invoice');
};

// This is the part that retrieves the data from local storage.
onMounted(() => {
  // Retrieve the data from local storage on component mount
  const storedData = localStorage.getItem('pendingInvoiceData');
  console.log("Stored Invoice Data:", storedData);
  if (storedData) {
    try {
      // Parse the JSON string back into an object
      invoiceData.value = JSON.parse(storedData);
    } catch (e) {
      console.error("Failed to parse invoice data from local storage", e);
      invoiceData.value = null;
    }
  }
});
</script>

<template>
  <div class="p-6 md:p-12 bg-gray-50 min-h-screen font-sans">
    <div class="w-full max-w-4xl mx-auto space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Confirm Invoice Details</h1>
        <p class="mt-2 text-sm text-gray-500">Please review the information below before submitting.</p>
      </div>

      <div v-if="invoiceData" class="space-y-6">
        <!-- General Information Card -->
        <ConfirmationCard title="General Information">
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
            <div><dt class="font-medium text-gray-900">Company Name</dt><dd class="mt-1">{{ invoiceData.company_name }}</dd></div>
            <div><dt class="font-medium text-gray-900">TIN</dt><dd class="mt-1">{{ invoiceData.tin }}</dd></div>
            <div><dt class="font-medium text-gray-900">Invoice Number</dt><dd class="mt-1">{{ invoiceData.invoice_number }}</dd></div>
            <!-- ✅ THIS IS THE LINE THAT RENDERS THE DATE -->
            <div><dt class="font-medium text-gray-900">Transaction Date</dt><dd class="mt-1">{{ invoiceData.transaction_date }}</dd></div>
            <!-- We can't display the file name since the File object is not stored in local storage -->
          </dl>
        </ConfirmationCard>

        <!-- Invoice Items Card -->
        <ConfirmationCard title="Invoice Items">
          <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Particulars</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Project/Class</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Account</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Vatable</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 ">Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="(item, index) in invoiceData.items" :key="index">
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ item.particulars }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.project_class }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.account }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ item.vatable ? 'Yes' : 'No' }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-6 flex justify-end">
            <div class="w-full sm:w-1/2 space-y-2 text-right text-gray-700">
              <div class="flex justify-between font-semibold text-gray-800">
                <span>Total Sales:</span>
                <span>{{ formatCurrency(totalSales) }}</span>
              </div>
              <div class="flex justify-between">
                <span>VAT (12%):</span>
                <span>{{ formatCurrency(vatAmount) }}</span>
              </div>
              <div class="flex justify-between font-bold text-gray-900 text-lg border-t pt-2 mt-2">
                <span>Total Amount Due:</span>
                <span>{{ formatCurrency(totalSales + vatAmount) }}</span>
              </div>
            </div>
          </div>
        </ConfirmationCard>

        <!-- Personnel & Remarks Card -->
        <ConfirmationCard title="Personnel & Remarks">
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
            <div><dt class="font-medium text-gray-900">Encoder</dt><dd class="mt-1">{{ invoiceData.encoder }}</dd></div>
            <div><dt class="font-medium text-gray-900">Payee</dt><dd class="mt-1">{{ invoiceData.payee }}</dd></div>
            <div><dt class="font-medium text-gray-900">Payee Account</dt><dd class="mt-1">{{ invoiceData.payee_account }}</dd></div>
            <div><dt class="font-medium text-gray-900">Approver</dt><dd class="mt-1">{{ invoiceData.approver }}</dd></div>
            <div class="sm:col-span-2"><dt class="font-medium text-gray-900">Remarks</dt><dd class="mt-1">{{ invoiceData.remarks || 'N/A' }}</dd></div>
          </dl>
        </ConfirmationCard>

        <!-- Action buttons -->
        <div class="flex justify-end space-x-4 pt-6">
        
          <button @click="confirmAndSubmitInvoice" type="button" :disabled="isLoading" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
            <span v-if="isLoading">Submitting...</span>
            <span v-else>Confirm & Submit</span>
          </button>
          <button @click="goBackToForm" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Go Back
          </button>
        </div>
        <p v-if="result" class="mt-4 text-center" :class="{'text-green-600': result.includes('successfully'), 'text-red-600': result.includes('Error')}">
          {{ result }}
        </p>
      </div>
      <div v-else class="text-center p-12 bg-white rounded-lg shadow-xl">
        <h2 class="text-2xl font-bold text-gray-900">No Invoice Data Found</h2>
        <p class="mt-2 text-gray-500">Please go back to the form to fill in the details.</p>
        <button @click="goBackToForm" class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>
