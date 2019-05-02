<template>
  <v-layout column xs wrap id="invoicingTable">
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Invoicing</h3>
      </v-flex>

      <!-- MENU -->
      <v-flex column grow text-xs-right style="padding: 0px 24px;">
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
              <!-- DEVTODO -->
              <!-- <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-list-tile-title>Group via</v-list-tile-title>
                      <v-flex row wrap>
                        <v-btn-toggle :value="invoicingGroupingDate" @change="changeGroupingDate">
                          <v-btn flat :value="invoicingLastUpdate">
                            Current invoice date
                          </v-btn>
                          <v-btn flat :value="invoicingCompareDate">
                            Compare date
                          </v-btn>
                        </v-btn-toggle
                      ></v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile> -->

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
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-list-tile-title>Restore view</v-list-tile-title>
                      <v-btn outline color="primary" @click="restoreView">Restore to default view</v-btn>
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

    <v-container fluid>
      <v-layout row wrap>
        <v-flex column grow>
          <v-layout row wrap>
            <v-flex column shrink>
              <v-text-field
                label="Last update"
                v-model="invoicingLastUpdate"
                disabled
              ></v-text-field>
            </v-flex>
            <v-flex column shrink>
              <v-autocomplete
                :value="invoicingCompareDate"
                :items="invoicingDatesModified"
                placeholder="Select date to compare with"
                no-data-text="There are no other revisions than the current one."
                label="Compare date"
                @change="changeCompareDate"
              ></v-autocomplete>
            </v-flex>
          </v-layout>
          
        </v-flex>
        <v-flex column shrink>
          <v-btn icon @click="filterSignOnAll('warning')">
            <v-icon :color="signFilterActive.warning ? 'red' : 'inherit'" title="Clicking will filter the table by this sign. To reset filter, click active sign.">
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
        </v-flex>
      </v-layout>

      <v-layout row wrap v-if="billings">
        
        <!-- GRID -->
        <v-flex column wrap xs12 v-if="invoicingLastUpdate" style="max-height: 80vh;">
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
            :word-wrap-enabled="true"
            style="height: 100%; width:100%;"
            :column-min-width="50"
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

            <dx-grouping :context-menu-enabled="false" :auto-expand-all="false" expandMode="rowClick" :allow-collapsing="true"/>
            <dx-scrolling mode="virtual" show-scrollbar="never" />

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
            />

            <dx-column
              :data-field="`Invoice Date[${invoicingLastUpdate}]`"
              caption="Current invoice date"
              data-type="date"
              format="dd.MM.yy"
              alignment="center"
              :showWhenGrouped="true"
              width="120px"
              cell-template="formattedCell"
            />
            
            <dx-column
              :data-field="`Invoice Date[${invoicingCompareDate}]`"
              caption="Last invoice date"
              data-type="date"
              format="dd.MM.yy"
              alignment="center"
              :showWhenGrouped="true"
              width="120px"
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

            <div
              slot="formattedCell"
              slot-scope="data">
              <formatted-cell :template-data="data"/>
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

  #invoicingTable .dx-scrollable-container {
    overflow: auto;
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
</style>



<script>
  import localStorage from 'localStorage'
  import {readFile} from '../main/scripts/misc'
  import FormattedCell from './Invoicing/FormattedCell.vue'
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
      ipcRenderer.on('invoicingArrReadyFromMain', () => {
        this.billings = this.invoicingFilteredByDateRange
      })
    },
    data: () => ({
      billings: null,
      columns: JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json'), 'utf-8')),
      optionsMenu: false,
      billingsFiltered: false,
      signFilterActive: {warning: false, info: false, arrow_downward: false, arrow_upward: false},
      fieldSignFilter: null,
    }),
    computed: {
      ...mapGetters(['invoicingDateRange', 'invoicingWeekGrouping', 'allProjectsBasic',
      'invoicingGroupingDate', 'invoicingDatesModified', 'invoicingLastUpdate', 'invoicingCompareDate', 'invoicingFilteredByDateRange'])
    },
    methods: {
      ...mapActions(['changeInvoicingDateRange', 'changeWeekGrouping', 'getInvoicingSettings', 'changeCompareDate', 'fetchFilteredInvoicingByDateRange', 'changeGroupingDate']),
      groupByYear (a) {
        return moment(a['Invoice Date'][this.invoicingGroupingDate]).format('YYYY')
      },
      groupByMonth (a) {
        return moment(a['Invoice Date'][this.invoicingGroupingDate]).month()
      },
      groupByWeek (a) {
        return moment(a['Invoice Date'][this.invoicingGroupingDate]).week()
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
      setContextMenu (e) {
       if (e.target === 'header') {
        e.items.push({text: 'Find warnings', beginGroup: true, value: e.column.dataField, icon: 'warning', onItemClick: this.u})
        e.items.push({text: 'Find flagged', value: e.column.dataField, icon: 'info', onItemClick: this.u})
        e.items.push({text: 'Find up', value: e.column.dataField, icon: 'arrowup', onItemClick: this.u})
        e.items.push({text: 'Find down', value: e.column.dataField, icon: 'arrowdown', onItemClick: this.u})
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
        const icon = e.itemData.icon.startsWith('arrow') ? e.itemData.icon.substr(0,5) + "_" + e.itemData.icon.substr(5)+"ward" : e.itemData.icon
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

        this.signFilterActive = {warning: false, info: false, arrow_downward: false,  arrow_upward: false}
        this.billingsFiltered = this.billings.filter(x => {
          let res = false
          res = Object.keys(x.sign).filter(e => {
            // return x.sign[e].find(u => u.startsWith(sign))
            return Object.keys(x.sign[e]).includes(sign)
          })

          return res.length > 0
        })
        this.signFilterActive[sign] = true
      },
      restoreView() {
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
      }
    },
    components: {
      FormattedCell,
      CellTemplate,
      HeaderTemplate,
      DetailTemplate,
      SsoTemplate
    }
  };
</script>