import Vue from 'vue';
import Router from 'vue-router';

import Dashboard from '../pages/Dashboard.vue';
import projectManager from '../pages/projectManager.vue';
import Login from '../pages/core/Login.vue';
import Error from '../pages/core/Error.vue';



Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        breadcrumb: [
          { name: '主控台' }
        ]
      }
    },
    {
      path: '/projectManager',
      name: 'projectManager',
      component: projectManager,
      meta: {
        breadcrumb: [
          { name: '主控台', href: 'Dashboard' },
          { name: '專案管理' }
        ]
      }
    },

 
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        allowAnonymous: true
      }
    },
    {
      path: '/error',
      name: 'Error',
      component: Error,
      meta: {
        allowAnonymous: true
      }
    },
  ]
});
