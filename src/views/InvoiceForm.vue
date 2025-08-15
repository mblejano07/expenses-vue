<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import InvoiceItemsTable from "@/components/InvoiceItemsTable.vue";
import { listEmployees, type Employee } from "@/services/employees";

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
const allEmployees = ref<Employee[]>([]);
const approvers = ref<Employee[]>([]);
const encodingDate = ref<string>("");

const router = useRouter(); // Use the router

// A helper function to decode a JWT token
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

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

// Watch for changes in the selected payee to auto-fill the payee_account
const handlePayeeChange = () => {
  const selectedPayee = allEmployees.value.find(
    // Correctly find the payee by their full name
    (emp) => `${emp.first_name} ${emp.last_name}` === invoiceData.value.payee
  );
  if (selectedPayee) {
    invoiceData.value.payee_account = selectedPayee.account_number;
  } else {
    invoiceData.value.payee_account = "";
  }
};

// Function to handle form submission
const handleSubmit = () => {
  // This is where you would call your API to submit the data.
  // For now, we'll just log the data and show a success message.
  console.log("Submitting invoice data:", invoiceData.value);
  result.value = "Invoice form submitted successfully!";
};

// Fetch employee data and auto-fill the encoder field on component mount
onMounted(async () => {
  // Check for a valid token. If it doesn't exist or is expired, redirect.
  const token = localStorage.getItem("authToken");
  let userEmail = null;

  if (token) {
    const decodedToken = decodeJwt(token);
    // Check if the token is decoded and not expired
    if (decodedToken && decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
      userEmail = decodedToken.email; // Use the email from the token
    }
  }

  if (!userEmail) {
    console.log("No valid token found, redirecting to request page.");
    router.push("/request");
    return; // Stop further execution of onMounted
  }

  try {
    const res = await listEmployees();
    if (res.success && res.data) {
      allEmployees.value = res.data.employees;
      approvers.value = res.data.employees.filter((emp) => emp.is_approver);
      
      const currentUser =  userEmail

      if (currentUser) {
        // Set the encoder to the user's email as requested
        invoiceData.value.encoder = currentUser; 
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        encodingDate.value = now.toLocaleDateString('en-US', options);
      }
    } else {
      result.value = res.message || "Failed to fetch employee list.";
    }
  } catch (err: any) {
    console.error("API call failed:", err);
    result.value = `Error fetching employees: CORS error (403 Forbidden). The API is rejecting the request from this origin.`;
  }
});
</script>

<template>
  <div class="p-6 md:p-12 bg-gray-50 min-h-screen font-sans">
    <div class="w-full bg-white p-8 rounded-lg shadow-xl">
      <!-- Header with Encoder and Encoding Date -->
      <div class="flex flex-col items-center mb-10">
        <div class="flex justify-between w-full items-start">
          <img class="h-12 w-auto" src="/images/blackpearl.png" alt="Blackpearl" />
          <div class="text-right text-sm text-gray-600">
            <p><strong>Encoder:</strong> {{ invoiceData.encoder }}</p>
            <p><strong>Encoding Date:</strong> {{ encodingDate }}</p>
          </div>
        </div>
        <h2 class="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Create New Invoice
        </h2>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Section: Top-level Invoice Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label for="tin" class="block text-sm font-medium text-gray-700">TIN</label>
            <input v-model="invoiceData.tin" type="text" id="tin" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="company_name" class="block text-sm font-medium text-gray-700">Company Name</label>
            <input v-model="invoiceData.company_name" type="text" id="company_name" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
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
            <label for="payee" class="block text-sm font-medium text-gray-700">Payee</label>
            <select v-model="invoiceData.payee" @change="handlePayeeChange" id="payee" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option disabled value="">Please select a payee</option>
              <option v-for="employee in allEmployees" :key="employee.employee_id" :value="employee.first_name + ' ' + employee.last_name">
                {{ employee.first_name }} {{ employee.last_name }}
              </option>
            </select>
          </div>
          <div>
            <label for="payee_account" class="block text-sm font-medium text-gray-700">Payee Account</label>
            <input v-model="invoiceData.payee_account" type="text" id="payee_account" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" readonly />
          </div>
          <div>
            <label for="approver" class="block text-sm font-medium text-gray-700">Approver</label>
            <select v-model="invoiceData.approver" id="approver" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option disabled value="">Please select an approver</option>
              <option v-for="approver in approvers" :key="approver.employee_id" :value="approver.first_name + ' ' + approver.last_name">
                {{ approver.first_name }} {{ approver.last_name }}
              </option>
            </select>
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
