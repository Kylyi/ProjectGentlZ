<template>
  <v-layout column xs wrap id="invoicingTable">
    <v-layout row wrap style="background-color: #424242; height: 70px;">

      <!-- <v-btn v-shortkey="['ctrl', 'alt', 'a']" @shortkey="triggerAdminMode" style="display: none;">
      </v-btn> -->

      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Invoicing</h3>
      </v-flex>

      <!-- MENU -->
      <v-flex column grow text-xs-right style="padding: 0px 24px;">
        <v-layout row wrap justify-end align-center>
          <v-flex v-if="userInfo.roles.includes('invoicingAdmin')" column shrink>
            <v-btn outline
              color="white"
              :style="`background-color: ${invoicingAdminMode ? '#ff5252!important' : ''}`"
              @click="triggerAdminMode"
            >
              Admin mode</v-btn>
          </v-flex>
          <v-flex column shrink v-else>
            <v-btn outline
              color="white"
              :style="`background-color: ${invoicingReadOnly ? '#ff5252!important' : ''}`"
              @click="setReadOnly(!invoicingReadOnly)"
            >
              Readonly</v-btn>
          </v-flex>
          <v-flex column shrink>
            <v-menu
              v-model="optionsMenu"
              :close-on-content-click="false"
              :nudge-width="300"
              nudge-left="335"
              >
              <v-btn fab  slot="activator">
                <v-icon color="primary" >
                  fas fa-cogs
                </v-icon>
              </v-btn>

              <v-card id="optionsMenu">
                <v-list>
                  <v-divider></v-divider>

                  <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-action-text>
                          <v-list-tile-title>Week grouping</v-list-tile-title>
                          <v-flex row wrap>
                            <v-btn-toggle :value="invoicingWeekGrouping" @change="changeWeekGrouping" mandatory>
                              <v-btn flat color="primary" :value="true">
                                Shown
                              </v-btn>
                              <v-btn flat color="primary" :value="false">
                                Hidden
                              </v-btn>
                            </v-btn-toggle>
                          </v-flex>

                        </v-list-tile-action-text>

                    </v-list-tile-content>
                  </v-list-tile>

                  <v-divider></v-divider>

                  <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-action-text>
                          <v-list-tile-title>Get missing</v-list-tile-title>
                          <v-flex row wrap><v-btn-toggle @change="getMissingBy">
                            <v-btn flat color="primary" value="YYYY-MM">
                              By month
                            </v-btn>
                            <v-btn flat color="primary" value="YYYY-MM-DD">
                              By day
                            </v-btn>
                            <!-- <v-btn flat value="none">
                              Reset
                            </v-btn> -->
                          </v-btn-toggle></v-flex>

                        </v-list-tile-action-text>

                    </v-list-tile-content>
                  </v-list-tile>

                  <v-divider></v-divider>

                  <!-- <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-action-text>
                          <v-list-tile-title>Select date range</v-list-tile-title>
                          <el-date-picker
                            :value="invoicingDateRange"
                            type="daterange"
                            range-separator="To"
                            start-placeholder="Start date"
                            end-placeholder="End date"
                            format="dd.MM.yyyy"
                            :firstDayOfWeek="1"
                            @input="changeInvoicingDateRange"
                          />
                        </v-list-tile-action-text>
                    </v-list-tile-content>
                  </v-list-tile> -->

                  <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-action-text>
                          <v-list-tile-title>Grouping via</v-list-tile-title>
                          <v-flex row wrap>
                            <v-btn-toggle :value="invoicingGroupingDate" @change="groupingDateChange" mandatory>
                              <v-btn flat color="primary" :value="invoicingLastUpdate">
                                Current date
                              </v-btn>
                              <v-btn flat color="primary" :value="invoicingCompareDate" :disabled="!invoicingCompareDate">
                                Compare date
                              </v-btn>
                            </v-btn-toggle>
                          </v-flex>

                        </v-list-tile-action-text>

                    </v-list-tile-content>
                  </v-list-tile>

                  <v-list-tile>
                    <v-list-tile-content>
                        <v-list-tile-action-text>
                          <v-list-tile-title>Views</v-list-tile-title>
                          <v-autocomplete
                            :items="Object.keys(invoicingViews)"
                            hint="Available views"
                            persistent-hint
                            @change="loadView"
                          />
                          <v-btn outline @click="saveView" style="margin-left: 0;">Save current view globally</v-btn>
                          <br>
                          <v-btn outline color="primary" @click="restoreView" style="margin-left: 0;">Restore to default view</v-btn>
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
        </v-layout>
      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <v-flex column grow>
          <v-layout row wrap>
            <v-flex column shrink style="padding-left: 8px;">
              <v-combobox
                :value="invoicingCompareDate"
                :items="invoicingDatesModified"
                placeholder="Select date to compare with"
                no-data-text="There are no other revisions than the current one."
                label="Compare date"
                @change="changeCompareDate"
              ></v-combobox>
            </v-flex>
            <v-flex column shrink style="padding-left: 8px;">
              <v-flex row wrap>
                <label class="v-label theme--light" style="font-size: 13px;">Date range</label>
              </v-flex>
              <v-flex row wrap>
                <el-date-picker
                  :value="invoicingDateRange"
                  type="daterange"
                  range-separator="To"
                  start-placeholder="Start date"
                  end-placeholder="End date"
                  format="dd.MM.yyyy"
                  :firstDayOfWeek="1"
                  @input="changeInvoicingDateRange"
                  style="max-width: 270px; margin-top: -3px;"
                  size="small"
                  :clearable="false"
                />
              </v-flex>
            </v-flex>
          </v-layout>
          
        </v-flex>
        <v-flex column shrink>
          <v-layout row wrap justify-center align-center fill-height>
            <v-btn icon @click="filterSignOnAll('error')">
              <v-icon :color="signFilterActive.error ? 'error' : 'inherit'" title="Clicking will filter the table by this sign. To reset filter, click active sign.">
                error
              </v-icon>
            </v-btn>
            <v-btn icon @click="filterSignOnAll('warning')">
              <v-icon :color="signFilterActive.warning ? 'error' : 'inherit'" title="Clicking will filter the table by this sign. To reset filter, click active sign.">
                warning
              </v-icon>
            </v-btn>
            <v-btn icon @click="filterSignOnAll('info')">
              <v-icon :color="signFilterActive.info ? 'info' : 'inherit'" title="Clicking will filter the table by this sign. To reset filter, click active sign.">
                info
              </v-icon>
            </v-btn>
            <v-btn icon @click="filterSignOnAll('arrow_upward')">
              <v-icon :color="signFilterActive.arrow_upward ? 'success' : 'inherit'" title="Clicking will filter the table by this sign. To reset filter, click active sign.">
                arrow_upward
              </v-icon>
            </v-btn>
            <v-btn icon @click="filterSignOnAll('arrow_downward')">
              <v-icon :color="signFilterActive.arrow_downward ? 'warning' : 'inherit'" title="Clicking will filter the table by this sign. To reset filter, click active sign.">
                arrow_downward
              </v-icon>
            </v-btn>
          </v-layout>
        </v-flex>
      </v-layout>

      <v-layout row wrap v-if="billings">
        
        <!-- GRID -->
        <v-flex column wrap xs12 v-if="invoicingLastUpdate" style="max-height: calc(100vh - 218px)">
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
            :word-wrap-enabled="true"
            style="height: 100%; width:100%;"
            :column-min-width="50"
            @cell-prepared="getConditionalFormatting"
          >
            <!-- <dx-load-panel :enabled="false" text="Kill me please"></dx-load-panel> -->
            <dx-header-filter
              :visible="true"
              :allow-search="true"
            />

            <dx-filter-row :visible="true"/>
            <dx-filter-panel :visible="true"/>

            <dx-group-panel
              :visible="true"/>

            <dx-search-panel :visible="true"/>

            <dx-column-chooser :enabled="true"/>

            <dx-grouping :context-menu-enabled="false" :auto-expand-all="false" :allow-collapsing="true"/>
            <!-- <dx-grouping :context-menu-enabled="false" :auto-expand-all="false" expandMode="rowClick" :allow-collapsing="true"/> -->
            <dx-scrolling mode="virtual" :preload-enabled="true" show-scrollbar="always" :useNative="true" row-rendering-mode="virtual" />

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
              :alignment="col.alignment || undefined"
              :cell-template="col.cellTemplate || undefined"
              :format="col.dataType === 'number' ? '#,##0' : col.dataType === 'date' ? 'dd.MM.yy' : ''"
              :width="col.width || ''"
              :header-filter="(col.value === 'Project Manager' && invoicingAdminMode) ? peopleFilter : undefined"
              :calculate-filter-expression="(col.value === 'Project Manager' && invoicingAdminMode) ? getFiltering : undefined"
            />

            <dx-column
              :calculate-cell-value="getLastInvoiceDate"
              caption="Current invoice date"
              data-type="date"
              format="dd.MM.yy"
              alignment="center"
              :showWhenGrouped="true"
              width="100px"
              cell-template="formattedCellInvoiceDate"
              :allow-filtering="true"
              :allow-sorting="true"
              name="invoiceDate"
            />
            
            <dx-column
              :data-field="`Invoice Date[${invoicingCompareDate}]`"
              caption="Last invoice date"
              data-type="date"
              format="dd.MM.yy"
              alignment="center"
              :showWhenGrouped="true"
              width="100px"
              :allow-search="true"
            />

            <!-- GROUPING -->
            <dx-column
              data-field="Plant"
              :visible="false"
              :show-in-column-chooser="false"
              :group-index="0"
              caption="Plant"
              name="groupPlant"
              :auto-expand-group="true"
            />

            <dx-column
              :visible="false"
              :show-in-column-chooser="false"
              :group-index="1"
              :calculate-group-value="groupByYear"
              caption="Year"
              format="year"
              data-type="date"
              name="groupYear"
              :auto-expand-group="true"
            />

            <dx-column
              :visible="false"
              :show-in-column-chooser="false"
              :group-index="2"
              :calculate-group-value="groupByMonth"
              caption="Month"
              :format="x"
              data-type="number"
              name="groupMonth"
            />

            <dx-column
              :visible="false"
              :show-in-column-chooser="false"
              :group-index="invoicingWeekGrouping ? 3 : null"
              :calculate-group-value="groupByWeek"
              caption="Week"
              data-type="number"
              name="groupWeek"
            />

            <dx-summary>
              <dx-group-item
                column="Revenues"
                summary-type="sum"
                display-format="{0}"
                :align-by-column="true"
                value-format="#,##0"
              />
              <dx-group-item
                :show-in-group-footer="false"
                :align-by-column="true"
                column="Project OB"
                summary-type="sum"
                display-format="{0}"
                value-format="#,##0"
              />
              <dx-group-item
                :show-in-group-footer="false"
                column="_id"
                summary-type="count"
                display-format="{0}"
              />
              <dx-group-item
                :show-in-group-footer="false"
                :align-by-column="true"
                column="Number of Panels"
                summary-type="sum"
                display-format="{0}"
              />
              <dx-group-item
                :show-in-group-footer="false"
                :align-by-column="true"
                column="Number of Modules"
                summary-type="sum"
                display-format="{0} modules"
              />
            </dx-summary>

            <v-layout row wrap
              slot="netDescrCell"
              slot-scope="data"
            >
              {{data.displayValue}}
            </v-layout>

            <div
              slot="formattedCellInvoiceDate"
              slot-scope="data">
              <formatted-cell-invoice-date :template-data="data"/>
            </div>

            <div
              slot="formattedCellDispatchDate"
              slot-scope="data">
              <formatted-cell-dispatch-date :template-data="data"/>
            </div>

            <div
              slot="escalatedCell"
              slot-scope="data">
              <escalated-cell :template-data="data"/>
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
              slot="ssoTemplate"
              slot-scope="data">
              <sso-template :template-data="data" />
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
  </v-layout>
