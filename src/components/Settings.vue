<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex class="xs12 row wrap" mb-4>
        <h3 class="display-2"><span class="tit">Settings</span></h3>
      </v-flex>

      <v-layout row wrap>
        <v-expansion-panel>
          <!-- USER SETTINGS -->
          <v-expansion-panel-content>
            <v-flex slot="header"><b>User settings</b></v-flex>
            <v-card>
              <v-card-text style="padding-top: 0">
                <v-layout row wrap>
                  <v-flex column wrap xs12>
                    These are settings concerning your personal account on Gentl.
                  </v-flex>
                  <v-flex column>
                    <v-flex row wrap mt-4>
                      <v-text-field v-model="sapUsername" style="width: 200px;" hide-details label="SAP name (check PPES)" placeholder="Jméno Příjmení"></v-text-field>
                    </v-flex>
                    <v-flex row wrap mt-4>
                      <v-text-field v-model="sapUsernumber" style="width: 200px;" hide-details label="SAP personal number" placeholder="0XXXXXXXX"></v-text-field>
                    </v-flex>
                  </v-flex>
                </v-layout>
              </v-card-text>
              <v-card-actions><v-btn @click="changeUser(sapUsername, sapUsernumber)" flat icon><v-icon>save</v-icon></v-btn> </v-card-actions>
            </v-card>
          </v-expansion-panel-content>

          <!-- Dashboard -->
          <v-expansion-panel-content>
            <span slot="header"><b>Dashboard & Template Generator</b></span>

            <v-layout row wrap>
              <v-layout row wrap>
                <v-flex column style="max-width: 650px; padding: 10px 24px; text-align:justify">
                  <v-flex row wrap mb-4>
                    This sets up which data will be shown when clicked on <b>detail</b> in <b>Dashboard - My projects</b> table.
                    Select fields you want to see. Order of items matters as items will be shown accordingly to these settings.
                    Don't forget to <b style="color: red;">SAVE</b>.
                  </v-flex>

                  <v-flex row wrap>
                    <v-flex row wrap><p class="subheading primary--text" style="margin-bottom: 0;">Available fields</p></v-flex>
                    <table class="draggableTable">
                      <thead class="el-table__header">
                        <tr>
                          <th></th>
                          <th>Database field</th>
                          <th>Display value</th>
                          <th style="text-align: center;">Visible</th>
                        </tr>
                      </thead>
                      <draggable tag="tbody" v-model="projectsDetail" class="list-group" handle=".handle" v-bind="dragOptions" @start="drag = true" @end="drag = false">
                        <tr v-for="(e) in projectsDetail" :key="e.value" style="width: 100%;">
                          <td><v-icon class="handle" style="width: 30px; text-align: center; cursor: -webkit-grab;" small>drag_indicator</v-icon></td>
                          <td style="width: 249px;">{{e.value}}</td>
                          <td style="width: 249px;"><input style="width: 100%;" type="text" v-model="e.name" /></td>
                          <td><v-checkbox hide-details v-model="e.visible"></v-checkbox></td>
                        </tr>
                      </draggable>
                    </table>
                  </v-flex>
                </v-flex>
                <v-flex column>
                  <v-btn flat icon @click="triggerEdit('projectDetails')"><v-icon>save</v-icon></v-btn>
                </v-flex>
              </v-layout>
            </v-layout>
          </v-expansion-panel-content>
          <!-- Invoicing -->
          <v-expansion-panel-content>
            <span slot="header"><b>Invoicing</b></span>

            <v-layout row wrap>
              <v-layout row wrap>
                <v-flex column style="max-width: 650px; padding: 10px 24px; text-align:justify">
                  <v-flex row wrap mb-4>
                    This sets up which data will be shown when clicked on <b>detail</b> in <b>Invoicing table</b>.
                    Select which fields you want to see. Order of item matters as items will be shown accordingly to these settings.
                    Don't forget to <b style="color: red;">SAVE</b>.
                  </v-flex>

                  <v-flex row wrap>
                    <v-flex row wrap><p class="subheading primary--text" style="margin-bottom: 0;">Available fields</p></v-flex>
                    <table class="draggableTable">
                      <thead class="el-table__header">
                        <tr>
                          <th></th>
                          <th>Database field</th>
                          <th>Display value</th>
                          <th style="text-align: center;">Visible</th>
                        </tr>
                      </thead>
                      <draggable tag="tbody" v-model="invoicingDetail" class="list-group" handle=".handle" v-bind="dragOptions" @start="drag = true" @end="drag = false">
                          <tr v-for="(e) in invoicingDetail" :key="e.value" style="width: 100%;">
                            <td><v-icon class="handle" style="width: 30px; text-align: center; cursor: -webkit-grab;" small>drag_indicator</v-icon></td>
                            <td>{{e.value}}</td>
                            <td><input type="text" v-model="e.name" /></td>
                            <td><v-checkbox hide-details v-model="e.visible"></v-checkbox></td>
                          </tr>
                      </draggable>
                    </table>
                  </v-flex>
                </v-flex>
                <v-flex column>
                  <v-btn flat icon @click="setNetDetailsInfo"><v-icon>save</v-icon></v-btn>
                  <v-layout row wrap pr-3>
                    <v-flex column shrink>
                      <upload-btn :uniqueId="true" :fileChangedCallback="setPath1301" title="Choose OB daily file path 1301" outline />
                    </v-flex>
                    <v-flex column grow>
                      <v-text-field :value="obDailyPath1301" :readonly="true" placeholder="Path to OB Daily file - 1301" label="Path to OB Daily file - 1301" />
                    </v-flex>
                  </v-layout>

                  <v-layout row wrap pr-3>
                    <v-flex shrink column wrap>
                      <upload-btn :uniqueId="true" :fileChangedCallback="setPath1601" readonly title="Choose OB daily file path 1601" outline />
                    </v-flex>
                    <v-flex grow column wrap>
                      <v-text-field :value="obDailyPath1601" :readonly="true" placeholder="Path to OB Daily file - 1601" label="Path to OB Daily file - 1601" />
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-layout>







          </v-expansion-panel-content>

        </v-expansion-panel>
      </v-layout>

    </v-layout>
  </v-container>
