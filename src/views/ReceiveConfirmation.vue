<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getInvoiceByRefId, updateInvoiceStatus, type Invoice } from "@/services/invoices";
import ConfirmationCard from "@/components/ConfirmationCard.vue";
import StatusModal from "@/components/StatusModal.vue";

// Use router to navigate and route to get params
const router = useRouter();
const route = useRoute();

// Refs for controlling component state
const isLoading = ref(true);
const invoiceData = ref<Invoice | null>(null);
const fetchError = ref<string | null>(null);

// Refs for controlling the modal's state and content
const isModalVisible = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");
const isSuccess = ref(false);

/**
 * Fetches the invoice details from the API using the reference_id from the URL.
 */
const fetchInvoice = async () => {
  isLoading.value = true;
  fetchError.value = null;
  const referenceId = route.params.id as string;

  if (!referenceId) {
    fetchError.value = "No invoice ID provided in the URL.";
    isLoading.value = false;
    return;
  }

  try {
    invoiceData.value = await getInvoiceByRefId(referenceId);
    if (!invoiceData.value) {
      fetchError.value = "Invoice not found or an error occurred.";
    }
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    fetchError.value = "Failed to load invoice details.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchInvoice);

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

/**
 * Shows the modal with the given title, message, and status.
 * @param title The title for the modal.
 * @param message The message to display inside the modal.
 * @param success A boolean indicating if the transaction was successful.
 */
const showModal = (title: string, message: string, success: boolean) => {
  modalTitle.value = title;
  modalMessage.value = message;
  isSuccess.value = success;
  isModalVisible.value = true;
};

/**
 * Handles the modal's close event.
 * If the submission was a success, it redirects to the invoice list.
 */
const handleModalClose = () => {
  isModalVisible.value = false;
  if (isSuccess.value) {
    router.push("/list-invoice");
  }
};

/**
 * Submits the "receive" action for the invoice.
 */
const confirmReceive = async () => {
  if (!invoiceData.value) {
    showModal("Action Failed", "No invoice data found.", false);
    return;
  }

  isLoading.value = true;

  try {
    const response = await updateInvoiceStatus(invoiceData.value.reference_id,"Received");

    if (response.success) {
      showModal("Success!", "Invoice status updated to 'Received'.", true);
    } else {
      showModal("Action Failed", response.message || "An unknown error occurred.", false);
    }
  } catch (error) {
    console.error("Failed to receive invoice:", error);
    showModal("Action Failed", "An error occurred while receiving the invoice.", false);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Navigates back to the invoice list page.
 */
const goBackToList = () => {
  router.push("/list-invoice");
};
</script>

<template>
  <div class="bg-gray-50 min-h-screen font-sans flex items-center justify-center p-6">
    <div v-if="isLoading" class="text-center py-10">
      <p>Loading invoice details...</p>
    </div>
    <div v-else-if="fetchError" class="text-center p-12 bg-white rounded-lg shadow-xl max-w-lg mx-auto">
      <h2 class="text-2xl font-bold text-gray-900">Error</h2>
      <p class="mt-2 text-red-500">{{ fetchError }}</p>
      <button @click="goBackToList" class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Go Back
      </button>
    </div>
    <div v-else-if="invoiceData" class="w-full max-w-4xl bg-white p-8 rounded-lg shadow-xl">
      <h2 class="text-3xl font-bold tracking-tight text-center text-gray-900 mb-8">Receive Invoice Details</h2>
      
      <ConfirmationCard title="Invoice Details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong>Ref ID:</strong> {{ invoiceData.reference_id }}</p>
          <p><strong>Company Name:</strong> {{ invoiceData.company_name }}</p>
          <p><strong>Invoice Number:</strong> {{ invoiceData.invoice_number }}</p>
          <p><strong>Transaction Date:</strong> {{ invoiceData.transaction_date }}</p>
        </div>
      </ConfirmationCard>

      <ConfirmationCard title="Items Breakdown" class="mt-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Class</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in invoiceData.items" :key="index">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.particulars }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.project_class }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.account }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{{ formatCurrency(item.amount) }}</td>
              </tr>
            </tbody>
            <tfoot>
                <tr class="bg-gray-50">
                    <td colspan="3" class="px-6 py-3 text-right text-base font-bold text-gray-900">Total Sales:</td>
                    <td class="px-6 py-3 text-right text-base font-bold text-gray-900">{{ formatCurrency(totalSales) }}</td>
                </tr>
                <tr class="bg-gray-50">
                    <td colspan="3" class="px-6 py-3 text-right text-base font-bold text-gray-900">VAT (12%):</td>
                    <td class="px-6 py-3 text-right text-base font-bold text-gray-900">{{ formatCurrency(vatAmount) }}</td>
                </tr>
                <tr class="bg-gray-100">
                    <td colspan="3" class="px-6 py-3 text-right text-lg font-extrabold text-gray-900">Grand Total:</td>
                    <td class="px-6 py-3 text-right text-lg font-extrabold text-gray-900">{{ formatCurrency(totalSales + vatAmount) }}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </ConfirmationCard>

      <ConfirmationCard title="Other Details">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <p><strong>Encoder:</strong> {{ invoiceData.encoder.first_name }} {{ invoiceData.encoder.last_name }}</p>
          <p><strong>Approver:</strong> {{ invoiceData.approver.first_name }} {{ invoiceData.approver.last_name }}</p>
          <p><strong>Payee:</strong> {{ invoiceData.payee.first_name }} {{ invoiceData.payee.last_name }}</p>
          <p><strong>Payee Account:</strong> {{ invoiceData.payee_account }}</p>
          <p class="md:col-span-2"><strong>Remarks:</strong> {{ invoiceData.remarks || 'N/A' }}</p>
          <p class="md:col-span-2"><strong>Status:</strong> <span class="font-semibold">{{ invoiceData.status }}</span></p>
        </div>
      </ConfirmationCard>

      <div class="mt-8 flex justify-end space-x-4">
        <button
          @click="confirmReceive"
          :disabled="isLoading || invoiceData.status !== 'Pending'"
          type="button"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          <span v-if="isLoading">Processing...</span>
          <span v-else>Receive</span>
        </button>
        <button @click="goBackToList" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Go Back
        </button>
      </div>
    </div>
  </div>
  <StatusModal :is-visible="isModalVisible" :title="modalTitle" :message="modalMessage" :is-success="isSuccess" @close="handleModalClose" />
</template>
