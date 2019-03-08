<template>
  <v-container>
    <v-layout row wrap>
      <v-flex row wrap mb-4 xs10>
        <h3 class="display-2 primary--text"><span class="tit">Invoicing</span></h3>
      </v-flex>
      <v-flex row wrap xs2 text-xs-right>
        <v-menu
          v-model="optionsMenu"
          :close-on-content-click="false"
          :nudge-width="300"
          nudge-left="335"
        >
          <v-btn
            slot="activator"
            outline
            color="primary"
          >
            Options
            <v-icon right>keyboard_arrow_down</v-icon>
          </v-btn>

          <v-card id="optionsMenu">
            <v-list>
              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-list-tile-title>Group via</v-list-tile-title>
                      <v-flex row wrap>
                        <v-btn-toggle v-model="groupingDate" @change="switchGroupingDate">
                          <v-btn flat :value="lastUpdate">
                            Current invoice date
                          </v-btn>
                          <v-btn flat :value="SELECTEDDATE">
                            Selected invoice date
                          </v-btn>
                        </v-btn-toggle
                      ></v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>

              <v-divider></v-divider>

              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-list-tile-title>Week grouping</v-list-tile-title>
                      <v-flex row wrap><v-btn-toggle v-model="weekGrouping" @change="setWeekGrouping">
                        <v-btn flat :value="true">
                          Shown
                        </v-btn>
                        <v-btn flat :value="false">
                          Hidden
                        </v-btn>
                      </v-btn-toggle></v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>

              <v-divider></v-divider>

              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-list-tile-title>Get missing</v-list-tile-title>
                      <v-flex row wrap><v-btn-toggle @change="getMissingBy">
                        <v-btn flat value="MM">
                          By month
                        </v-btn>
                        <v-btn flat value="DD">
                          By day
                        </v-btn>
                        <v-btn flat value="none">
                          Reset
                        </v-btn>
                      </v-btn-toggle></v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>

              <v-divider></v-divider>

              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Select date range</v-list-tile-title>
                    <v-list-tile-action-text>
                      <el-date-picker
                        v-model="dateRange"
                        type="daterange"
                        range-separator="To"
                        start-placeholder="Start date"
                        end-placeholder="End date"
                        format="dd.MM.yyyy"
                        :firstDayOfWeek="1"
                        @change="setInvoicingDateRange"
                      />
                    </v-list-tile-action-text>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn flat @click="optionsMenu = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-flex>
      
      <v-layout row wrap>
        <v-flex column xs6>
          <v-layout align-center justify-start row fill-height>
            <v-flex column xs4>
              <v-text-field
                label="Last update"
                v-model="lastUpdate"
                disabled
              ></v-text-field>
            </v-flex>

            <v-flex column xs6 ml-2>
              <v-autocomplete
                v-model="SELECTEDDATE"
                :items="revisionsAvailable"
                placeholder="Select date to compare with"
                no-data-text="There are no other revisions than the current one."
                label="Compare date"
                @change="changeDate"
              ></v-autocomplete>
            </v-flex>

            <v-flex column xs7>

              <!-- <v-radio-group v-model="groupingDate" row label="Group by" @change="switchGroupingDate" v-if="groupingDate && SELECTEDDATE">
                <v-radio label="Current invoice date" :value="lastUpdate"></v-radio>
                <v-radio label="Selected invoice date" :value="SELECTEDDATE"></v-radio>
              </v-radio-group> -->

            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex column xs6 text-xs-right>
          <v-btn icon @click="filterSignOnAll('warning')"><v-icon :color="signFilterActive.warning ? 'red' : 'inherit'">warning</v-icon></v-btn>
          <v-btn icon @click="filterSignOnAll('info')"><v-icon :color="signFilterActive.info ? 'info' : 'inherit'">info</v-icon></v-btn>
          <v-btn icon @click="filterSignOnAll('check')"><v-icon :color="signFilterActive.check ? 'success' : 'inherit'">check</v-icon></v-btn>
        </v-flex>
        

      </v-layout>
      

      <!-- GRID -->
      <v-flex column wrap xs12 v-if="lastUpdate">
        <dx-data-grid
          ref="invoicingGrid"
          :data-source="billingsFiltered ? billingsFiltered : billings"
          show-borders
          key-expr='_id'
          column-auto-width
          :allow-column-reordering="true"
          :allow-column-resizing="true"
          :row-alternation-enabled="true"
          :show-row-lines="true"
          :show-column-lines="true"
          @context-menu-preparing="setContextMenu"
          >

          <dx-header-filter
            :visible="true"
            :allow-search="true"
          />

          <dx-paging :enabled="false"></dx-paging>

          <!-- <dx-editing
            :allow-updating="true"
            mode="cell"
          /> -->

          <dx-filter-row :visible="true"/>
          <dx-filter-panel :visible="true"/>

          <dx-group-panel
            :visible="true"/>

          <dx-search-panel :visible="true"/>

          <dx-column-chooser :enabled="true"/>

          <dx-column-fixing :enabled="true"/>

          <dx-grouping :context-menu-enabled="false" :auto-expand-all="false"/>

          <dx-selection
            select-all-mode="page"
            show-check-boxes-mode="onLongTap"
            mode="multiple"
          />

          <dx-master-detail
            :enabled="true"
            template="detailTemplate"
          />

          <dx-export
            :enabled="true"
            :allow-export-selected-data="true"
          />

          <dx-state-storing
            :enabled="true"
            type="localStorage"
            storage-key="storage"
            :savingTimeout="2000"
          />

          <dx-column 
            v-for="col in columns"
            :key="col.value"
            :data-field="col.value"
            :caption="col.name"
            :visible="col.visible"
            :data-type="col.dataType"
            :alignment="col.hasOwnProperty('alignment') ? col.alignment : undefined"
            cell-template="cellTemplate"
            :format="col.dataType === 'number' ? '#,##0.##' : col.dataType === 'date' ? 'dd.MM.yyyy' : ''"
            header-cell-template="headerTemplate"
            />

          <dx-column
            :data-field="`inv_date[${lastUpdate}]`"
            caption="Current invoice date"
            data-type="date"
            :format="dateFormatter"
            alignment="center"
            cell-template="cellTemplate"
            :showWhenGrouped="true"
            header-cell-template="headerTemplate"
          />
          
          <dx-column
            :data-field="`inv_date[${SELECTEDDATE}]`"
            caption="Last invoice date"
            data-type="date"
            format="dd.MM.yyyy"
            alignment="center"
            :showWhenGrouped="true"
            header-cell-template="headerTemplate"
          />


          <dx-column
            :visible="false"
            :show-in-column-chooser="false"
            :group-index="0"
            :calculate-group-value="groupByYear"
            caption="Year"
            format="year"
            data-type="date"
            name="groupYear"
          />

          <dx-column
            :visible="false"
            :show-in-column-chooser="false"
            :group-index="1"
            :calculate-group-value="groupByMonth"
            caption="Month"
            :format="x"
            data-type="number"
            name="groupMonth"
          />

          <dx-column
            :visible="false"
            :show-in-column-chooser="false"
            :group-index="2"
            :calculate-group-value="groupByWeek"
            caption="Week"
            data-type="number"
            name="groupWeek"
          />

          <dx-summary>
            <dx-group-item
              column="net_revenues"
              summary-type="sum"
              display-format="Total: {0} CZK"
              :align-by-column="true"
              value-format="#,##0.##"
            />
            <dx-group-item
              :show-in-group-footer="false"
              :align-by-column="true"
              column="project_ob"
              summary-type="sum"
              display-format="Total: {0} CZK"
              value-format="#,##0.##"
            />
            <dx-group-item
              :show-in-group-footer="false"
              column="_id"
              summary-type="count"
              display-format="SDs: {0}"
            />
            <dx-group-item
              :show-in-group-footer="false"
              :align-by-column="true"
              column="net_panels_no"
              summary-type="sum"
              display-format="Total: {0} panels."
            />
          </dx-summary>

          <div
            slot="formattedCell"
            slot-scope="data">
            <formatted-cell :cell-data="data" :dates="[lastUpdate, SELECTEDDATE]"/>
          </div>

          <div
            slot="cellTemplate"
            slot-scope="data">
            <cell-template
              :template-data="data"
              :signs="data.data.sign"
            />
          </div>

          <div
            slot="detailTemplate"
            slot-scope="data">
            <detail-template
              :template-data="data"
            />
          </div>

          <div
            slot="headerTemplate"
            slot-scope="data">
            <header-template
              :template-data="data"
              :header-filter="fieldSignFilter"
            />
          </div>

        </dx-data-grid>
      </v-flex>

      <v-flex column xs12 wrap style="height: 100px;" v-else mt-5 text-xs-center class="tit">
        First, you must import <b>invoicing data</b>. You can do that by clicking on <i>Invoicing</i> > <i>Import data</i> in left side navigation bar. 
      </v-flex>
    </v-layout>
  </v-container>
  
