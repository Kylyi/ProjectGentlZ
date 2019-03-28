import App from './App.vue'
import Vue from 'vue'
import store from '../store'
import router from './router.js'

// Vuetify
import Vuetify from 'vuetify'
Vue.use(Vuetify)
import 'vuetify/dist/vuetify.min.css'
import UploadButton from 'vuetify-upload-button'
Vue.component('upload-btn', UploadButton)

// ElementUI
import { DatePicker, Input, Row, Col, Form, FormItem, Table, TableColumn, InputNumber, Switch } from 'element-ui'
import lang from 'element-ui/lib/locale/lang/en'
import localElementUi from 'element-ui/lib/locale'
Vue.component(DatePicker.name, DatePicker);
Vue.component(Input.name, Input);
Vue.component(Row.name, Row);
Vue.component(Col.name, Col);
Vue.component(Form.name, Form);
Vue.component(FormItem.name, FormItem);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.component(InputNumber.name, InputNumber);
Vue.component(Switch.name, Switch);
localElementUi.use(lang)
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/display.css'

// Mutliselect
import Multiselect from 'vue-multiselect'
Vue.component('multiselect', Multiselect)
import 'vue-multiselect/dist/vue-multiselect.min.css'

// Notifications
import Notifications from 'vue-notification'
Vue.use(Notifications)

// Shortkey
import shortkey from 'vue-shortkey'
Vue.use(shortkey)

// Tooltips
// import VTooltip from 'v-tooltip'
// Vue.use(VTooltip)

// CSS
import './assets/style/mystyle.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.compact.css';

new Vue({
  components: {App},
  store,
  router,
  template: '<App/>'
}).$mount('#app')