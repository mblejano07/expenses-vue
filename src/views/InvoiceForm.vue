<script setup lang="ts">
import { ref } from "vue";
import InvoiceItemsTable from "@/components/InvoiceItemsTable.vue";

// Define the data structure for the form to match your JSON
const invoiceData = ref({
  reference_id: "",
  company_name: "",
  tin: "",
  invoice_number: "",
  transaction_date: new Date().toISOString().slice(0, 10), // Default to today's date
  items: [
    {
      particulars: "",
      project_class: "",
      account: "",
      vatable: true,
      amount: 0,
    },
  ],
  encoder: "",
  payee: "",
  payee_account: "",
  approver: "",
});

const result = ref<string>("");

// Function to add a new item row to the items array
const addItem = () => {
  invoiceData.value.items.push({
    particulars: "",
    project_class: "",
    account: "",
    vatable: true,
    amount: 0,
  });
};

// Function to remove an item row by its index
const removeItem = (index: number) => {
  if (invoiceData.value.items.length > 1) {
    invoiceData.value.items.splice(index, 1);
  }
};

// Function to handle form submission
const handleSubmit = () => {
  // This is where you would call your API to submit the data.
  // For now, we'll just log the data and show a success message.
  console.log("Submitting invoice data:", invoiceData.value);
  result.value = "Invoice form submitted successfully!";
};
</script>

<template>
  <div class="p-6 md:p-12 bg-gray-50 min-h-screen font-sans">
    <!-- The `max-w-4xl` and `mx-auto` classes have been removed to allow the form container to be full-width -->
    <div class="w-full bg-white p-8 rounded-lg shadow-xl">
      <div class="flex flex-col items-center mb-10">
        <img class="h-12 w-auto" src="/images/blackpearl.png" alt="Blackpearl" />
        <h2 class="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Create New Invoice
        </h2>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Section: Top-level Invoice Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label for="reference_id" class="block text-sm font-medium text-gray-700">Reference ID</label>
            <input v-model="invoiceData.reference_id" type="text" id="reference_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="company_name" class="block text-sm font-medium text-gray-700">Company Name</label>
            <input v-model="invoiceData.company_name" type="text" id="company_name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="tin" class="block text-sm font-medium text-gray-700">TIN</label>
            <input v-model="invoiceData.tin" type="text" id="tin" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="invoice_number" class="block text-sm font-medium text-gray-700">Invoice Number</label>
            <input v-model="invoiceData.invoice_number" type="text" id="invoice_number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div class="sm:col-span-2">
            <label for="transaction_date" class="block text-sm font-medium text-gray-700">Transaction Date</label>
            <input v-model="invoiceData.transaction_date" type="date" id="transaction_date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
        </div>

        <!-- Section: Dynamic Invoice Items Table (Now a component) -->
        <InvoiceItemsTable :items="invoiceData.items" @add-item="addItem" @remove-item="removeItem" />

        <!-- Section: Other Invoice Details -->
        <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label for="encoder" class="block text-sm font-medium text-gray-700">Encoder</label>
            <input v-model="invoiceData.encoder" type="text" id="encoder" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="payee" class="block text-sm font-medium text-gray-700">Payee</label>
            <input v-model="invoiceData.payee" type="text" id="payee" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="payee_account" class="block text-sm font-medium text-gray-700">Payee Account</label>
            <input v-model="invoiceData.payee_account" type="text" id="payee_account" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="approver" class="block text-sm font-medium text-gray-700">Approver</label>
            <input v-model="invoiceData.approver" type="text" id="approver" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
        </div>

        <!-- Submission Button and Result Message -->
        <div class="pt-8">
          <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create Invoice
          </button>
          <p v-if="result" class="mt-4 text-center text-sm font-medium text-green-600">{{ result }}</p>
        </div>
      </form>
    </div>
  </div>
</template>
