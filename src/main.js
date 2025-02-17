import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router.js";
import { createPinia } from "pinia";
import 'material-design-icons-iconfont/dist/material-design-icons.css';

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(pinia)
  .mount("#app");
