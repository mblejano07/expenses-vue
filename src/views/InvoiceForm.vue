<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import InvoiceItemsTable from "@/components/InvoiceItemsTable.vue";
import { listEmployees, type Employee } from "@/services/employees";
import { createInvoice, type InvoicePayload } from "@/services/invoices";

// Define the data structure for the form to match your JSON
const invoiceData = ref<InvoicePayload & { file?: File }>({
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
  file: undefined,
});

const result = ref<string>("");
const allEmployees = ref<Employee[]>([]);
const approvers = ref<Employee[]>([]);
const encodingDate = ref<string>("");

// Counter for generating unique item IDs on the client side
let nextItemId = 2;

const router = useRouter(); // Use the router

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
    invoiceData.value.file = target.files[0];
  } else {
    invoiceData.value.file = undefined;
  }
};

const handleAddItem = () => {
  // Add a new item with a unique ID
  invoiceData.value.items.push({
    particulars: "",
    project_class: "",
    account: "",
    vatable: true,
    amount: 0,
  });
};

const handleRemoveItem = (index: number) => {
  // Remove the item at the specified index
  if (invoiceData.value.items.length > 1) {
    invoiceData.value.items.splice(index, 1);
  }
};

// Watch for changes in the selected payee to auto-fill the payee_account
const handlePayeeChange = () => {
  // Now find the employee by email since the v-model holds the email
  const selectedPayee = allEmployees.value.find(
    (emp) => emp.email === invoiceData.value.payee
  );
  if (selectedPayee) {
    invoiceData.value.payee_account = selectedPayee.account_number;
  } else {
    invoiceData.value.payee_account = "";
  }
};


// Function to handle form submission, now using the createInvoice helper
const handleSubmit = async () => {
  result.value = "Submitting...";

  // Find the employee IDs based on the selected emails
  // The encoder email is already set correctly in onMounted
  const encoderEmployee = allEmployees.value.find(
    (emp) => emp.email === invoiceData.value.encoder
  );
  const payeeEmployee = allEmployees.value.find(
    (emp) => emp.email === invoiceData.value.payee
  );
  const approverEmployee = approvers.value.find(
    (emp) => emp.email === invoiceData.value.approver
  );

  // Check if all necessary employees were found
  if (!encoderEmployee || !payeeEmployee || !approverEmployee) {
    result.value = "Error: Could not find one or more employees. Please ensure all selections are valid.";
    return;
  }
  
  // Create a payload that matches the API's expected structure, using emails
  const payload: InvoicePayload = {
    company_name: invoiceData.value.company_name,
    tin: invoiceData.value.tin,
    invoice_number: invoiceData.value.invoice_number,
    transaction_date: invoiceData.value.transaction_date,
    items: invoiceData.value.items,
    encoder: encoderEmployee.email, // Use email
    payee: payeeEmployee.email, // Use email
    payee_account: invoiceData.value.payee_account,
    approver: approverEmployee.email, // Use email
    remarks: invoiceData.value.remarks,
    file: invoiceData.value.file, // Include the file
  };

  try {
    const response = await createInvoice(payload);

    if (response.success) {
      result.value = "Successfully submitted!";
      router.push("/list-invoice");
    } else {
      result.value = `Submission failed: ${response.message}`;
    }
  } catch (err: any) {
    console.error("API call failed:", err);
    result.value = `Error submitting form: ${err.message}`;
  }
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
      approvers.value = res.data.employees.filter((emp) => emp.access_role.includes('approver'));
      
      const currentUser = allEmployees.value.find(emp => emp.email.toLowerCase() === userEmail.toLowerCase());

      if (currentUser) {
        // Set the encoder to the user's email as requested
        invoiceData.value.encoder = currentUser.email;
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
            <label for="file-upload" class="block text-sm font-medium text-gray-700">Upload Invoice File</label>
            <input id="file-upload" type="file" @change="handleFileChange" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
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
        <!-- Submission Button and Result Message -->
        <div class="pt-8">
          <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create Invoice
          </button>
          <p v-if="result" class="mt-4 text-center" :class="{'text-green-600': result.includes('Successfully'), 'text-red-600': !result.includes('Successfully')}">{{ result }}</p>
        </div>
      </form>
    </div>
  </div>
</template>