</template>

<style>
  .dx-header-row {
    font-weight: bold;
    color: #1976D2;
  }

  .dx-datagrid-rowsview .dx-row > .dx-master-detail-cell {
    padding: 0;
  }
  #optionsMenu > div.v-list.theme--light div {
    height: inherit;
    box-shadow: none;
    margin-bottom: 2px;
    /* margin-top: 3px; */
  }

  #optionsMenu > div.v-list.theme--light > div:not(:first-child) {
    margin-top: 15px;
  }

  #optionsMenu .v-btn--active {
    border: 1px solid #1976d2 !important;
    color: #1976d2;
    border-radius: 10px !important;
  }

  #optionsMenu .v-btn {
    border-radius: 10px !important;
  }

  .v-list__tile__content {
    height: fit-content !important;
  }

  .dx-datagrid .dx-column-indicators {
    float: right!important;
  }

  td[role=columnheader] {
    text-align: center !important;
  }

  td[role=columnheader] > .dx-header-filter-indicator {
    width: 100%;
  }
</style>



<script>
  import { DxDataGrid, DxColumnFixing, DxColumn, DxSelection, DxSummary, DxGroupItem, DxSortByGroupSummaryInfo, DxMasterDetail, DxStateStoring, DxHeaderFilter, DxGrouping, DxColumnChooser, DxGroupPanel, DxSearchPanel, DxFilterPanel, DxFilterRow, DxEditing, DxExport, DxPaging } from 'devextreme-vue/data-grid'
  import db from '../main/scripts/database'
  import localStorage from 'localStorage'
  import config from 'devextreme/core/config'
  config({
    decimalSeparator: ",",
    thousandsSeparator: " "
  })

  import {readFile} from '../main/scripts/misc'
  import FormattedCell from './Invoicing/FormattedCell.vue'
  import DetailTemplate from './Invoicing/DetailTemplate.vue'
  import CellTemplate from './Invoicing/CellTemplate.vue'
  import HeaderTemplate from './Invoicing/HeaderTemplate.vue'
  const moment = require('moment')
  const path = require('path')

  export default {
    name: 'Invoicing',
    beforeCreate: async function () {

      async function getBillings() {
        const billings = await db.billings.find({
          selector: {}
        })
        return billings.docs
      }

      const revisions = await db.settings.get('billings')
      
      this.revisionsAvailable = await revisions.dates_modified.slice(0, -1)
      this.lastUpdate = await revisions.dates_modified.pop()
      
      const groupingDate = localStorage.getItem('invoicing') ? JSON.parse(localStorage.getItem('invoicing'))['groupingDate'] : this.lastUpdate
      this.groupingDate = groupingDate !== undefined ? groupingDate !== undefined ? groupingDate : this.lastUpdate : this.lastUpdate

      const weekGrouping = localStorage.getItem('invoicing') ? JSON.parse(localStorage.getItem('invoicing'))['weekGrouping'] : null
      this.weekGrouping = weekGrouping !== undefined ? weekGrouping !== null ? weekGrouping : true : true

      const dateRange = localStorage.getItem('invoicing') ? JSON.parse(localStorage.getItem('invoicing'))['dateRange'] : null
      this.dateRange = dateRange !== undefined ? dateRange !== null ? dateRange : [moment(new Date()).subtract(1, 'months').toISOString().substr(0, 10), moment(new Date()).add(1, 'months').toISOString().substr(0, 10)] : [moment(new Date()).subtract(1, 'months').toISOString().substr(0, 10), moment(new Date()).add(1, 'months').toISOString().substr(0, 10)]
    
      const billings = await getBillings()

      this.billings = billings.filter(e => {
        return (e['inv_date'][this.lastUpdate] >= this.dateRange[0] && e['inv_date'][this.lastUpdate] <= this.dateRange[1])
      })
    
    },
    data: () => ({
      SELECTEDDATE: localStorage.getItem('invoicing') ? JSON.parse(localStorage.getItem('invoicing'))['selectedDate'] : null,
      billings: [],
      columns: JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json'), 'utf-8')),
      lastUpdate: null,
      revisionsAvailable: [],
      groupingDate: null,
      optionsMenu: false,
      weekGrouping: null,
      billingsFiltered: false,
      signFilterActive: {warning: false, info: false, check: false},
      fieldSignFilter: null,
      dateRange: []
    }),
    methods: {
      switchGroupingDate(e) {
        this.$refs.invoicingGrid.instance.refresh()
        const invObjOld = JSON.parse(localStorage.getItem('invoicing'))
        localStorage.setItem('invoicing', JSON.stringify(Object.assign({}, invObjOld, {groupingDate: e})))
      },
      setWeekGrouping (e) {
        if (e) this.$refs.invoicingGrid.instance.columnOption('groupWeek', 'groupIndex', 2)
        else this.$refs.invoicingGrid.instance.columnOption('groupWeek', 'groupIndex', undefined)
        const invObjOld = JSON.parse(localStorage.getItem('invoicing'))
        localStorage.setItem('invoicing', JSON.stringify(Object.assign({}, invObjOld, {weekGrouping: e})))
      },
      changeDate (date) {
        const invObjOld = JSON.parse(localStorage.getItem('invoicing'))
        localStorage.setItem('invoicing', JSON.stringify(Object.assign({}, invObjOld, {selectedDate: date})))
      },
      groupByYear (a) {
        return moment(a['inv_date'][this.groupingDate]).format('YYYY')
      },
      groupByMonth (a) {
        return moment(a['inv_date'][this.groupingDate]).month()
      },
      groupByWeek (a) {
        return moment(a['inv_date'][this.groupingDate]).week()
      },
      x (x) {
        return moment(x+1, 'MM').format('MMMM')
      },
      dateFormatter (date) {
        return moment(date).format('DD.MM.YYYY')
      },
      async getMissingBy(format) {
        let a = await db.billings.find({ selector: {} })
        if (format === "none") return this.billings = a.docs

        return this.billings = a.docs.filter(doc => {
          return moment(doc['inv_date'][this.lastUpdate]).format(format) !== moment(doc['inv_date'][this.SELECTEDDATE]).format(format)
        })
      },
      async setInvoicingDateRange (e) {
        const invObjOld = JSON.parse(localStorage.getItem('invoicing'))
        const fromDate = moment(e[0]).toISOString().substr(0, 10)
        const toDate = moment(e[1]).toISOString().substr(0, 10)

        localStorage.setItem('invoicing', JSON.stringify(Object.assign({}, invObjOld, {dateRange: [fromDate, toDate]})))
        async function getBillings() {
          const billings = await db.billings.find({
            selector: {}
          })
          return billings.docs
        }

        const billings = await getBillings()
        this.billings = billings.filter(x => {
          return (x['inv_date'][this.lastUpdate] >= fromDate && x['inv_date'][this.lastUpdate] <= toDate)
        })
      },
      setContextMenu (e) {
       if (e.target === 'header') {
        e.items.push({text: 'Find warnings', beginGroup: true, value: e.column.dataField, icon: 'warning', onItemClick: this.u})
        e.items.push({text: 'Find check', value: e.column.dataField, icon: 'check', onItemClick: this.u})
        e.items.push({text: 'Find flagged', value: e.column.dataField, icon: 'info', onItemClick: this.u})
        e.items.push({text: 'Reset', value: null, onItemClick: this.u})
        return e
       }
      },
      u (e) {
        const field = e.itemData.value
        if (!field) {
          this.fieldSignFilter = null
          return this.billingsFiltered = false
        }
        const icon = e.itemData.icon
        this.fieldSignFilter = {[field]: icon}

        this.billingsFiltered = this.billings.filter(x => {
          let res = false
          if (x.sign.hasOwnProperty(field)) {
            res = Object.keys(x.sign[field]).includes(icon)
          }
          return res
        })

      },
      filterSignOnAll (sign) {
        if (this.signFilterActive[sign] === true) {
          this.signFilterActive[sign] = false
          return this.billingsFiltered = false
        }

        this.signFilterActive = {warning: false, info: false, check: false} 
        this.billingsFiltered = this.billings.filter(x => {
          let res = false
          res = Object.keys(x.sign).filter(e => {
            // return x.sign[e].find(u => u.startsWith(sign))
            return Object.keys(x.sign[e]).includes(sign)
          })

          return res.length > 0
        })
        this.signFilterActive[sign] = true
      }
    },
    components: {
      DxDataGrid,
      DxColumn,
      DxSelection,
      DxSummary,
      DxGroupItem,
      DxSortByGroupSummaryInfo,
      FormattedCell,
      DxMasterDetail,
      DxStateStoring,
      DxHeaderFilter,
      DxGrouping,
      DxColumnChooser,
      DxGroupPanel,
      DxSearchPanel,
      DxFilterPanel,
      DxFilterRow,
      DetailTemplate,
      DxEditing,
      DxExport,
      CellTemplate,
      DxPaging,
      DxColumnFixing,
      HeaderTemplate
    }
  };
</script>