</template>

<style>
.draggableItem {
  border: 1px dashed lightgray;
  border-radius: 2px;
  cursor: -webkit-grabbing;
}

.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
table.draggableTable input {
  border-radius: 2px;
  border: 1px solid lightgrey;
  padding: 0 2px;
}
table.draggableTable input:focus {
  border-color: #1976D2;
  outline: none;
}
table.draggableTable .v-input--selection-controls {
  margin-top: 0px;
  padding-top: 0px;
}
table.draggableTable .v-input--selection-controls__input {
  margin: 0px;
}
table.draggableTable .v-input__control {
  margin: auto;
}
</style>



<script>
  import {readFile} from '../main/scripts/misc'
  import draggable from 'vuedraggable'
  const fs = require('fs')
  const path = require('path')
  const localStorage = require('localStorage')
  import DataFrame from "dataframe-js"
  import { mapGetters, mapActions, mapState } from "vuex";

  export default {
    name: 'settings',
    created: async function () {
      this.sapUsername = this.$store.getters.userInfo.sapUsername || null
      this.sapUsernumber = this.$store.getters.userInfo.sapUsernumber || null
      this.projectsDetail = JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'projectDetails.json'), 'utf-8'))

      const allOptions = JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json'), 'utf-8'))
      const detailSettings = JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json'), 'utf-8'))
      allOptions.push({dataType: 'special', editable: false, name: 'Invoice date', value: 'Invoice Date', visible: false})

      const x = allOptions.map(e => {
        const y = detailSettings.filter(u => e['value'] === u['value'])

        if (y.length > 0) {
          return y[0]
        } else {
          e['visible'] = false
          return e
        }
        return y.length > 0 ? y[0] : e
      })
      this.invoicingDetail =  x
    },
    computed: {
      ...mapGetters(['obDailyPath1301', 'obDailyPath1601']),
      dragOptions() {
        return {
          animation: 200,
          group: "description",
          disabled: false,
          ghostClass: "ghost"
        };
      }
    },
    data: () => ({
      invoicingDetail: [],
      drag: false,
      sapUsername: null,
      sapUsernumber: null,
      projectsDetail: []
    }),
    methods: {
      ...mapActions(['editProjectsDetail', 'changeUserSapName', 'changeFileLocation', 'changeInvoicingDetail']),
      triggerEdit(fileName) {
        this.editProjectsDetail({fileName, projectsDetailObj: this.projectsDetail})
      },
      removeFromList (val) {
        const idx = this.netDetailSettings.findIndex(item => item.value === val)
        this.netDetailSettings.splice(idx, 1)
      },
      setNetDetailsInfo() {
        const invoicingDetail = this.invoicingDetail.filter(e => e.visible)
        this.changeInvoicingDetail({fileName: 'invoicingDetails', invoicingDetail})


        // fs.writeFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json'), toBeSaved, 'utf8', (err, res) => {
        //   if (err) throw err;
        // })
      },
      setPath1301(file) {
        this.changeFileLocation({plant: '1301', path: file.path})
      },
      setPath1601(file) {
        this.changeFileLocation({plant: '1601', path: file.path})
      },
      changeUser(sapUsername, sapUsernumber) {
        this.changeUserSapName({sapUsername, sapUsernumber})
      }
    },
    components: {draggable}
    
  }
</script>
