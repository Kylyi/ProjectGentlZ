<template>
  <v-layout id="projectsMode" mt-3 style="max-height: 500px;">
    <dx-data-grid
      ref="projectsTable"
      :data-source="pmProjectsProjectMode"
      show-borders
      key-expr='project_id'
      column-auto-width
      :allow-column-reordering="true"
      :allow-column-resizing="true"
      :row-alternation-enabled="true"
      :show-row-lines="true"
      :show-column-lines="true"
      :word-wrap-enabled="true"
      @row-click="onSelectionChanged"
      @cell-prepared="getConditionalFormatting"
    >
      <!-- <dx-scrolling mode="virtual"/> -->
      <dx-paging :enabled="true" :page-size="50"/>
      <dx-selection mode="single"></dx-selection>
      <dx-master-detail
        :enabled="true"
        template="detailTemplate"
      />

      <dx-search-panel :visible="true"/>
      
      <dx-column
        data-field="project_id"
        caption="Project #"
        alignment="center"
      />
      <dx-column
        data-field="project_name"
        caption="Project name"
        alignment="left"
      />
      <dx-column
        caption="Panels / Modules"
        alignment="center"
        cell-template="panelsModulesTemplate"
      />
      <dx-column
        data-field="project_revenue"
        caption="Revenues"
        data-type="number"
        format="thousands"
        alignment="center"
      />
      <dx-column
        caption="Opps / Risks"
        cell-template="bilanceTemplate"
        :calculate-cell-value="bilanceValue"
        alignment="center"
        :allow-sorting="true"
        :allow-filtering="true"
      />
      <dx-column
        caption="Actions"
        cell-template="actionsTemplate"
        alignment="center"
        :fixed="true"
        fixed-position="right"
      />


      <div slot="panelsModulesTemplate" slot-scope="templateData">
        {{templateData.data.project_panels}} / {{templateData.data.project_modules}}
      </div>

      <v-flex row wrap fill-height slot="bilanceTemplate" slot-scope="templateData">
        <span v-if="templateData.data.riskRegisterBilance" class="success--text"> {{(templateData.data.riskRegisterBilance.bilanceOpps/1000).toFixed(0)}}K</span>
           / 
        <span v-if="templateData.data.riskRegisterBilance" class="error--text">{{(templateData.data.riskRegisterBilance.bilanceRisks/1000).toFixed(0)}}K</span>
      </v-flex>

      <div slot="actionsTemplate" slot-scope="templateData">
          <v-icon @click.stop="generateTemplate(templateData.data)" color="grey darken-4" title="Generate template">trip_origin</v-icon>
          <v-icon @click.stop="manageRiskRegister(templateData.data)" color="teal lighten-1" title="Manage risk register">business</v-icon>
      </div>

      <div slot="detailTemplate" slot-scope="templateData">
        <v-tabs>
          <v-tab
            v-for="netId in templateData.data.nets_keys"
            :key="netId"
          >
            <span class="primary--text">{{netId}}</span>
          </v-tab>

          <v-tabs-items>
            <v-tab-item
              v-for="(net, i) in templateData.data.nets"
              :key="i"
            >
              <v-layout row wrap style="padding: 8px 8px 20px 8px;">
                <v-flex column xs4 v-for="field in visibleProjectsDetail" :key="field.value">
                  <v-flex row wrap text-xs-center>
                    <b>{{field.name}}</b>
                  </v-flex>

                  <v-flex row wrap text-xs-center style="min-height: 21px;">
                    {{ (field.dataType === 'date' && net[field.value]) ? net[field.value].substr(0,10) : net[field.value] }}
                  </v-flex>
                </v-flex>
              </v-layout>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </div>

      <dx-state-storing
        :enabled="true"
        type="localStorage"
        storage-key="projectsTable"
        :savingTimeout="5000"
      />
    </dx-data-grid>

  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import config from 'devextreme/core/config'
export default {
  data: () => {
    return {
      selectedNet: 0
    }
  },
  computed: mapGetters(['pmProjectsProjectMode', 'visibleProjectsDetail', 'generateTemplateDialog']),
  methods: {
    ...mapActions(['openGenerateTemplateDialog', 'chooseProjects', 'fetchProjectsDetail']),
    generateTemplateTrigger(projData) {
      this.chooseProjects(projData)
      this.openGenerateTemplateDialog(true)
    },
    changeProjectSelection(proj) {
      this.chooseProjects(proj.nets[0].net_info[0].task_info)
    },
    bilanceValue(row) {
      if (!row.riskRegisterBilance) return 0
      return row.riskRegisterBilance.bilanceOpps - row.riskRegisterBilance.bilanceRisks
    },
    async generateTemplate(data) {
      await this.chooseProjects(data.nets[0])
      this.openGenerateTemplateDialog(true)
    },
    async manageRiskRegister(data) {
      await this.chooseProjects(data.nets[0])
      this.$router.push('/riskRegister')
    },
    async onSelectionChanged (data) {
      await this.chooseProjects(data.data.nets[0])
    },
    async getConditionalFormatting(row) {
      if (row.column.caption === 'Opps / Risks' && row.rowType === 'data') {
        if (!row.data.riskRegisterBilance) return

        const bilance = row.data.riskRegisterBilance.bilanceOpps - row.data.riskRegisterBilance.bilanceRisks
        const percent = bilance/(row.data.project_revenue || 1)
        let color

        if (percent > 0.1) {
          color = '#C8E6C9'
        } else if (percent > -0.1 && percent < 0.1) {
          color = '#FFF9C4'
        } else {
          color = '#FFCDD2'
        }


        row.cellElement.style.backgroundColor = color
      }

    }
  }
}
</script>

<style>
  #projectsMode .dx-datagrid-rowsview {
    font-size: medium;
  }

  #projectsMode .dx-datagrid-headers {
    font-size: medium;
  }

  #projectsMode .dx-command-expand {
    vertical-align: middle;
    padding-bottom: 3px;
  }
</style>

