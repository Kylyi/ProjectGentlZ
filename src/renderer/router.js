import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)



export default new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: require('../components/Home.vue').default
    },
    {
      path: '/templateGenerator',
      name: 'templateGenerator',
      component: require('../components/TemplateGenerator.vue').default
    },
    {
      path: '/newTemplate',
      name: 'newTemplate',
      component: require('../components/NewTemplate.vue').default
    },
    {
      path: '/invoicing',
      name: 'invoicing',
      component: require('../components/Invoicing.vue').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('../components/Settings.vue').default
    },
    {
      path: '/importInvoicing',
      name: 'importInvoicing',
      component: require('../components/Invoicing/ImportInvoicing.vue').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
