<template>
  <v-container>
    <v-layout row wrap>
      <v-flex class="xs12 row wrap" mb-4>
        <h3 class="display-2"><span class="tit">Settings</span></h3>
      </v-flex>

      <v-layout row wrap>
        <v-expansion-panel>
          <!-- Dashboard -->
          <v-expansion-panel-content>
            <v-flex slot="header"><b>Dashboard</b></v-flex>
            <v-card>
              <v-card-text style="padding-top: 0">
                <v-layout row wrap>
                  <v-flex column wrap xs12>
                    This sets up which data will be shown when clicked on <b>detail</b> in <b>Dashboard - My projects</b> table.
                    Select fields you want to see. Order of items matters as items will be shown accordingly to these settings.
                  </v-flex>
                  <v-flex column>
                    <v-flex row wrap class="subtit" mt-2>Available fields</v-flex>
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
                            <td>{{e.value}}</td>
                            <td><input type="text" v-model="e.name" /></td>
                            <td><v-checkbox hide-details v-model="e.visible"></v-checkbox></td>
                          </tr>
                      </draggable>
                    </table>
                  </v-flex>
                </v-layout>
              </v-card-text>
              <v-card-actions><v-btn flat icon @click="triggerEdit('projectDetails')"><v-icon>save</v-icon></v-btn> </v-card-actions>
            </v-card>
          </v-expansion-panel-content>

          <!-- Invoicing -->
          <v-expansion-panel-content>
            <v-flex slot="header"><b>Invoicing</b></v-flex>
            <v-card>
              <v-card-text style="padding-top: 0">
                <v-layout row wrap>
                  <v-flex column wrap xs12>This sets up which data will be shown when clicked on <b>detail</b> in <b>Invoicing table</b>. Select which fields you want to see.
                    Order of item matters as items will be shown accordingly to these settings.
                  </v-flex>

                  <v-flex column>
                    <v-flex row wrap class="subtit" mt-2>Available fields</v-flex>
                    <table class="draggableTable">
                      <thead class="el-table__header">
                        <tr>
                          <th></th>
                          <!-- <th>Database field</th> -->
                          <th>Display value</th>
                          <th style="text-align: center;">Visible</th>
                        </tr>
                      </thead>
                      <draggable tag="tbody" v-model="invoicingDetail" class="list-group" handle=".handle" v-bind="dragOptions" @start="drag = true" @end="drag = false">
                          <tr v-for="(e) in invoicingDetail" :key="e.value" style="width: 100%;">
                            <td><v-icon class="handle" style="width: 30px; text-align: center; cursor: -webkit-grab;" small>drag_indicator</v-icon></td>
                            <td>{{e.name}}</td>
                            <!-- <td><input type="text" v-model="e.name" /></td> -->
                            <td><v-checkbox hide-details v-model="e.visible"></v-checkbox></td>
                          </tr>
                      </draggable>
                    </table>

                  </v-flex>

                </v-layout>
              </v-card-text>
              <v-card-actions><v-btn flat icon @click="setNetDetailsInfo"><v-icon>save</v-icon></v-btn> </v-card-actions>
            </v-card>
          </v-expansion-panel-content>

          <!-- Other -->
          <!-- <v-expansion-panel-content>
            <v-flex slot="header">Some other settings</v-flex>
            <v-card>
              <v-card-text>
                <v-btn @click="resetViews">Reset views</v-btn>
                <v-btn @click="destroyDb">Destroy local db</v-btn>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content> -->
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
  import db from '../main/scripts/database'
  import { mapGetters, mapActions, mapState } from "vuex";

  export default {
    name: 'settings',
    created: async function () {
      // this.fetchProjectsDetail()

      const allOptions = JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json'), 'utf-8'))
      const detailSettings = JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json'), 'utf-8'))
      allOptions.push({dataType: 'special', editable: false, name: 'Invoice date', value: 'inv_date', visible: false})

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
      ...mapGetters(['projectsDetail']),
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
      drag: false
    }),
    methods: {
      ...mapActions(['editProjectsDetail', 'fetchProjectsDetail']),
      triggerEdit(jsonObj) {
        this.editProjectsDetail({jsonObj, projectsDetailObj: this.projectsDetail})
      },
      removeFromList (val) {
        const idx = this.netDetailSettings.findIndex(item => item.value === val)
        this.netDetailSettings.splice(idx, 1)
      },
      setNetDetailsInfo() {
        const toBeSaved = JSON.stringify(this.invoicingDetail.filter(e => e.visible))

        fs.writeFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json'), toBeSaved, 'utf8', (err, res) => {
          if (err) throw err;
        })
      },
      resetViews() {
        sessionStorage.clear()
        localStorage.clear()
      },
      destroyDb() {
        db.projects.destroy()
        db.billings.destroy()
        db.settings.destroy()
        db.templates.destroy()
      }
    },
    components: {draggable}
    
  }
</script>
