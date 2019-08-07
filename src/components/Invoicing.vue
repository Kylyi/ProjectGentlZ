<template>
  <v-layout column xs wrap id="invoicingTable">
    <v-layout row wrap style="background-color: #424242; height: 70px;">

      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Revenues</h3>
      </v-flex>

      <v-flex column grow text-xs-right style="padding: 0px 24px;">
        <v-layout row wrap justify-end align-center>
          <v-flex column shrink>
            <v-btn icon @click="refreshData" title="Refreshes data" :disabled="!waitingChanges">
              <v-icon color="white">fas fa-sync</v-icon>
            </v-btn>
          </v-flex>
          <v-flex column shrink>
            <v-btn @click="setInvoicingBatchUpdateMode(!invoicingBatchUpdateMode)" outline color="white"
              :style="`background-color: ${invoicingBatchUpdateMode ? '#ff5252!important' : ''}; margin: 0;`">Batch mode</v-btn>
          </v-flex>
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
      <resize-observer @notify="handleResize" />
      <v-layout row wrap>
        <v-flex column grow>
          <v-layout row wrap>
            <v-flex column shrink style="padding-left: 8px;">
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-text-field
                    :value="invoicingCompareDate"
                    prepend-icon="event"
                    readonly
                    label="Compare date"
                    v-on="on"
                    hide-details
                    style="margin: 0;"
                  ></v-text-field>
                </template>
                <v-date-picker :value="invoicingCompareDate" @change="changeCompareDate" min="2019-04-01" no-title scrollable> </v-date-picker>
              </v-menu>

            </v-flex>
            <v-flex column shrink style="padding-left: 8px;">
              <v-flex row wrap>
                <v-menu
                  v-model="dateRangeDialog"
                  ref="dateRangeMenu"
                  offset-y
                  min-width="290px"
                  max-width="290px"
                  :close-on-content-click="false"
                  :return-value.sync="dateRange"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" color="accent" outline>Date range</v-btn>
                  </template>
                  <v-date-picker v-model="dateRange" type="month" multiple>
                    <v-spacer></v-spacer>
                    <v-btn flat color="accent" @click="dateRangeDialog = false">Cancel</v-btn>
                    <v-btn flat color="primary" @click="$refs.dateRangeMenu.save(dateRange); callChangeInvoicingDateRange();">OK</v-btn>
                  </v-date-picker>
                </v-menu>

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
            <v-menu offset-y>
              <v-btn slot="activator" icon>
                <v-icon :color="signFilterActive.warning ? 'error' : 'inherit'"
                  :title="filterOnWarningSign ? `Filtered by ${filterOnWarningSign}` : 'Clicking will filter the table by this sign. To reset filter, click active sign.'"
                >
                  warning
                </v-icon>
              </v-btn>
              <v-list>
                <v-list-tile @click="filterSign('Ready & Waiting')" class="iconMenu" style="cursor: pointer;">
                  <v-list-tile-title>Ready & waiting</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="filterSign('ABB fault')" class="iconMenu" style="cursor: pointer;">
                  <v-list-tile-title>ABB fault</v-list-tile-title>
                </v-list-tile>
                <v-list-tile @click="filterSign('Customer fault')" class="iconMenu" style="cursor: pointer;">
                  <v-list-tile-title>Customer fault</v-list-tile-title>
                </v-list-tile>
                <v-divider></v-divider>
                <v-list-tile @click="filterSign('all')" class="iconMenu" style="cursor: pointer;">
                  <v-list-tile-title>All warnings</v-list-tile-title>
                </v-list-tile>
                <v-divider></v-divider>
                <v-list-tile @click="filterSign()" class="iconMenu" style="cursor: pointer;">
                  <v-list-tile-title>Clear filter</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>
            <v-btn icon @click="filterSignOnAll('info')">
              <v-icon :color="signFilterActive.info ? '#4DB6AC' : 'inherit'" title="Clicking will filter the table by this sign. To reset filter, click active sign.">
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

      <v-layout row wrap pt-1 v-if="billings">
        
        <!-- GRID -->
        <v-flex column wrap xs12 v-if="invoicingLastUpdate" :style="`max-height: calc(100vh - ${invoicingBatchUpdateMode ? 418 : 218}px);`">
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
            style="height: 100%; width: 100%;"
            :column-min-width="50"
            @cell-prepared="getConditionalFormatting"
            @row-prepared="rowFormatting"
            :repaint-changes-only="true"
            @selection-changed="selectNet"
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


            <!-- <dx-scrolling mode="virtual" :preload-enabled="true" show-scrollbar="always" :useNative="true" row-rendering-mode="virtual" /> -->
            <dx-scrolling mode="virtual" :preload-enabled="true" show-scrollbar="always" :useNative="true" row-rendering-mode="virtual" />

            <dx-selection
              select-all-mode="page"
              :show-check-boxes-mode="invoicingBatchUpdateMode ? 'always' : 'onLongTap'"
              mode="multiple"
              :allow-select-all="false"
            />

            <dx-master-detail
              :enabled="!invoicingBatchUpdateMode"
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
              :header-filter="(col.value === 'Project Manager' && peoplePmFilter.hasOwnProperty('dataSource')) ? peoplePmFilter : undefined"
              :calculate-filter-expression="(col.value === 'Project Manager' && peoplePmFilter.hasOwnProperty('dataSource')) ? getFiltering : undefined"
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
              :calculate-group-value="groupByQuarter"
              data-type="string"
              caption="Quarter"
              name="groupQuarter"
              :auto-expand-group="true"
            />

            <dx-column
              :visible="false"
              :show-in-column-chooser="false"
              :group-index="3"
              :calculate-group-value="groupByMonth"
              caption="Month"
              :format="x"
              data-type="number"
              name="groupMonth"
            />

            <dx-column
              :visible="false"
              :show-in-column-chooser="false"
              :group-index="invoicingWeekGrouping ? 4 : null"
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
                display-format="{0}"
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
              <!-- <detail-template
                :template-data="data"
              /> -->
              <detail-template-2 :netData="data.data"></detail-template-2>
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
          No data available.
        </v-flex>
      </v-layout>

      <template v-if="selectedNets.length > 0 && invoicingBatchUpdateMode">
        <batch-update :selected-nets="selectedNets" />
      </template>
      <v-layout v-else-if="invoicingBatchUpdateMode" row wrap pt-3>
        Select networks via checkboxes on left side of the 	&nbsp; <b>Revenues</b> 	&nbsp; table.
      </v-layout>

      <v-layout row v-if="selectedNets.length > 0 && invoicingBatchUpdateMode" style="max-height: 210px;">
        <v-tabs style="width: 100%;" >
          <v-tab v-for="(net, idx) in selectedNets" :key="idx">
            <v-layout row>
              <v-flex column grow style="max-width: 212px;">
                <v-flex row style="font-size: smaller; font-weight: bold;">{{net['Network Description']}}</v-flex>
                <v-flex row style="font-size: smaller;" pt-1> {{ net['Project Manager'] }} - {{ net['Network Num'] }} </v-flex>
              </v-flex>
              <v-flex column shrink>
                <v-btn small icon style="margin: 0;" @click="deselectNet(net['Network Num'])"><v-icon>close</v-icon></v-btn>
              </v-flex>
            </v-layout>
          </v-tab>
          <v-tabs-items>
            <v-tab-item v-for="(net, idx) in selectedNets" :key="idx">
            <detail-template-2 :netData="net"></detail-template-2>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-layout>

    </v-container>
  </v-layout>
