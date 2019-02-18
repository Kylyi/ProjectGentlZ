import Vue from 'vue'
import Vuetify from 'vuetify'
import Notifications from 'vue-notification'
import { DatePicker, Input, Row, Col } from 'element-ui'
import Multiselect from 'vue-multiselect'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.compact.css';


import App from './App.vue'
import router from './router.js'

import './assets/style/mystyle.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.min.css'
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/display.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'


Vue.use(Vuetify)
Vue.use(Notifications)
Vue.use(require('vue-shortkey'))
Vue.component('multiselect', Multiselect)
Vue.component(DatePicker.name, DatePicker);
Vue.component(Input.name, Input);
Vue.component(Row.name, Row);
Vue.component(Col.name, Col);
locale.use(lang)

new Vue({
  components: {App},
  router,
  template: '<App/>'
}).$mount('#app')