import { createRouter, createWebHistory } from "vue-router";
import RequestOtp from "../views/RequestOtp.vue"; 
import Verify from "../views/Verify.vue";          
import InvoiceForm from "../views/InvoiceForm.vue";          
import InvoiceList from "../views/InvoiceList.vue";          

const routes = [
  { path: "/", redirect: "/request" },
  { 
    path: "/request", 
    name: "RequestOtp", 
    component: RequestOtp 
  },
  {
    path: "/verify",
    name: "Verify",
    component: Verify,
  },
  {
    path: "/create-invoice",
    name: "CreateInvoice",
    component: InvoiceForm,
  },
  {
    path: "/list-invoice",
    name: "ListInvoice",
    component: InvoiceList,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;