<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import InvoiceTable from "@/components/InvoiceTable.vue";
import { listInvoices, type Invoice } from "@/services/invoices";

// Use a ref to store the list of invoices for the current page
const invoices = ref<Invoice[]>([]);
// Use a ref to store the loading state
const isLoading = ref(true);
// Use a ref to store the key for the next page of results, initially null
const lastEvaluatedKey = ref<string | null>(null);
// A history of keys to navigate back and forth. Start with null for the first page.
const keyHistory = ref<Array<string | null>>([null]);
// The current page index in the history
const currentPage = ref(0);
// Use a ref to store any error messages
const error = ref<string | null>(null);

const router = useRouter();

/**
 * Fetches invoices from the API for a specific page.
 * @param {string | null} key - The key for the page to fetch.
 */
const fetchInvoices = async (key: string | null = null) => {
  try {
    isLoading.value = true;
    error.value = null;

    // Call the API with the provided key for pagination
    const response = await listInvoices(key);

    if (response.success && response.data && response.data.invoices) {
      // ✅ REPLACE the current invoices with the new set
      invoices.value = response.data.invoices;
      // Store the key for the next page
      lastEvaluatedKey.value = response.data.last_evaluated_key;
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

/**
 * Handles the "Next Page" button click.
 */
const goToNextPage = () => {
  // Only fetch the next page if a key is available
  if (lastEvaluatedKey.value) {
    // Increment the page and store the new key in history
    currentPage.value++;
    // If we've moved forward to a page we've never seen before, add its key to the history
    if (currentPage.value >= keyHistory.value.length) {
      keyHistory.value.push(lastEvaluatedKey.value);
    }
    fetchInvoices(lastEvaluatedKey.value);
  }
};

/**
 * Handles the "Previous Page" button click.
 */
const goToPreviousPage = () => {
  // Check if we can go back
  if (currentPage.value > 0) {
    // Decrement the page
    currentPage.value--;
    // Get the key for the previous page from our history and fetch it
    const prevKey = keyHistory.value[currentPage.value];
    fetchInvoices(prevKey);
    // When going back, we also need to update the next page key to what it was before
    lastEvaluatedKey.value = keyHistory.value[currentPage.value + 1] || null;
  }
};

/**
 * Navigates to the invoice creation page.
 */
const goToCreateInvoice = () => {
  router.push('/create-invoice');
};

// Fetch the initial page of invoices when the component mounts
onMounted(() => {
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
          New Invoice
        </button>
      </div>

      <!-- Loading and Error State -->
      <div v-if="isLoading" class="text-center py-10">
        <svg class="animate-spin h-8 w-8 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-500">Loading invoices...</p>
      </div>

      <div v-else-if="error" class="text-center py-10 text-red-600">
        <p>Error: {{ error }}</p>
      </div>
      
      <!-- Invoice Table -->
      <div v-else>
        <InvoiceTable :invoices="invoices" />
      </div>

      <!-- Pagination Footer -->
      <div class="mt-6 flex justify-center items-center">
        <!-- Previous Page Button -->
        <button
          @click="goToPreviousPage"
          :disabled="isLoading || currentPage === 0"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          Previous Page
        </button>
        <!-- Next Page Button -->
        <button
          @click="goToNextPage"
          :disabled="isLoading || !lastEvaluatedKey"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          Next Page
        </button>
      </div>
    </div>
  </div>
</template>
