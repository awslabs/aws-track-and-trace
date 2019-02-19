import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';
import Login from '@/components/Login'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage,
      meta: {
        public: true
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        public: true
      }
    },
    {
      path: '/dashboard',
      name: 'DashboardFleetMap',
      component: Dashboard,
      meta: {
        public: false,
        sidebar: false,
        visual: 'fleet-map'
      }
    }
  ]
})
