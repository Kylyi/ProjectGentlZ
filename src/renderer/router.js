import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)



export default new Router({
  routes: [{
      path: '/',
      name: 'dashboard',
      component: require('../components/Dashboard.vue').default
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
      path: '/projectView',
      name: 'ProjectView',
      component: require('../components/ProjectView.vue').default
    },
    {
      path: '/delegateProjects',
      name: 'DelegateProjects',
      component: require('../components/DelegateProjects.vue').default
    },
    {
      path: '/invoicing',
      name: 'invoicing',
      component: require('../components/Invoicing.vue').default
    },
    {
      path: '/riskRegister',
      name: 'riskRegister',
      component: require('../components/RiskRegister.vue').default
    },
    {
      path: '/riskRegisterAggregate',
      name: 'riskRegisterAggregate',
      component: require('../components/RiskRegisterAggregate.vue').default
    },
    {
      path: '/costs',
      name: 'costs',
      component: require('../components/Costs.vue').default
    },
    {
      path: '/userSystem',
      name: 'userSystem',
      component: require('../components/UserSystem.vue').default
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('../components/Settings.vue').default
    },
    {
      path: '/loadPage',
      name: 'loadPage',
      component: require('../components/LoadPage.vue').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
