<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ExpensesTable from "@/components/InvoiceTable.vue";
import { listInvoices, type Invoice } from "@/services/invoices";

const router = useRouter();
const invoices = ref<Invoice[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchInvoices = async () => {
  try {
    isLoading.value = true;
    
    // The backend now handles the filtering based on the user's token.
    // We no longer need to fetch the employee list or pass the encoder ID.
    const response = await listInvoices();
    
    if (response.success && response.data && response.data.invoices) {
      invoices.value = response.data.invoices;
    } else {
      error.value = "Failed to fetch invoices: " + (response.message || "Unknown error");
    }
  } catch (err: any) {
    console.error("Error fetching invoices:", err);
    error.value = err.message || "An unknown error occurred.";
  } finally {
    isLoading.value = false;
  }
};

const goToCreateInvoice = () => {
  router.push('/create-invoice');
};

onMounted(() => {
  // The logic is now much simpler. We just call fetchInvoices and the backend
  // handles whether to show all invoices or just the user's.
  fetchInvoices();
});
</script>

<template>
  <div class="p-6 md:p-12 bg-gray-50 min-h-screen font-sans">
    <div class="w-full bg-white p-8 rounded-lg shadow-xl">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Re-imbursement List</h1>
        <button
          @click="goToCreateInvoice"
          class="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <!-- Heroicons plus-sm SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 -ml-1 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Record
        </button>
      </div>

      <div v-if="isLoading" class="text-center py-10">
        <p class="text-gray-500">Loading expenses...</p>
      </div>
      <div v-else-if="error" class="text-center py-10">
        <p class="text-red-500 font-medium">{{ error }}</p>
      </div>
      <div v-else>
        <ExpensesTable :invoices="invoices" />
      </div>
    </div>
  </div>
</template>
