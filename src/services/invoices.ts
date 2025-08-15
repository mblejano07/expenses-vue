import { apiFetch } from "./api";

export interface InvoiceItem {
  id: number;
  particulars: string;
  project_class: string;
  account: string;
  vatable: boolean;
  amount: number;
}

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

export interface ListInvoicesResponse {
  success: boolean;
  message?: string;
  data?: {
    invoices: Invoice[];
  };
  errors?: Record<string, string>;
}

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

export async function listInvoices(): Promise<ListInvoicesResponse> {
    try {
        const res = await apiFetch<ListInvoicesResponse>("/invoices", {
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

// CORRECTED FUNCTION
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
