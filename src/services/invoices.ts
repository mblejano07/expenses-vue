import { apiFetch } from "./api";

// Define the data structure for an invoice item
export interface InvoiceItem {
  id: number;
  particulars: string;
  project_class: string;
  account: string;
  vatable: boolean;
  amount: number;
}

// Define the data structure for an invoice payload
export interface InvoicePayload {
  reference_id: string;
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

// Define the response structure for a successful invoice creation
export interface CreateInvoiceResponse {
  message: string;
  data: InvoicePayload;
}

/**
 * Creates a new invoice by sending a POST request to the API.
 * @param payload The invoice data to be sent.
 * @returns A Promise that resolves to the API response.
 */
export async function createInvoice(payload: InvoicePayload): Promise<CreateInvoiceResponse> {
  // Use apiFetch to handle the network request, headers, and token
  const res = await apiFetch<CreateInvoiceResponse>("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res;
}
