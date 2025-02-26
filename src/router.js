import {createRouter, createWebHistory} from "vue-router";
import DefaultLayout from "./components/DefaultLayout.vue";
import GuestLayout from "./components/GuestLayout.vue";
import Login from "./pages/auth/Login.vue";
import Signup from "./pages/auth/Signup.vue";
import NotFound from "./pages/NotFound.vue";
import useUserStore from "./stores/user.js";
import Dashboard from "./pages/Dashboard.vue";
import Map from "./pages/Map.vue";
import ReportForm from "./pages/report/ReportForm.vue";
import Barangay from "./pages/barangay/Barangay.vue";
import EditBarangay from "./pages/barangay/EditBarangay.vue";
import Incident from "./pages/incident/Incident.vue";
import ReportTable from "./pages/report/ReportsTable.vue";
import ReportViewDetails from "./pages/report/ReportViewDetails.vue";
import EditReports from "./pages/report/EditReport.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {path: '/', name: 'Dashboard', component: Dashboard},
      // {path: '/dashboard', name: 'Dashboard', component: Dashboard},

      {path: '/map', name: 'Map', component: Map},

      {path: '/reportform', name: 'ReportForm', component: ReportForm},
      {path: '/report-display', name: 'ReportViewDetails', component: ReportViewDetails },
      {path: '/report-table', name: 'ReportTable', component: ReportTable},
      {path: '/report-view/:id', name: 'ReportViewDetails', component: ReportViewDetails },
      {path: '/report-edit/:id', name: 'EditReport', component: EditReports },

      {path: '/barangay', name: 'Barangay', component: Barangay},
      // {path: '/barangay-edit/:id', name: 'EditBarangay', component: EditBarangay},
      {path: '/barangay-update/:id', name: 'UpdateBarangay', component: Barangay},
      {path: '/barangay-delete/:id', name: 'DeleteBarangay', component: Barangay},

      {path: '/incident', name: 'Incident', component: Incident},
      {path: '/incident-display', name: 'IncidentDisplay', component: Incident},
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
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router