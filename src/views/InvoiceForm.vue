<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import InvoiceItemsTable from "@/components/InvoiceItemsTable.vue";
import { listEmployees, type Employee } from "@/services/employees";
import { type InvoicePayload } from "@/services/invoices";
import { type ListEmployeesResponse } from "@/services/employees";
import { usePendingInvoiceStore } from '@/stores/pendingInvoice';

// Use the Pinia store
const pendingInvoiceStore = usePendingInvoiceStore();

// Define the data structure for the form to match your JSON
const invoiceData = ref<InvoicePayload>(
  pendingInvoiceStore.invoiceData || {
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
    payee: "", // This will now hold the payee's email
    payee_account: "",
    approver: "", // This will now hold the approver's email
    remarks: "",
  }
);
// Use a separate ref for the file to handle it more cleanly
const file = ref<File | undefined>(undefined);

const result = ref<string>("");
const allEmployees = ref<Employee[]>([]);
const approvers = ref<Employee[]>([]);
const encodingDate = ref<string>("");

const router = useRouter();

// A helper function to decode a JWT token.
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

// Handler for the file input
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
  } else {
    file.value = undefined;
  }
};

const handleAddItem = () => {
  invoiceData.value.items.push({
    particulars: "",
    project_class: "",
    account: "",
    vatable: true,
    amount: 0,
  });
};

const handleRemoveItem = (index: number) => {
  if (invoiceData.value.items.length > 1) {
    invoiceData.value.items.splice(index, 1);
  }
};

// Watch for changes in the selected payee to auto-fill the payee_account
const handlePayeeChange = () => {
  const selectedPayee = allEmployees.value.find(
    (emp) => emp.email === invoiceData.value.payee
  );
  if (selectedPayee) {
    invoiceData.value.payee_account = selectedPayee.account_number;
  } else {
    invoiceData.value.payee_account = "";
  }
};

// Function to handle form submission
const handleSubmit = () => {
  // IMPORTANT: Save BOTH the invoice data and the file to the store
  pendingInvoiceStore.setInvoiceData(invoiceData.value);
  
  // Navigate to the confirmation page
  router.push("/confirm-invoice");
};

// Function to handle cancel button
const handleCancel = () => {
  // Navigate back to the invoice list page
  router.push('/list-invoice');
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

  // Restore data from the store if it exists
  if (pendingInvoiceStore.invoiceData) {
    invoiceData.value = pendingInvoiceStore.invoiceData;
    result.value = "Draft loaded from previous session.";
  }

  try {
    const response: ListEmployeesResponse = await listEmployees();
    if (response && response.success && response.data) {
      // Correctly assign the array from the nested 'data' property
      allEmployees.value = response.data.employees;
      approvers.value = response.data.employees.filter((emp) => emp.access_role.includes('approver'));
      
      const currentUser = allEmployees.value.find(emp => emp.email.toLowerCase() === userEmail.toLowerCase());

      if (currentUser) {
        // Set the encoder to the user's email as requested
        invoiceData.value.encoder = currentUser.email;
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        };
        encodingDate.value = now.toLocaleDateString('en-US', options);
      }
    } else {
      result.value = "Failed to fetch employee list.";
    }
  } catch (err) {
    console.error("API call failed:", err);
    result.value = "Error fetching employees: An unknown error occurred.";
  }
});
</script>

<template>
  <div class="p-6 md:p-12 bg-gray-50 min-h-screen font-sans">
    <!-- The main container now has a larger max-width and more padding -->
    <div class="w-full max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <!-- Header with Encoder and Encoding Date -->
      <div class="flex flex-col items-center mb-10">
        <div class="flex justify-between w-full items-start">
          <!-- The image path below is a placeholder. Please replace it with the correct path if available. -->
          <img class="h-12 w-auto" src="/images/blackpearl.png" alt="Logo" />
          <div class="text-right text-sm text-gray-600">
            <p><strong>Encoder:</strong> {{ invoiceData.encoder }}</p>
            <p><strong>Encoding Date:</strong> {{ encodingDate }}</p>
          </div>
        </div>
        <h2 class="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Create New Re-imbursement
        </h2>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Section: Top-level Invoice Details -->
        <!-- The grid now uses a 3-column layout on large screens to fill space -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <div>
            <label for="tin" class="block text-sm font-medium text-gray-700">TIN</label>
            <input v-model="invoiceData.tin" type="text" id="tin" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="company_name" class="block text-sm font-medium text-gray-700">Company Name</label>
            <input v-model="invoiceData.company_name" type="text" id="company_name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="invoice_number" class="block text-sm font-medium text-gray-700">Invoice Number</label>
            <input v-model="invoiceData.invoice_number" type="text" id="invoice_number" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div>
            <label for="transaction_date" class="block text-sm font-medium text-gray-700">Transaction Date</label>
            <input v-model="invoiceData.transaction_date" type="date" id="transaction_date" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          
          <div>
            <label for="file" class="block text-sm font-medium text-gray-700">Upload Invoice File</label>
            <input id="file" type="file" @change="handleFileChange" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
        </div>

        <!-- Section: Dynamic Invoice Items Table (Now a component) -->
        <InvoiceItemsTable :items="invoiceData.items" @add-item="handleAddItem" @remove-item="handleRemoveItem" />
      

        <!-- Section: Payee and Approver Selection -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <div>
              <label for="payee" class="block text-sm font-medium text-gray-700">Payee</label>
              <select v-model="invoiceData.payee" @change="handlePayeeChange" id="payee" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option disabled value="">Please select a payee</option>
                <!-- Bind the value to the employee's email -->
                <option v-for="employee in allEmployees" :key="employee.employee_id" :value="employee.email">
                  {{ employee.first_name }} {{ employee.last_name }}
                </option>
              </select>
            </div>
            <div>
              <label for="payee_account" class="block text-sm font-medium text-gray-700">Payee Account</label>
              <input v-model="invoiceData.payee_account" type="text" id="payee_account" readonly class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div>
              <label for="approver" class="block text-sm font-medium text-gray-700">Approver</label>
              <select v-model="invoiceData.approver" id="approver" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                <option disabled value="">Please select an approver</option>
                <!-- Bind the value to the approver's email -->
                <option v-for="approver in approvers" :key="approver.employee_id" :value="approver.email">
                  {{ approver.first_name }} {{ approver.last_name }}
                </option>
              </select>
            </div>
            <div>
              <label for="remarks" class="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea v-model="invoiceData.remarks" id="remarks" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
            </div>
        </div>
        <!-- Submission and Cancel Buttons -->
        <div class="pt-8 flex justify-end space-x-4">
          <button
            type="submit"
            class="inline-flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
          <button
            type="button"
            @click="handleCancel"
            class="inline-flex justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
       
        </div>
        <p v-if="result" class="mt-4 text-center" :class="{'text-green-600': result.includes('Successfully'), 'text-red-600': !result.includes('Successfully')}">{{ result }}</p>
      </form>
    </div> 
  </div>
</template>
