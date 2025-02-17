import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router.js";
import { createPinia } from "pinia";
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import VueApexCharts from "vue3-apexcharts";

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(pinia)
  .use(VueApexCharts)
  .mount("#app");