</template>

<style>
  #invoicingTable .dx-datagrid-rowsview td {
    color: black;
  }

  #invoicingTable .dx-command-expand {
    width: 10px;
    min-width: 10px;
    max-width: 10px;
  }

  /* #invoicingTable .dx-scrollable-container {
    overflow: auto;
  } */

  #invoicingTable .dx-group-cell{
    border-right: 1px solid #ddd;
  }

  #invoicingTable td.dx-group-cell ~ td[role=gridcell] {
    border-right: 1px solid #ddd;
    border-left: 1px solid #ddd;
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
    border: 1px solid #ff5252 !important;
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

  .dx-master-detail-cell{
    padding: 0px !important;  
  }
</style>



<script>
  import localStorage from 'localStorage'
  import {readFile} from '../main/scripts/misc'
  import FormattedCellInvoiceDate from './Invoicing/FormattedCellInvoiceDate.vue'
  import EscalatedCell from './Invoicing/EscalatedCell.vue'
  import FormattedCellDispatchDate from './Invoicing/FormattedCellDispatchDate.vue'
  import DetailTemplate from './Invoicing/DetailTemplate.vue'
  import CellTemplate from './Invoicing/CellTemplate.vue'
  import HeaderTemplate from './Invoicing/HeaderTemplate.vue'
  import SsoTemplate from './Invoicing/SsoTemplate.vue'
  import { mapGetters, mapActions } from 'vuex';
  import { ipcRenderer } from 'electron';
  const moment = require('moment')
  const path = require('path')

  export default {
    name: 'Invoicing',
    created: async function () {
      this.getInvoicingSettings()
      if (this.userInfo.roles.includes('invoicingReader') && !this.userInfo.roles.includes('invoicingAdmin')) {
        this.setReadOnly(true)
      }

      ipcRenderer.on('invoicingArrReadyFromMain', () => {
        this.billings = this.invoicingFilteredByDateRange
      })
    },
    beforeDestroy() {
      this.setReadOnly(false)
      this.setInvoicingAdminMode(false)
    },
    data: () => ({
      billings: null,
      columns: JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json'), 'utf-8')),
      optionsMenu: false,
      billingsFiltered: false,
      signFilterActive: {warning: false, info: false, arrow_downward: false, arrow_upward: false, error: false},
      fieldSignFilter: null,
    }),
    computed: {
      ...mapGetters(['invoicingDateRange', 'invoicingWeekGrouping', 'allProjectsBasic', 'peopleFilter', 'invoicingAdminMode', 'peopleSameLevel', 'invoicingViews',
      'invoicingGroupingDate', 'invoicingDatesModified', 'invoicingLastUpdate', 'invoicingCompareDate', 'invoicingFilteredByDateRange', 'invoicingReadOnly', 'userInfo'])
    },
    methods: {
      ...mapActions(['changeInvoicingDateRange', 'changeWeekGrouping', 'getInvoicingSettings', 'changeCompareDate', 'fetchFilteredInvoicingByDateRange', 'changeGroupingDate', 'setInvoicingAdminMode', 'setPeopleFilter', 'changeInvoicingReadOnly', 'notify', 'setUserView']),
      groupByYear (a) {
        let date

        if (this.invoicingLastUpdate === this.invoicingGroupingDate) {
          date = Object.values(a['Invoice Date']).pop()
        } else {
          date = a['Invoice Date'][this.invoicingGroupingDate]
        }
        return date ? moment(date).format('YYYY') : 'Non-existent'
      },
      groupByMonth (a) {
        let date

        if (this.invoicingLastUpdate === this.invoicingGroupingDate) {
          date = Object.values(a['Invoice Date']).pop()
        } else {
          date = a['Invoice Date'][this.invoicingGroupingDate]
        }
        return date ? moment(date).month() : 'Non-existent'
      },
      groupByWeek (a) {
        let date

        if (this.invoicingLastUpdate === this.invoicingGroupingDate) {
          date = Object.values(a['Invoice Date']).pop()
        } else {
          date = a['Invoice Date'][this.invoicingGroupingDate]
        }
        return date ? moment(date).week() : 'Non-existent'
      },
      x (x) {
        return moment(x+1, 'MM').format('MMMM')
      },
      dateFormatter (date) {
        return moment(date).format('DD.MM.YYYY')
      },
      async getMissingBy(format) {
        if (!format) return this.billingsFiltered = false
        return this.billingsFiltered = this.billings.filter(doc => {
          return (moment(doc['Invoice Date'][this.invoicingLastUpdate]).format(format) !== moment(doc['Invoice Date'][this.invoicingCompareDate]).format(format))
        })
      },
      async groupingDateChange(e) {
        await this.changeGroupingDate(e)
        this.$refs['invoicingGrid'].instance.refresh()
      },
      async t() {
        console.log(this.$refs['invoicingGrid'].instance.columnOption('Project Manager'))
      },
      // setContextMenu (e) {
      //  if (e.target === 'header') {
      //   e.items.push({text: 'Find warnings', beginGroup: true, value: e.column.dataField, icon: 'warning', onItemClick: this.u})
      //   e.items.push({text: 'Find flagged', value: e.column.dataField, icon: 'info', onItemClick: this.u})
      //   e.items.push({text: 'Find up', value: e.column.dataField, icon: 'arrowup', onItemClick: this.u})
      //   e.items.push({text: 'Find down', value: e.column.dataField, icon: 'arrowdown', onItemClick: this.u})
      //   e.items.push({text: 'Reset', value: null, onItemClick: this.u})
      //   return e
      //  }
      // },
      // u (e) {
      //   const field = e.itemData.value
      //   if (!field) {
      //     this.fieldSignFilter = null
      //     return this.billingsFiltered = false
      //   }
      //   const icon = e.itemData.icon.startsWith('arrow') ? e.itemData.icon.substr(0,5) + "_" + e.itemData.icon.substr(5)+"ward" : e.itemData.icon
      //   this.fieldSignFilter = {[field]: icon}

      //   this.billingsFiltered = this.billings.filter(x => {
      //     let res = false
      //     if (x.sign.hasOwnProperty(field)) {
      //       res = Object.keys(x.sign[field]).includes(icon)
      //     }
      //     return res
      //   })

      // },
      filterSignOnAll (sign) {
        if (this.signFilterActive[sign] === true) {
          this.signFilterActive[sign] = false
          return this.billingsFiltered = false
        }

        this.signFilterActive = {warning: false, info: false, arrow_downward: false, arrow_upward: false, error: false}

        if (sign !== 'error') {
          this.billingsFiltered = this.billings.filter(x => {
            let res = false
            res = Object.keys(x.sign).filter(e => {
              // return x.sign[e].find(u => u.startsWith(sign))
              return Object.keys(x.sign[e]).includes(sign)
            })

            return res.length > 0
          })
        } else {
          this.billingsFiltered = this.billings.filter(x => x['Tolerated delay'] === 'X')
        }

        this.signFilterActive[sign] = true
      },
      restoreView() {
        const cnf = confirm('Do you really want to restore view?')
        if (!cnf) return
        let currentState = this.$refs['invoicingGrid'].instance.state()
        currentState.columns = this.columns
        this.$refs['invoicingGrid'].instance.state(currentState)
        this.changeWeekGrouping(false)
      },
      calcFatValue(rowData) {
        if (rowData['FAT Fixed Date']) {
          return rowData['FAT Fixed Date']
        } else {
          return 'no FAT'
        }
      },
      triggerAdminMode() {
        this.setPeopleFilter()
        this.setInvoicingAdminMode(true)
        this.changeInvoicingReadOnly(false)
      },
      getFiltering(value, operation, target) {
        if (target === 'headerFilter') {
          let filterExpr = [['Project Manager', '=', value.val]]

          this.peopleSameLevel.forEach(p => {
            if (p.supervisors.includes(value.lookup)) {
              filterExpr.push('or')
              filterExpr.push(['Project Manager', '=', p.sapUsername])
            }
          })
          return filterExpr
        }
      },
      async getConditionalFormatting(row) {
        if (row.column.caption === 'Net description' && row.rowType === 'data') {
          let color

          if (row.data['Net Status from Tasks'] === 'E') {
            color = '#B3E5FC'
          } else if (row.data.sign.hasOwnProperty('Network Num') && row.data.sign['Network Num'].hasOwnProperty('warning')) {
            color = '#FFCDD2'
          } else if (row.data.sign.hasOwnProperty('Network Num') && row.data.sign['Network Num'].hasOwnProperty('arrow_downward')) {
            color = '#FFE0B2'
          } else if (row.data.sign.hasOwnProperty('Network Num') && row.data.sign['Network Num'].hasOwnProperty('arrow_upward')) {
            color = '#C8E6C9'
          }

          row.cellElement.style.backgroundColor = color
        }

      },
      getLastInvoiceDate(row) {
        const lastDate = Object.values(row['Invoice Date']).pop()
        return new Date(lastDate)
      },
      setReadOnly(val) {
        if (this.invoicingAdminMode && val) {
          this.notify({
            text: 'You are already in Admin mode.',
            color: 'info',
            state: true
          })
          return
        }

        this.setInvoicingAdminMode(val)
        this.changeInvoicingReadOnly(val)
      },
      saveView() {
        try {
          const cnf = confirm('Do you really want to save current view?')
          if (!cnf) return
          let currentState = this.$refs['invoicingGrid'].instance.state()
          this.setUserView(currentState.columns)
          this.notify({
            text: 'Saved.',
            color: 'success',
            state: true
          })
        } catch (err) {
          this.notify({
            text: err,
            color: 'error',
            state: true
          })
        }
      },
      loadView(e) {
        let currentState = this.$refs['invoicingGrid'].instance.state()
        currentState.columns = this.invoicingViews[e]
        this.$refs['invoicingGrid'].instance.state(currentState)
      }
    },
    components: {
      FormattedCellInvoiceDate,
      CellTemplate,
      HeaderTemplate,
      DetailTemplate,
      SsoTemplate,
      EscalatedCell,
      FormattedCellDispatchDate
    }
  };
</script>