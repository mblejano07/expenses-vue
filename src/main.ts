import { createApp } from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import router from "./router/router";
import './assets/main.css';

const app = createApp(App); // Create a single app instance
const pinia = createPinia(); // Create the Pinia store instance

app.use(pinia);   // Tell the app to use Pinia
app.use(router);  // Tell the app to use the router

app.mount("#app"); // Mount the single app instance