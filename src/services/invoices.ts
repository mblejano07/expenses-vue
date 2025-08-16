// services/invoices.ts

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
  // This is the first place to update. Add 'Received' to the status union type.
  status: 'Pending' | 'Approved' | 'Rejected' | 'Received';
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
    file_upload?: File; // Optional file for multipart
}

/**
 * Interface for the response when creating an invoice.
 * @interface
 */
export interface CreateInvoiceResponse {
    success: boolean;
    message?: string;
    data?: {
        reference_id: string;
    };
    errors?: Record<string, string>;
}

/**
 * Interface for parameters that can be passed to the listInvoices function.
 */
export interface ListInvoicesParams {
  lastEvaluatedKey?: string | null;
  searchTerm?: string | null;
  limit?: number;
}

/**
 * Fetches a paginated list of invoices from the API.
 * This function is updated to handle search and pagination correctly together.
 * @param {ListInvoicesParams} params - An object containing optional parameters like searchTerm and lastEvaluatedKey.
 * @returns {Promise<ListInvoicesResponse>} - The API response.
 */
export async function listInvoices(params: ListInvoicesParams = {}): Promise<ListInvoicesResponse> {
    try {
        const queryParams = new URLSearchParams();
        
        // Add search term if it exists.
        if (params.searchTerm) {
            queryParams.append("search", params.searchTerm);
        }

        // Add last evaluated key only if no search term is present.
        if (params.lastEvaluatedKey && !params.searchTerm) {
            queryParams.append("last_evaluated_key", params.lastEvaluatedKey);
        }

        // Add the limit parameter with a value of 10.
        // If a limit is provided in params, use that instead.
        queryParams.append("limit", (params.limit || 10).toString());

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
 * Fetches a single invoice by its reference ID.
 * @param {string} referenceId The reference ID of the invoice to fetch.
 * @returns {Promise<Invoice | null>} The invoice data or null if not found.
 */
export async function getInvoiceByRefId(referenceId: string): Promise<Invoice | null> {
    try {
      const res = await apiFetch<{ success: boolean, data: Invoice | null }>(`/invoices/${referenceId}`, {
        method: "GET",
      });
      return res.data;
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      return null;
    }
  }
  
/**
 * Creates a new invoice by submitting a payload to the API.
 * Supports both JSON and multipart form data (if a file is present).
 * @param {InvoicePayload} payload - The invoice data to be sent.
 * @returns {Promise<CreateInvoiceResponse>} - The API response.
 */
export async function createInvoice(payload: InvoicePayload): Promise<CreateInvoiceResponse> {
    try {
        if (payload.file_upload) {
            // Case 1: A file is present, so we use multipart/form-data
            const formData = new FormData();
            const jsonPayload = { ...payload };
            delete jsonPayload.file_upload;
            delete jsonPayload.file; // Ensure 'file' is also removed if present.

            formData.append("body", JSON.stringify(jsonPayload));
            formData.append("file", payload.file_upload);

            const res = await apiFetch<CreateInvoiceResponse>("/invoices", {
                method: "POST",
                body: formData,
            });

            return res;
        } else {
            // Case 2: No file is present, so we send a standard JSON body
            const res = await apiFetch<CreateInvoiceResponse>("/invoices", {
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
/**
 * Sends a request to the API to update an invoice's status.
 * @param {string} invoiceId - The reference_id of the invoice to be updated.
 * @param {string} status - The new status to set for the invoice.
 * @returns {Promise<CreateInvoiceResponse>} - The API response.
 */
export async function updateInvoiceStatus(invoiceId: string, status: 'Pending' | 'Approved' | 'Rejected' | 'Received'): Promise<CreateInvoiceResponse> {
  try {
    const res = await apiFetch<CreateInvoiceResponse>(`/invoices/${invoiceId}`, {
      method: "PATCH", // Using PATCH for a partial update
      headers: {
        'Content-Type': 'application/json',
      },
      // Send a JSON body to update the status field
      body: JSON.stringify({ status: status }),
    });
    return res;
  } catch (err: any) {
    // It's good practice to re-throw a structured error
    throw {
      success: false,
      message: err.message || "Network error",
      errors: undefined,
    };
  }
}

