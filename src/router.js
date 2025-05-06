import {createRouter, createWebHistory} from "vue-router";
import DefaultLayout from "./components/layout/DefaultLayout.vue";
import GuestLayout from "./components/layout/GuestLayout.vue";
import Login from "./pages/auth/Login.vue";
import Signup from "./pages/auth/Signup.vue";
import NotFound from "./pages/auth/NotFound.vue";
import useUserStore from "./stores/user.js";
import Dashboard from "./pages/Dashboard.vue";
import Map from "./pages/Map.vue";
import Barangay from "./pages/barangay/Barangay.vue";
import EditBarangay from "./pages/barangay/EditBarangay.vue";
import ReportTable from "./pages/report/ReportsTable.vue";
import ReportViewDetails from "./pages/report/ViewReport.vue";
import EditReports from "./pages/report/EditReport.vue";
import AddReport from "./pages/report/AddReport.vue";
import UsersTable from "./pages/user/UsersTable.vue";
import ViewRelatedIncidents from "./pages/barangay/ViewRelatedIncidents.vue";
import ImportFile from "./pages/report/ImportFile.vue";
import Profile from "./pages/profile/Profile.vue";
import Tracking from "./pages/tracking/Tracking.vue";
import ViewTrackingDetails from "./pages/tracking/ViewTrackingDetails.vue";
import ForgotPassword from "./pages/auth/ForgotPassword.vue";
import ResetPassword from "./pages/auth/ResetPassword.vue";
import NoAccess from "./pages/auth/NoAccess.vue";
import NotVerifiedEmail from "./pages/auth/NotVerifiedEmail.vue";
import VerifiedEmail from "./pages/auth/VerifiedEmail.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {path: '/', name: 'Overview', component: Dashboard, meta: { title: 'Overview' }},

      {path: '/map', name: 'Map', component: Map, meta: { title: 'Map' }},

      {path: '/report-add-form', name: 'AddReport', component: AddReport, meta: { title: 'Add Report' }},
      {path: '/import-file', name: 'ImportFile', component: ImportFile, meta: { title: 'Import File' }},
      // {path: '/report-display', name: 'ReportViewDetails', component: ReportViewDetails, meta: { title: 'View Report' }},
      {path: '/report-table', name: 'ReportTable', component: ReportTable, meta: { title: 'Report Table' }},
      {path: '/report-view/:id', name: 'ReportViewDetails', component: ReportViewDetails, meta: { title: 'Report View' }},
      {path: '/report-edit/:id', name: 'EditReport', component: EditReports, meta: { title: 'Edit Report' }},

      {path: '/barangay', name: 'Barangay', component: Barangay, meta: { title: 'Barangay Management' }},
      {path: '/barangay-fetch/:id', name: 'EditBarangay', component: EditBarangay, meta: { title: 'Edit Barangay' }},
      {path: '/barangay-update/:id', name: 'UpdateBarangay', component: Barangay, meta: { title: 'Update Barangay' }},
      {path: '/barangay-delete/:id', name: 'DeleteBarangay', component: Barangay, meta: { title: 'Delete Barangay' }},
      {path: '/barangay-statistics/:id', name: 'BarangayStatistics', component: ViewRelatedIncidents, meta: { title: 'Barangay Statistics' }},

      {path: '/user', name: 'UsersTable', component: UsersTable, meta: { title: 'User Management' }},

      {path: '/log', name: 'Logs', component: Tracking, meta: { title: 'Logs Management' }},
      {path: '/log-view/:id', name: 'LogViewDetails', component: ViewTrackingDetails, meta: { title: 'Log Details View' }},

      {path: '/profile', name: 'Profile', component: Profile, meta: { title: 'Profile' }},
    ],
    beforeEnter: async (to, from, next) => {
      try {
        const userStore = useUserStore();
        await userStore.fetchUser();
       
        if (!userStore?.user.for_911) {
          console.log(userStore.user);
          next('/no-access');
          console.log(userStore.user);
          return
        } else if(!userStore?.user.email_verified_at) {
          next('/email_not_verified');
          return;
        }
        
        next();
      } catch (error) {
        next('/login');
      }
    },
  },
  // {
  //   path: "/login",
  //   component: GuestLayout,
  //   children: [
  //     {path: '/login', name: 'Login', component: Login, meta: { title: 'Login' }},
  //   ],
  // },
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
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { title: 'Forgot Password' }
  },
  {
    path: '/password-reset',
    name: 'NewPassword',
    component: ResetPassword, // ResetPassword for new password form
    meta: { title: 'New Password' }
  },
  {
    path: '/no-access',
    name: 'NoAccess',
    component: NoAccess,
    meta: { title: 'No Access' }
  },
  {
    path: '/email_not_verified',
    name: 'NotVerifiedEmail',
    component: NotVerifiedEmail,
    meta: { title: 'Not Verified Email' }
  },
  {
    path: '/email_verified',
    name: 'VerifiedEmail',
    component: VerifiedEmail,
    meta: { title: 'Verified Email' }
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
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0};
  }
})

router.beforeEach((to, from) => {
  document.title = to.meta?.title ?? 'Default Title'
})


export default router