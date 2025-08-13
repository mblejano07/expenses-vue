import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router"; // points to router/router.ts
import './assets/main.css' // Or whatever you named your CSS file

createApp(App).use(router).mount("#app");