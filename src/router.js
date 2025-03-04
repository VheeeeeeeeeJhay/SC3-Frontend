import {createRouter, createWebHistory} from "vue-router";
import DefaultLayout from "./components/DefaultLayout.vue";
import GuestLayout from "./components/GuestLayout.vue";
import Login from "./pages/auth/Login.vue";
import Signup from "./pages/auth/Signup.vue";
import NotFound from "./pages/auth/NotFound.vue";
import useUserStore from "./stores/user.js";
import Dashboard from "./pages/Dashboard.vue";
import Map from "./pages/Map.vue";
import ReportForm from "./pages/report/AddReport.vue";
import Barangay from "./pages/barangay/Barangay.vue";
import EditBarangay from "./pages/barangay/EditBarangay.vue";
import Incident from "./pages/incident/Incident.vue";
import ReportTable from "./pages/report/ReportsTable.vue";
import ReportViewDetails from "./pages/report/ViewReport.vue";
import EditReports from "./pages/report/EditReport.vue";
import AddReport from "./pages/report/AddReport.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {path: '/', name: 'Dashboard', component: Dashboard, meta: { title: 'Dashboard' }},
      // {path: '/dashboard', name: 'Dashboard', component: Dashboard},

      {path: '/map', name: 'Map', component: Map, meta: { title: 'Map' }},

      {path: '/report-add', name: 'AddReport', component: AddReport, meta: { title: 'Add Report' }},
      {path: '/report-display', name: 'ReportViewDetails', component: ReportViewDetails, meta: { title: 'View Report' }},
      {path: '/report-table', name: 'ReportTable', component: ReportTable, meta: { title: 'Report Table' }},
      {path: '/report-view/:id', name: 'ReportViewDetails', component: ReportViewDetails, meta: { title: 'Report View' }},
      {path: '/report-edit/:id', name: 'EditReport', component: EditReports, meta: { title: 'Edit Report' }},

      {path: '/barangay', name: 'Barangay', component: Barangay, meta: { title: 'Barangay' }},
      {path: '/barangay-edit/:id', name: 'EditBarangay', component: EditBarangay, meta: { title: 'Edit Barangay' }},
      {path: '/barangay-update/:id', name: 'UpdateBarangay', component: Barangay, meta: { title: 'Update Barangay' }},
      {path: '/barangay-delete/:id', name: 'DeleteBarangay', component: Barangay, meta: { title: 'Delete Barangay' }},

      {path: '/incident', name: 'Incident', component: Incident, meta: { title: 'Incident' }},
      {path: '/incident-display', name: 'IncidentDisplay', component: Incident, meta: { title: 'Incident Display' }},
    ],
    beforeEnter: async (to, from, next) => {
      try {
        const userStore = useUserStore();
        await userStore.fetchUser();
        next();
      } catch (error) {
        next(false);
      }
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Login' }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { title: 'Signup' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Not Found' }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  document.title = to.meta?.title ?? 'Default Title'
})


export default router