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
    >
      <dx-scrolling mode="virtual"/>
      
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

      <div slot="bilanceTemplate" slot-scope="templateData">
        <span class="success--text">{{(templateData.data.riskRegisterBilance.bilanceOpps/1000).toFixed(1)}}K</span> / <span class="error--text">{{(templateData.data.riskRegisterBilance.bilanceRisks/1000).toFixed(1)}}K</span>
      </div>

      <div slot="actionsTemplate" slot-scope="templateData">
          <v-icon @click="generateTemplate(templateData.data)" small title="Generate template">trip_origin</v-icon>
          <v-icon @click="manageRiskRegister(templateData.data)" small title="Manage risk register">business</v-icon>
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
      return row.riskRegisterBilance.bilanceOpps - row.riskRegisterBilance.bilanceRisks
    },
    async generateTemplate(data) {
      await this.chooseProjects(data.nets[0])
      this.openGenerateTemplateDialog(true)
    },
    async manageRiskRegister(data) {
      await this.chooseProjects(data.nets[0])
      this.$router.push('/riskRegister')
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
</style>

