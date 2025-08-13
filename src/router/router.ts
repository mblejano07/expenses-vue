import { createRouter, createWebHistory } from "vue-router";
import RequestOtp from "../views/RequestOtp.vue"; 
import Verify from "../views/Verify.vue";          
import InvoiceForm from "../views/InvoiceForm.vue";          

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
    path: "/form-create",
    name: "CreateInvoice",
    component: InvoiceForm,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;