</template>

<script>
  import localStorage from 'localStorage'
  import {readFile} from '../main/scripts/misc'
  import FormattedCellInvoiceDate from './Invoicing/FormattedCellInvoiceDate.vue'
  import EscalatedCell from './Invoicing/EscalatedCell.vue'
  import FormattedCellDispatchDate from './Invoicing/FormattedCellDispatchDate.vue'
  import DetailTemplate from './Invoicing/DetailTemplate.vue'
  import DetailTemplate2 from './Invoicing/DetailTemplate2.vue'
  import CellTemplate from './Invoicing/CellTemplate.vue'
  import HeaderTemplate from './Invoicing/HeaderTemplate.vue'
  import SsoTemplate from './Invoicing/SsoTemplate.vue'
  import BatchUpdate from './Invoicing/BatchUpdate.vue'
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

      ipcRenderer.on('changeInProjects', (e, docs) => {
        if (docs.change.docs.length > 10) {
          this.waitingChanges = true
          return
        }
        docs.change.docs.forEach(e => {
          const idx = this.billings.map(x => e._id === x._id).indexOf(true)
          Object.keys(e).forEach(k => {
            if (this.billings[idx][k] !== e[k]) {
              this.billings[idx][k] = e[k]
            }
          })
        })
      })

      ipcRenderer.on('invoicingArrReadyFromMain', () => {
        this.billings = this.invoicingFilteredByDateRange
      })

      this.$root.$on('refresh-formatting', () => {
        this.refreshFormatting()
      })

      if (!this.peoplePmFilter.hasOwnProperty('dataSource')) {
        this.setPeopleFilter()
      }

      this.dateRange = JSON.parse(JSON.stringify(this.$store.getters['invoicingDateRange']))
    },
    beforeDestroy() {
      this.setReadOnly(false)
      this.setInvoicingAdminMode(false)
      ipcRenderer.removeAllListeners('changeInProjects')
      ipcRenderer.removeAllListeners('invoicingArrReadyFromMain')
      this.$root.$off('refresh-formatting')
    },
    data: () => ({
      billings: null,
      columns: JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json'), 'utf-8')),
      optionsMenu: false,
      billingsFiltered: false,
      signFilterActive: {warning: false, info: false, arrow_downward: false, arrow_upward: false, error: false},
      fieldSignFilter: null,
      waitingChanges: false,
      selectedNets: [],
      dateRange: [],
      dateRangeDialog: false,
      filterOnWarningSign: '',
      compareDatePicker: false
    }),
    computed: {
      ...mapGetters(['invoicingDateRange', 'invoicingWeekGrouping', 'allProjectsBasic', 'peopleFilter', 'invoicingAdminMode', 'peopleSameLevel', 'invoicingViews', 'peoplePmFilter',
      'invoicingGroupingDate', 'invoicingDatesModified', 'invoicingLastUpdate', 'invoicingCompareDate', 'invoicingFilteredByDateRange', 'invoicingReadOnly', 'userInfo', 'invoicingBatchUpdateMode'])
    },
    methods: {
      ...mapActions(['changeInvoicingDateRange', 'changeWeekGrouping', 'getInvoicingSettings', 'changeCompareDate', 'fetchFilteredInvoicingByDateRange', 'changeGroupingDate', 'setInvoicingAdminMode', 'setPeopleFilter', 'changeInvoicingReadOnly', 'notify', 'setUserView', 'setInvoicingBatchUpdateMode']),
      groupByYear (a) {
        let date

        if (this.invoicingLastUpdate === this.invoicingGroupingDate) {
          date = Object.values(a['Invoice Date']).pop()
        } else {
          date = a['Invoice Date'][this.invoicingGroupingDate]
        }
        return date ? moment(date).format('YYYY') : 'Non-existent'
      },
      groupByQuarter(a) {
        let date

        if (this.invoicingLastUpdate === this.invoicingGroupingDate) {
          date = Object.values(a['Invoice Date']).pop()
        } else {
          date = a['Invoice Date'][this.invoicingGroupingDate]
        }
        return date ? 'Q'+moment(date).quarter() : 'Non-existent'
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
          const lastDate = Object.values(doc['Invoice Date']).pop()
          return (moment(lastDate).format(format) !== moment(doc['Invoice Date'][this.invoicingCompareDate]).format(format))
        })
      },
      async groupingDateChange(e) {
        await this.changeGroupingDate(e)
        this.$refs['invoicingGrid'].instance.refresh()
      },
      filterSign(arg) {
        if (!arg) {
          this.billingsFiltered = false
          this.signFilterActive = {warning: false, info: false, arrow_downward: false, arrow_upward: false, error: false}
          return
        }
        
        if (arg === 'all') {
          this.filterOnWarningSign = ''
          this.signFilterActive = {warning: false, info: false, arrow_downward: false, arrow_upward: false, error: false}
          this.filterSignOnAll('warning')
          return
        }

        this.signFilterActive = {warning: true, info: false, arrow_downward: false, arrow_upward: false, error: false}
        this.filterOnWarningSign = arg

        this.billingsFiltered = this.billings.filter(e => {
          if (e.sign.hasOwnProperty('Network Num') && e.sign['Network Num'].hasOwnProperty('warning')) {
            const argInComment = e.sign['Network Num']['warning'].filter(x => x.faultOrigin === arg)
            return argInComment.length > 0
          }
        })
      },
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
        // this.setPeopleFilter()
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
            color = '#C8E6C9'
          } else if (row.data.sign.hasOwnProperty('Network Num') && row.data.sign['Network Num'].hasOwnProperty('warning')) {
            color = '#FFCDD2'
          } else if (row.data.sign.hasOwnProperty('Network Num') && row.data.sign['Network Num'].hasOwnProperty('arrow_downward')) {
            color = '#FFE0B2'
          } else if (row.data.sign.hasOwnProperty('Network Num') && row.data.sign['Network Num'].hasOwnProperty('arrow_upward')) {
            color = '#B3E5FC'
          }

          row.cellElement.style.backgroundColor = color
        }
      },
      rowFormatting(row) {
        if (row.groupIndex === 2) {
          row.rowElement.style.color = '#ff5252'
        } else {
          row.rowElement.style.color = 'black'
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
      },
      refreshData() {
        this.waitingChanges = false
        this.getInvoicingSettings()
      },
      handleResize() {
        setTimeout(() => {
          this.$refs['invoicingGrid'].instance.updateDimensions()
        }, 300)
      },
      selectNet(e) {
        this.selectedNets = e['selectedRowsData']
      },
      deselectNet(key) {
        this.$refs['invoicingGrid'].instance.deselectRows([key])
      },
      refreshFormatting() {
        this.$refs['invoicingGrid'].instance.refresh(true)
      },
      callChangeInvoicingDateRange() {
        this.changeInvoicingDateRange(this.dateRange)
      }
    },
    components: {
      FormattedCellInvoiceDate,
      CellTemplate,
      HeaderTemplate,
      DetailTemplate,
      DetailTemplate2,
      SsoTemplate,
      EscalatedCell,
      FormattedCellDispatchDate,
      BatchUpdate
    }
  };
</script>

<style>
  #invoicingTable .dx-command-expand {
    width: 10px;
    min-width: 10px;
    max-width: 10px;
  }
  .v-tabs__bar {
    width: calc(100% - 108px);
  }
  #invoicingTable .dx-datagrid-content .dx-datagrid-table .dx-row .dx-command-select {
    max-width: 18px;
    min-width: 18px;
    width: 18px;
  }

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
  .iconMenu:hover {
    background-color: lightgray;
  }
  .dx-datagrid-summary-item {
    color: inherit!important;
  }
</style>