<template>
  <v-layout id="opportunities">
    <template>
      <el-collapse v-model="selectedTab" style="width: 100%;">
        <el-collapse-item
          v-for="(riskCategory, i) in riskRegister.opportunities"
          :title="i" 
          :name="i"
          :key="i"
        >
          <template v-if="selectedTab.includes(i)">
            <dx-data-grid
              :data-source="riskCategory"
              show-borders
              key-expr='name'
              column-auto-width
              :allow-column-resizing="true"
              :row-alternation-enabled="true"
              :show-row-lines="true"
              :show-column-lines="true"
              :word-wrap-enabled="true"
              style="max-height: 300px;"
              @cell-click="cellClick($event, i)"
              :repaintChangesOnly="true"
            >
              <dx-editing
                :allow-updating="true"
                mode="cell"
              />

              <dx-column
                data-field="name"
                caption="Definition"
                alignment="left"
                :allow-sorting="false"
                :allow-resizing="true"
              />
              <dx-column
                data-field="info"
                caption="Description"
                alignment="left"
                :allow-sorting="false"
              />
              <dx-column
                data-field="exists"
                caption="Exists"
                alignment="center"
                :allow-sorting="false"
              />
              <dx-column
                data-field="description"
                caption="Additional info"
                alignment="left"
                :allow-sorting="false"
              />
              <dx-column
                data-field="plannedAction"
                caption="Planned action for mitigation"
                alignment="left"
                :allow-sorting="false"
                :allow-editing="false"
              />
              <dx-column
                data-field="owner"
                caption="Owner"
                alignment="center"
                :allow-sorting="true"
              >
              </dx-column>
              <dx-column
                data-field="probability"
                caption="Probability [%]"
                alignment="center"
                data-type="number"
                format="percent"
                :allow-sorting="false"
              />
              <dx-column
                data-field="priceImpact"
                caption="Price impact [kCZK]"
                alignment="center"
                data-type="number"
                format="thousands"
              />

              <!-- <v-textarea
                slot="textAreaTemplate"
                slot-scope="templateData"
                :value="riskRegister.opportunities[i][templateData.rowIndex][templateData.column.dataField]"
                @blur="commitChanges($event, i, templateData)"
                no-resize
                hide-details
                rows="2"
                row-height="14"
                outline
                style="font-size: 12px; margin: 0;"
              ></v-textarea> -->

              <!-- <div slot="booleanTemplate" slot-scope="templateData">
                <v-checkbox
                  v-model="riskRegister.opportunities[i][templateData.rowIndex][templateData.column.dataField]"
                  color="red"
                  hide-details
                 ></v-checkbox>

              </div> -->

            </dx-data-grid>
          </template>
        </el-collapse-item>
      </el-collapse>


      <v-dialog
        v-model="dialog"
        width="500"
      >
        <v-card>
          <v-card-title
            class="headline grey lighten-2"
            primary-title
          >
            {{selectedFieldCaption}}
          </v-card-title>

          <v-card-text>
            <textarea style="width: 100%; outline-color:#1976D2; border: 1px dashed;"
              @blur="commitChanges"
              rows="12"
              :value="selectedFieldValue"
              placeholder="Text..."  
            ></textarea>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              flat
              @click="dialog = false"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import {
  DxTextArea
} from 'devextreme-vue';
import CheckTemplate from './Helpers/CheckTemplate'
export default {
  name: 'Risks',
  props: ['riskRegister'],
  components: {
    CheckTemplate,
    DxTextArea
  },
  data: () => {
    return {
      selectedTab: [],
      dialog: false,
      selectedCategory: null,
      selectedRowIndex: null,
      selectedField: null,
      selectedFieldValue: null,
      selectedFieldCaption: null
    }
  },
  computed: {
    ...mapGetters(['defaultRiskRegister'])
  },
  methods: {
    ...mapActions(['fetchDefaultRiskRegister']),
    cellClick(e, i) {
      console.log(e)
      if (e.column.dataType === 'string') {
        this.selectedCategory = i
        this.selectedRowIndex = e.rowIndex
        this.selectedField = e.column.dataField
        this.selectedFieldValue = e.value
        this.selectedFieldCaption = e.column.caption
        this.dialog = true
      }
    },
    commitChanges(e) {
      this.riskRegister.opportunities[this.selectedCategory][this.selectedRowIndex][this.selectedField] = e.target.value
    }
  }
}
</script>

<style>
  #opportunities .dx-datagrid-content .dx-datagrid-table .dx-row > td, .dx-datagrid-content .dx-datagrid-table .dx-row > tr > td {
    vertical-align: middle;
  }

  #opportunities textarea {
    margin: 0 12px 0 0;
    padding: 2px 5px;
  }

  #opportunities .v-text-field__slot {
    padding: 0
  }

  #opportunities .v-input__slot {
    padding: 0;
  }

  #opportunities .v-input__control {
    margin: auto;
  }

  #opportunities .v-input--selection-controls {
    margin-top: 0;
  }
</style>
