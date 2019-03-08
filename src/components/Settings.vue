<template>
  <v-container>
    <v-layout row wrap>
      <v-flex class="xs12 row wrap" mb-4>
        <h3 class="display-2"><span class="tit">Settings</span></h3>
      </v-flex>

      <v-layout row wrap>
        <v-expansion-panel>
          <v-expansion-panel-content>
            <v-flex slot="header" class="tit">Invoicing</v-flex>
            <v-card>
              <v-card-text style="padding-top: 0">
                <v-layout row wrap>
                  <v-flex column wrap xs12>This sets up which data will be shown when clicked on <b>detail</b> in <b>Invoicing table</b>. You can add prefered options via drag&drop.
                    Order of item matters as items will be shown accordingly to these settings.
                  </v-flex>

                  <v-flex column>
                    <v-flex row wrap class="subtit" mt-2>Available data</v-flex>


                    <draggable
                      id="invoiceDetailSettings"
                      style="max-width: 300px;"
                      class="list-group"
                      v-model="columns"
                      :options="{group:{ name:'options',  pull:'clone', put:false }}"
                      :move="onMove"
                      @start="isDragging=true"
                      @end="isDragging=false"
                      >

                      <transition-group type="transition" :name="'flip-list'">
                        <v-layout row v-for="item in columns" :key="item.value" class="draggableItem">
                            <v-flex column wrap xs10>{{item.name}}</v-flex>
                            <v-flex column wrap xs2><v-checkbox v-model="item.visible"></v-checkbox></v-flex>
                        </v-layout>
                      </transition-group>

                    </draggable>

                  </v-flex>

                </v-layout>
              </v-card-text>
              <v-card-actions><v-btn flat icon @click="setNetDetailsInfo"><v-icon>save</v-icon></v-btn> </v-card-actions>
            </v-card>
          </v-expansion-panel-content>

          <v-expansion-panel-content>
            <v-flex slot="header">Some other settings</v-flex>
            <v-card>
              <v-card-text>
                <v-btn @click="resetViews">Reset views</v-btn>
                <v-btn @click="destroyDb">Destroy local db</v-btn>
              </v-card-text>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-layout>

    </v-layout>
  </v-container>
</template>

<style lang="scss">
  .draggableItem {
    border: 1px dashed lightgray;
    border-radius: 2px;
    cursor: -webkit-grabbing;
  }
  #invoiceDetailSettings .v-input--selection-controls {
    margin-top: 0;
    padding-top: 0;
  }

  #invoiceDetailSettings .v-input__slot {
    margin-bottom: 0;
  }

  #invoiceDetailSettings .v-messages {
    display: none;
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

  export default {
    name: 'settings',
    created: async function () {
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
      this.columns =  x
    },
    data: () => ({
      columns: []
    }),
    methods: {
      onMove({ relatedContext, draggedContext }) {
        const relatedElement = relatedContext.element;
        const draggedElement = draggedContext.element;
        // console.log({relatedElement, draggedElement})

        return (
          (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
        );
      },
      removeFromList (val) {
        const idx = this.netDetailSettings.findIndex(item => item.value === val)
        this.netDetailSettings.splice(idx, 1)
      },
      setNetDetailsInfo() {
        const toBeSaved = JSON.stringify(this.columns.filter(e => e.visible))

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
    watch: {
      isDragging(newValue) {
        if (newValue) {
          this.delayedDragging = true;
          return;
        }
        this.$nextTick(() => {
          this.delayedDragging = false;
        });
      }
    },
    components: {draggable}
    
  }
</script>
