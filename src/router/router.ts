import { createRouter, createWebHistory } from "vue-router";
import RequestOtp from "../views/RequestOtp.vue"; // relative to router.ts
import Verify from "../views/Verify.vue";          // relative to router.ts

const routes = [
  { path: "/", redirect: "/verify" },
  { path: "/request", component: RequestOtp },
  { path: "/verify", component: Verify },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
