import { apiFetch } from "./api";

// This file contains the API interfaces and functions for handling invoices.

/**
 * Interface for a single invoice item.
 * @interface
 */
export interface InvoiceItem {
  id: number;
  particulars: string;
  project_class: string;
  account: string;
  vatable: boolean;
  amount: number;
}

/**
 * Interface for the full invoice document.
 * @interface
 */
export interface Invoice {
  reference_id: string;
  company_name: string;
  tin: string;
  invoice_number: string;
  transaction_date: string;
  items: InvoiceItem[];
  encoder: {
    employee_id: string;
    first_name: string;
    last_name: string;
  };
  payee: {
    employee_id: string;
    first_name: string;
    last_name: string;
  };
  payee_account: string;
  approver: {
    employee_id: string;
    first_name: string;
    last_name: string;
  };
  file_url: string;
  encoding_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
}

/**
 * Interface for the response from the listInvoices API call.
 * Now includes the last_evaluated_key for pagination.
 * @interface
 */
export interface ListInvoicesResponse {
  success: boolean;
  message?: string;
  data?: {
    invoices: Invoice[];
    last_evaluated_key: string | null;
  };
  errors?: Record<string, string>;
}

/**
 * Interface for the payload sent when creating an invoice.
 * @interface
 */
export interface InvoicePayload {
    company_name: string;
    tin: string;
    invoice_number: string;
    transaction_date: string;
    items: Omit<InvoiceItem, 'id'>[];
    encoder: string;
    payee: string;
    payee_account: string;
    approver: string;
    remarks?: string;
    file?: File; // Optional file for multipart
}

/**
 * Fetches a paginated list of invoices from the API.
 * @param {string | null} lastEvaluatedKey - The key from the previous page for pagination.
 * @returns {Promise<ListInvoicesResponse>} - The API response.
 */
export async function listInvoices(lastEvaluatedKey: string | null = null): Promise<ListInvoicesResponse> {
    try {
        const queryParams = new URLSearchParams();
        if (lastEvaluatedKey) {
            queryParams.append("last_evaluated_key", lastEvaluatedKey);
        }
        // Add the limit parameter with a value of 10
        queryParams.append("limit", "10");

        const res = await apiFetch<ListInvoicesResponse>(`/invoices?${queryParams.toString()}`, {
            method: "GET",
        });

        return {
            success: res.success ?? false,
            message: res.message,
            data: res.data,
            errors: res.errors,
        };
    } catch (err: any) {
        return {
            success: false,
            message: err.message || "Network error",
            errors: undefined,
        };
    }
}

/**
 * Creates a new invoice by submitting a payload to the API.
 * Supports both JSON and multipart form data (if a file is present).
 * @param {InvoicePayload} payload - The invoice data to be sent.
 * @returns {Promise<any>} - The API response.
 */
export async function createInvoice(payload: InvoicePayload): Promise<any> {
    try {
        if (payload.file) {
            // Case 1: A file is present, so we use multipart/form-data
            const formData = new FormData();
            const jsonPayload = { ...payload };
            delete jsonPayload.file;

            formData.append("body", JSON.stringify(jsonPayload));
            formData.append("file", payload.file);

            const res = await apiFetch("/invoices", {
                method: "POST",
                body: formData,
            });

            return res;
        } else {
            // Case 2: No file is present, so we send a standard JSON body
            const res = await apiFetch("/invoices", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            return res;
        }
    } catch (err: any) {
        throw err;
    }
}
