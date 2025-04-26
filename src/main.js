import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router.js";
import { createPinia } from "pinia";
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import PrimaryButton from "./components/PrimaryButton.vue";
import PopupModal from "./components/PopupModal.vue";
import Loader1 from "./components/loading/loader1.vue";
import ToolTip from "./components/ToolTip.vue";
import Toast from "./components/Toast.vue";
import Badge from "./components/Badge.vue";
import 'primeicons/primeicons.css'

const pinia = createPinia();

createApp(App)
  .use(router)
  .use(pinia)
  .component('PrimaryButton', PrimaryButton)
  .component('PopupModal', PopupModal)
  .component('Loader1', Loader1)
  .component('ToolTip', ToolTip)
  .component('Toast', Toast)
  .component('Badge', Badge)
  .mount("#app");
