import App from './App.vue'
import Vue from 'vue'
import store from '../store'
import router from './router.js'
import colors from 'vuetify/es5/util/colors'
import '@fortawesome/fontawesome-free/css/all.css'

// Vuetify
import Vuetify from 'vuetify'
Vue.use(Vuetify, {
  theme: {
    primary: colors.red.accent2,
    accent: colors.grey.darken3,
    secondary: colors.amber.darken3,
    info: colors.blue.darken1,
    warning: colors.amber.base,
    error: colors.red.lighten1,
    success: colors.green.lighten1,
    abb: colors.red
  },
  iconfont: 'fa'
})
import 'vuetify/dist/vuetify.min.css'
import UploadButton from 'vuetify-upload-button'
Vue.component('upload-btn', UploadButton)


// ElementUI
import { DatePicker, Input, Row, Col, Form, FormItem, Table, TableColumn, InputNumber, Switch, Collapse, CollapseItem } from 'element-ui'
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
Vue.component(Collapse.name, Collapse);
Vue.component(CollapseItem.name, CollapseItem);
localElementUi.use(lang)
import 'element-ui/lib/theme-chalk/index.css'
import 'element-ui/lib/theme-chalk/display.css'

// DEVEXPRESS
import {
  DxDataGrid,
  DxColumnFixing,
  DxColumn,
  DxScrolling,
  DxSelection,
  DxSummary,
  DxGroupItem,
  DxSortByGroupSummaryInfo,
  DxMasterDetail,
  DxStateStoring,
  DxHeaderFilter,
  DxGrouping,
  DxColumnChooser,
  DxGroupPanel,
  DxSearchPanel,
  DxFilterPanel,
  DxFilterRow,
  DxEditing,
  DxExport,
  DxPaging,
  DxPopup,
  DxPosition,
  DxTotalItem,
  DxLoadPanel,
  DxSorting
} from 'devextreme-vue/data-grid'
import {
  DxTextArea,
  DxCheckBox,
  DxSelectBox,
  DxLookup,
  DxNumberBox
} from 'devextreme-vue';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.compact.css';
import config from 'devextreme/core/config'
config({
  decimalSeparator: ",",
  thousandsSeparator: " ",
  defaultCurrency: 'EUR'
})

Vue.component('dx-data-grid', DxDataGrid)
Vue.component('dx-column-fixing', DxColumnFixing)
Vue.component('dx-column', DxColumn)
Vue.component('dx-scrolling', DxScrolling)
Vue.component('dx-selection', DxSelection)
Vue.component('dx-summary', DxSummary)
Vue.component('dx-group-item', DxGroupItem)
Vue.component('dx-sort-by-group-summary-info', DxSortByGroupSummaryInfo)
Vue.component('dx-master-detail', DxMasterDetail)
Vue.component('dx-state-storing', DxStateStoring)
Vue.component('dx-header-filter', DxHeaderFilter)
Vue.component('dx-grouping', DxGrouping)
Vue.component('dx-column-chooser', DxColumnChooser)
Vue.component('dx-group-panel', DxGroupPanel)
Vue.component('dx-search-panel', DxSearchPanel)
Vue.component('dx-filter-panel', DxFilterPanel)
Vue.component('dx-filter-row', DxFilterRow)
Vue.component('dx-editing', DxEditing)
Vue.component('dx-export', DxExport)
Vue.component('dx-paging', DxPaging)
Vue.component('dx-text-area', DxTextArea)
Vue.component('dx-check-box', DxCheckBox)
Vue.component('dx-select-box', DxSelectBox)
Vue.component('dx-lookup', DxLookup)
Vue.component('dx-lookup', DxLookup)
Vue.component('dx-popup', DxPopup)
Vue.component('dx-position', DxPosition)
Vue.component('dx-total-item', DxTotalItem)
Vue.component('dx-load-panel', DxLoadPanel)
Vue.component('dx-number-box', DxNumberBox)
Vue.component('dx-sorting', DxSorting)

// Mutliselect
import Multiselect from 'vue-multiselect'
Vue.component('multiselect', Multiselect)
import 'vue-multiselect/dist/vue-multiselect.min.css'

// Notifications
// import Notifications from 'vue-notification'
// Vue.use(Notifications)

// Shortkey
import shortkey from 'vue-shortkey'
Vue.use(shortkey)

// Vue numeric
import VueNumeric from 'vue-numeric'
 
Vue.use(VueNumeric)

// Tooltips
// import VTooltip from 'v-tooltip'
// Vue.use(VTooltip)

// Draggable resizable
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
Vue.component('vue-draggable-resizable', VueDraggableResizable)

// Responsive Grid Layout
import VueResponsiveGridLayout from 'vue-responsive-grid-layout'
Vue.use(VueResponsiveGridLayout)

// Vue resize
import 'vue-resize/dist/vue-resize.css'
import VueResize from 'vue-resize'
Vue.use(VueResize)

// Split panel
import VueSplit from 'vue-split-panel'
Vue.use(VueSplit)

// CSS
import './assets/style/mystyle.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

new Vue({
  components: {App},
  store,
  router,
  template: '<App/>'
}).$mount('#app')