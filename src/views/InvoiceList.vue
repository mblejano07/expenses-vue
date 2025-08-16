<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import InvoiceTable from "@/components/InvoiceTable.vue";
import { listInvoices, type Invoice, type ListInvoicesResponse } from "@/services/invoices";

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
// New ref to store the search term
const searchTerm = ref('');
// A variable to hold the debounce timer ID
let searchDebounce: number | undefined;

const router = useRouter();

// The user can now have multiple roles, so we use an array of strings.
// You can set it to any combination, like ['admin', 'receiver'].
// Mock user roles for demonstration purposes. Replace with your actual auth logic.
const userRole = ref<('encoder' | 'payee' | 'approver' | 'admin' | 'receiver' | 'standard')[]>(['receiver']);

/**
 * Fetches invoices from the API for a specific page.
 * @param {string | null} key - The key for the page to fetch.
 * @param {string | null} search - The search term to filter by.
 */
const fetchInvoices = async (key: string | null = null, search: string | null = null) => {
  try {
    isLoading.value = true;
    error.value = null;

    // The API call now correctly handles both key-based pagination and a search term.
    const response = await listInvoices({ lastEvaluatedKey: key, searchTerm: search });

    if (response.success && response.data && response.data.invoices) {
      // REPLACE the current invoices with the new set
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
  // Only fetch the next page if a key is available and a search term is not active
  if (lastEvaluatedKey.value && !searchTerm.value) {
    // Increment the page and store the new key in history
    currentPage.value++;
    // If we've moved forward to a page we've never seen before, add its key to the history
    if (currentPage.value >= keyHistory.value.length) {
      keyHistory.value.push(lastEvaluatedKey.value);
    }
    // Fetch the next page using the key
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
    // Fetch the previous page using the key
    fetchInvoices(prevKey);
    // When going back, we also need to update the next page key to what it was before
    lastEvaluatedKey.value = keyHistory.value[currentPage.value + 1] || null;
  }
};

/**
 * Handles the "Receive" action from the table component.
 * @param {string} invoiceId - The ID of the invoice to receive.
 */
const handleReceiveInvoice = (invoiceId: string) => {
  // Redirect to the ReceiveConfirmation page with the invoice ID as a URL parameter
  router.push({ name: 'InvoiceReceive', params: { id: invoiceId } });
};

/**
 * Handles a search query submission. Resets pagination and fetches results.
 * This function is now called by the debounced watcher.
 */
const handleSearch = () => {
  // Reset pagination state to start a new search from the beginning
  keyHistory.value = [null];
  currentPage.value = 0;
  // Fetch invoices with the new search term
  fetchInvoices(null, searchTerm.value);
};

/**
 * Navigates to the invoice creation page.
 */
const goToCreateInvoice = () => {
  router.push('/create-invoice');
};

// Use a watcher to listen for changes to the searchTerm
watch(searchTerm, (newQuery) => {
  // Clear any existing debounce timer to prevent old searches from firing
  clearTimeout(searchDebounce);

  // Set a new timer. The search will fire after 500ms of inactivity.
  searchDebounce = setTimeout(() => {
    // Call the handleSearch function which resets pagination and fetches data
    handleSearch();
  }, 500);
});

// Fetch the initial page of invoices when the component mounts
onMounted(() => {
  fetchInvoices();
});
</script>

<template>
  <div class="p-6 md:p-12 bg-gray-50 min-h-screen font-sans">
    <div class="w-full bg-white p-8 rounded-lg shadow-xl">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Re-imbursement List</h1>
        <div class="flex-1 w-full md:w-auto">
          <label for="search" class="sr-only">Search</label>
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              id="search"
              name="search"
              class="block w-full rounded-md border-gray-300 shadow-sm pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Search by reference ID..."
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <!-- Heroicons search SVG -->
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
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
        <InvoiceTable :invoices="invoices" :userRole="userRole" @receive-invoice="handleReceiveInvoice" />
      </div>

      <!-- Pagination Footer -->
      <div class="mt-6 flex justify-center items-center space-x-4">
        <!-- Previous Page Button -->
        <button
          @click="goToPreviousPage"
          :disabled="isLoading || currentPage === 0 || !!searchTerm"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          Previous Page
        </button>
        <!-- Next Page Button -->
        <button
          @click="goToNextPage"
          :disabled="isLoading || !lastEvaluatedKey || !!searchTerm"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          Next Page
        </button>
      </div>
    </div>
  </div>
</template>
