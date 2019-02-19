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
                      <v-flex row wrap>Group via</v-flex>
                      <v-flex row wrap><v-btn-toggle v-model="groupingDate" @change="switchGroupingDate">
                        <v-btn flat :value="lastUpdate">
                          Current invoice date
                        </v-btn>
                        <v-btn flat :value="SELECTEDDATE">
                          Selected invoice date
                        </v-btn>
                      </v-btn-toggle></v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>

              <v-divider></v-divider>

              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-flex row wrap>Week grouping</v-flex>
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
                      <v-flex row wrap>Get missing</v-flex>
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
            </v-list>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn flat @click="optionsMenu = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-flex>
      
      <v-layout row wrap>
        <v-layout align-center justify-start row fill-height>
          <v-flex column xs2>
            <v-text-field
              label="Last update"
              v-model="lastUpdate"
              disabled
            ></v-text-field>
          </v-flex>

          <v-flex column xs3 ml-2>
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

      </v-layout>
      

      <!-- GRID -->
      <v-flex column wrap xs12 v-if="lastUpdate">
        <dx-data-grid
        ref="invoicingGrid"
        :data-source="billings"
        show-borders
        key-expr='_id'
        column-auto-width
        :allow-column-reordering="true"
        :allow-column-resizing="true"
        :row-alternation-enabled="true"
        :show-row-lines="true"
        :show-column-lines="true"
        :paging="{enabled: false}"

          >

          <dx-header-filter
            :visible="true"
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
            :alignment="col.alignment"
            />

          <dx-column
            :data-field="`inv_date[${lastUpdate}]`"
            caption="Current invoice date"
            data-type="date"
            :format="dateFormatter"
            alignment="center"
            cell-template="formattedCell"
            :showWhenGrouped="true"
          />
          
          <dx-column
            :data-field="`inv_date[${SELECTEDDATE}]`"
            caption="Last invoice date"
            data-type="date"
            format="dd.MM.yyyy"
            alignment="center"
            :showWhenGrouped="true"
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
            />
            <dx-group-item
              :show-in-group-footer="false"
              :align-by-column="true"
              column="project_ob"
              summary-type="sum"
              display-format="Total: {0} CZK"
            />
            <dx-group-item
              :show-in-group-footer="false"
              column="_id"
              summary-type="count"
              display-format="SDs: {0}"
            />
          </dx-summary>

          <div
            slot="formattedCell"
            slot-scope="data">
            <formatted-cell :cell-data="data" :dates="[lastUpdate, SELECTEDDATE]"/>
          </div>

          <div
            slot="detailTemplate"
            slot-scope="net">
            <detail-template
              :template-data="net"
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

</style>



<script>
  import { DxDataGrid, DxColumn, DxSelection, DxSummary, DxGroupItem, DxSortByGroupSummaryInfo, DxMasterDetail, DxStateStoring, DxHeaderFilter, DxGrouping, DxColumnChooser, DxGroupPanel, DxSearchPanel, DxFilterPanel, DxFilterRow, DxEditing, DxExport } from 'devextreme-vue/data-grid'
  import db from '../main/scripts/database'
  import localStorage from 'localStorage'

  import {readFile} from '../main/scripts/misc'
  import FormattedCell from './Invoicing/FormattedCell.vue'
  import DetailTemplate from './Invoicing/DetailTemplate.vue'
  const moment = require('moment')
  const path = require('path')


  export default {
    name: 'Invoicing',
    beforeCreate: async function () {
      async function getBillings() {
        const billings = await db.billings.find({
          selector: {},
          limit: null
        })
        return billings.docs
      }     

      this.billings = await getBillings()
      const revisions = await db.settings.get('billings')
      
      this.revisionsAvailable = await revisions.dates_modified.slice(0, -1)
      this.lastUpdate = await revisions.dates_modified.pop()
      
      this.groupingDate = localStorage.getItem('groupingDate') ? await localStorage.getItem('groupingDate') : this.lastUpdate

      const weekGrouping = await JSON.parse(localStorage.getItem('weekGrouping'))
      this.weekGrouping = weekGrouping !== null ? weekGrouping : true
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
    }),
    methods: {
      switchGroupingDate(e) {
        localStorage.setItem('groupingDate', e)
        this.$refs.invoicingGrid.instance.refresh()
      },
      setWeekGrouping (e) {
        if (e) this.$refs.invoicingGrid.instance.columnOption('groupWeek', 'groupIndex', 2)
        else this.$refs.invoicingGrid.instance.columnOption('groupWeek', 'groupIndex', undefined)
        localStorage.setItem('weekGrouping', e)
      },
      changeDate (date) {
        localStorage.setItem('invoicing', JSON.stringify({selectedDate: date}))
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
      DxExport
    }
  };
</script>