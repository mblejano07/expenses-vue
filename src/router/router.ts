import { createRouter, createWebHistory } from "vue-router";
import RequestOtp from "../views/RequestOtp.vue";
import Verify from "../views/Verify.vue";
import InvoiceForm from "../views/InvoiceForm.vue";
import InvoiceList from "../views/InvoiceList.vue";

const routes = [
  { path: "/", redirect: "/list-invoice" }, // I've changed this to redirect to the list view by default
  {
    path: "/request",
    name: "RequestOtp",
    component: RequestOtp,
    meta: { requiresAuth: false } // This route does not require authentication
  },
  {
    path: "/verify",
    name: "Verify",
    component: Verify,
    meta: { requiresAuth: false } // This route does not require authentication
  },
  {
    path: "/create-invoice",
    name: "CreateInvoice",
    component: InvoiceForm,
    meta: { requiresAuth: true } // This route requires authentication
  },
  {
    path: "/list-invoice",
    name: "ListInvoice",
    component: InvoiceList,
    meta: { requiresAuth: true } // This route requires authentication
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// A simple JWT decode function. In a real app, you'd use a library.
// The 'token' parameter now explicitly has a string type.
const decodeJwt = (token: string) => {
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
};

// Navigation Guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const token = localStorage.getItem('authToken');
  
  if (requiresAuth && !token) {
    // If the route requires auth and there's no token, redirect to login
    next('/request');
  } else if (requiresAuth && token) {
    // If the token exists, check if it's expired
    const decodedToken = decodeJwt(token);
    const currentTime = Date.now() / 1000;
    
    if (!decodedToken || decodedToken.exp < currentTime) {
      // If the token is invalid or expired, clear it and redirect
      localStorage.removeItem('authToken');
      next('/request');
    } else {
      // Token is valid, proceed
      next();
    }
  } else {
    // For non-protected routes, just proceed
    next();
  }
});

export default router;
