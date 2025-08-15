import { defineStore } from 'pinia';
import { type InvoicePayload } from '@/services/invoices';

export const usePendingInvoiceStore = defineStore('pendingInvoice', {
  state: () => ({
    // Initialize the state with the same structure as your form data, including the File object.
    invoiceData: null as (InvoicePayload & { file?: File }) | null,
  }),
  actions: {
    setInvoiceData(data: InvoicePayload & { file?: File }) {
      this.invoiceData = data;
    },
    clearInvoiceData() {
      this.invoiceData = null;
    },
  },
});
