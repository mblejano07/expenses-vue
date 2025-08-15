import { apiFetch } from "./api"; // Use the custom fetch wrapper

// Define the data structure for an invoice item
export interface InvoiceItem {
  id: number;
  particulars: string;
  project_class: string;
  account: string;
  vatable: boolean;
  amount: number;
}

// Interface for the employee object
export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_number: string;
  is_approver: boolean;
}

// Interface for a single invoice record (as received from the backend)
export interface Invoice {
  reference_id: string;
  company_name: string;
  tin: string;
  invoice_number: string;
  transaction_date: string;
  items: InvoiceItem[];
  encoder: Employee;
  payee: Employee;
  payee_account: string;
  approver: Employee;
  file_url: string;
  encoding_date: string;
  status: string;
  remarks: string;
}

// Interface for a single invoice record (as sent to the backend)
// Note: `reference_id` is removed because the backend generates it now.
export interface InvoicePayload {
  company_name: string;
  tin: string;
  invoice_number: string;
  transaction_date: string;
  items: InvoiceItem[];
  encoder: string;
  payee: string;
  payee_account: string;
  approver: string;
  remarks: string;
}

// Interface for the API response after creating an invoice
export interface CreateInvoiceResponse {
  success: boolean;
  message: string;
  data: Invoice;
  errors: any;
}

// Interface for the API response containing a list of invoices
export interface InvoiceListResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    invoices: Invoice[];
    last_evaluated_key: any;
  };
  errors: any;
}

/**
 * Creates a new invoice by sending a POST request to the API.
 * The backend is now responsible for generating the reference_id.
 * @param payload The invoice data to be sent.
 * @returns A Promise that resolves to the API response.
 */
export async function createInvoice(payload: InvoicePayload): Promise<CreateInvoiceResponse> {
  const res = await apiFetch<CreateInvoiceResponse>("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.success) {
    throw new Error(res.message || res.errors);
  }
  return res;
}

/**
 * Gets a list of all invoices by sending a GET request to the API.
 * @returns A Promise that resolves to the list of invoices.
 */
export async function listInvoices(): Promise<InvoiceListResponse> {
  const res = await apiFetch<InvoiceListResponse>("/invoices", {
    method: "GET",
  });

  if (!res.success) {
    throw new Error(res.message || res.errors);
  }
  return res;
}
