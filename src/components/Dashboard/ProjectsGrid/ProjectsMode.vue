<template>
  <v-layout id="projectsMode" mt-3 style="max-height: 100%;">
    <dx-data-grid
      ref="projectsTable"
      :data-source="pmProjects"
      show-borders
      key-expr='Project Definition'
      column-auto-width
      :allow-column-reordering="true"
      :allow-column-resizing="true"
      :row-alternation-enabled="true"
      :show-row-lines="true"
      :show-column-lines="true"
      :word-wrap-enabled="true"
      @focused-row-changing="onSelectionChanged"
      :focused-row-enabled="true"
      @cell-prepared="getConditionalFormatting"
      :repaint-changes-only="true"
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
        data-field="Project Definition"
        caption="Project #"
        alignment="center"
      />
      <dx-column
        data-field="Project Name"
        caption="Project name"
        alignment="left"
      />
      <dx-column
        caption="Panels / Modules"
        alignment="center"
        cell-template="panelsModulesTemplate"
      />
      <dx-column
        data-field="Project Revenues"
        caption="Revenues"
        data-type="number"
        format="thousands"
        alignment="center"
      />
      <dx-column
        caption="Opps / Risks"
        cell-template="riskRegisterAlertTemplate"
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
        {{templateData.data['Project Panels']}} / {{templateData.data['Project Modules']}}
      </div>

      <v-flex row wrap fill-height slot="riskRegisterAlertTemplate" slot-scope="templateData">
        <risk-register-alert :template-data="templateData" />
      </v-flex>

      <div slot="actionsTemplate" slot-scope="templateData">
          <v-icon @click.stop="generateTemplate(templateData.data)" color="red darken-4" title="Generate template">trip_origin</v-icon>
          <v-icon @click.stop="manageRiskRegister(templateData.data)" color="teal lighten-1" title="Manage risk register">business</v-icon>
          <v-icon @click.stop="markProjectAsDone(templateData.data)" color="success" title="Mark project as finished">assignment_turned_in</v-icon>
      </div>

      <div slot="detailTemplate" slot-scope="templateData">
        <v-tabs>
          <v-tab
            v-for="net in templateData.data.nets"
            :key="net._id"
            @click="fetchNetTasksInfo(net._id)"
          >
            <v-layout column wrap>
              <v-flex row wrap class="primary--text">{{net['Network Num']}}</v-flex>
              <v-flex row wrap style="font-size: 10px;">{{net['Network Description']}}</v-flex>
            </v-layout>
            <!-- <span class="primary--text">{{netId}}</span> -->
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
import RiskRegisterAlert from './ProjectsMode/RiskRegisterAlert'
export default {
  components: { RiskRegisterAlert },
  created() {
    this.$root.$off('contentWindowResized')
    this.$root.$on('contentWindowResized', () => {
      if (this.$refs['projectsTable'].instance) this.$refs['projectsTable'].instance.updateDimensions()
    })
  },
  data: () => {
    return {
      selectedNet: 0,
      projectDoneDialog: false
    }
  },
  computed: mapGetters(['pmProjects', 'visibleProjectsDetail', 'generateTemplateDialog', 'chosenProjects']),
  methods: {
    ...mapActions(['openGenerateTemplateDialog', 'chooseProjects', 'deactivateNets', 'fetchNetTasksInfo']),
    generateTemplateTrigger(projData) {
      this.chooseProjects(projData)
      this.openGenerateTemplateDialog(true)
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
      if (data.newRowIndex !== data.prevRowIndex) {
        this.fetchNetTasksInfo(data.rows[data.newRowIndex].data.nets_keys[0])
        await this.chooseProjects(data.rows[data.newRowIndex].data)
      }

      // if (this.chosenProjects[0] && this.chosenProjects[0].nets_keys[0] !== data.data.nets[0]._id) this.fetchNetTasksInfo(data.data.nets[0]._id)
      // await this.chooseProjects(data.data)
    },
    async getConditionalFormatting(row) {
      if (row.column.caption === 'Opps / Risks' && row.rowType === 'data') {
        if (!row.data.riskRegisterBilance) return

        const bilance = row.data.riskRegisterBilance.bilanceOpps - row.data.riskRegisterBilance.bilanceRisks
        const percent = bilance/(row.data['Project Revenues'] || 1)
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

    },
    async markProjectAsDone(data) {
      const cnf = confirm('This action will mark selected project, including all of its network diagrams, as finished. Finished projects will no longer appear in many functionalities of Gentl.')

      if (cnf) {
        this.deactivateNets(data.nets_keys)
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

