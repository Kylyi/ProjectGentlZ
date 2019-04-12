<template>
  <v-layout column xs wrap>
    <v-layout row wrap align-center style="padding: 18.5px 24px; background-color: #424242;" >
      <!-- Title -->
      <v-flex column shrink>
        <h3 class="display-2 white--text">Invoicing</h3>
      </v-flex>

      <!-- MENU -->
      <v-flex column grow text-xs-right>
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
                      <v-flex row wrap><v-btn-toggle :value="invoicingWeekGrouping" @change="changeWeekGrouping">
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
          <v-btn icon @click="filterSignOnAll('warning')"><v-icon :color="signFilterActive.warning ? 'red' : 'inherit'">warning</v-icon></v-btn>
          <v-btn icon @click="filterSignOnAll('info')"><v-icon :color="signFilterActive.info ? 'info' : 'inherit'">info</v-icon></v-btn>
          <v-btn icon @click="filterSignOnAll('arrow_upward')"><v-icon :color="signFilterActive.arrow_upward ? 'success' : 'inherit'">arrow_upward</v-icon></v-btn>
          <v-btn icon @click="filterSignOnAll('arrow_downward')"><v-icon :color="signFilterActive.arrow_downward ? 'warning' : 'inherit'">arrow_downward</v-icon></v-btn>
        </v-flex>
      </v-layout>

      <v-layout row wrap>
        
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
            style="height: 100%;"
          >

            <dx-header-filter
              :visible="true"
              :allow-search="true"
            />

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

            <dx-grouping :context-menu-enabled="false" :auto-expand-all="false" expandMode="rowClick" :allow-collapsing="true"/>
            <dx-scrolling mode="virtual" show-scrollbar="always" />

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
              :format="col.dataType === 'number' ? '#,##0.##' : col.dataType === 'date' ? 'dd.MM.yy' : ''"
              header-cell-template="headerTemplate"
              />

            <dx-column
              :data-field="`Invoice Date[${invoicingLastUpdate}]`"
              caption="Current invoice date"
              data-type="date"
              format="dd.MM.yy"
              alignment="center"
              cell-template="cellTemplate"
              :showWhenGrouped="true"
              header-cell-template="headerTemplate"
            />
            
            <dx-column
              :data-field="`Invoice Date[${invoicingCompareDate}]`"
              caption="Last invoice date"
              data-type="date"
              format="dd.MM.yy"
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
              :auto-expand-group="true"
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
              :auto-expand-group="true"
            />

            <dx-column
              :visible="false"
              :show-in-column-chooser="false"
              :group-index="invoicingWeekGrouping ? 2 : null"
              :calculate-group-value="groupByWeek"
              caption="Week"
              data-type="number"
              name="groupWeek"
            />

            <dx-summary>
              <dx-group-item
                column="Revenues"
                summary-type="sum"
                display-format="{0} CZK"
                :align-by-column="true"
                value-format="#,##0"
              />
              <dx-group-item
                :show-in-group-footer="false"
                :align-by-column="true"
                column="Project OB"
                summary-type="sum"
                display-format="{0} CZK"
                value-format="#,##0"
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
                column="Number of Panels"
                summary-type="sum"
                display-format="{0} panels."
              />
              <dx-group-item
                :show-in-group-footer="false"
                :align-by-column="true"
                column="Number of Modules"
                summary-type="sum"
                display-format="{0} modules."
              />
            </dx-summary>

            <div
              slot="formattedCell"
              slot-scope="data">
              <formatted-cell :cell-data="data" :dates="[invoicingLastUpdate, invoicingCompareDate]"/>
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
  </v-layout>
</template>

<style>
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
      billings: [],
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
        let projects = this.allProjectsBasic
        console.log(projects)
        if (format === "none") return this.billings = projects
        return this.billings = projects.filter(doc => {
          return moment(doc['Invoice Date'][this.invoicingLastUpdate]).format(format) !== moment(doc['Invoice Date'][this.invoicingCompareDate]).format(format)
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
      }
    },
    components: {
      FormattedCell,
      CellTemplate,
      HeaderTemplate,
      DetailTemplate
    }
  };
</script>