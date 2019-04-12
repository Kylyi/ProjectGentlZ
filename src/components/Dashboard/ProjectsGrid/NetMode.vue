<template>
  <v-layout id="netMode" mt-3 style="max-height: 500px;">
    <dx-data-grid
      ref="networksTable"
      :data-source="pmProjectsBasic"
      show-borders
      key-expr='_id'
      column-auto-width
      :allow-column-reordering="true"
      :allow-column-resizing="true"
      :row-alternation-enabled="true"
      :show-row-lines="true"
      :show-column-lines="true"
      :word-wrap-enabled="true"
      :selection="{ mode: 'single' }"
      @selection-changed="onSelectionChanged"
    >
      <dx-scrolling mode="virtual"/>
      <dx-master-detail
        :enabled="true"
        template="detailTemplate"
      />

      <dx-column
        data-field="_id"
        caption="Network #"
        alignment="center"
      />
      <dx-column
        data-field="Network Description"
        caption="Network description"
        alignment="left"
      />
      <dx-column
        caption="Net #Panels/#Modules"
        alignment="center"
        cell-template="panelsModulesTemplate"
      />
      <dx-column
        data-field="Net Revenues"
        caption="Net revenues"
        data-type="number"
        format="thousands"
        alignment="center"
      />
      <dx-column
        caption="Inv. alert"
        cell-template="invoicingIconsTemplate"
        alignment="center"
      />
      <dx-column
        caption="Actions"
        cell-template="actionsTemplate"
        alignment="center"
        :fixed="true"
        fixed-position="right"
      />

      <div slot="panelsModulesTemplate" slot-scope="templateData">
        {{templateData.data['Number of Panels']}} / {{templateData.data['Number of Modules']}}
      </div>

      <div slot="invoicingIconsTemplate" slot-scope="templateData">
        <invoicing-signs :signs="templateData.data.sign" />
      </div>

      <div slot="actionsTemplate" slot-scope="templateData">
          <v-icon @click="generateTemplate(templateData.data)" title="Generate template" color="grey darken-4">trip_origin</v-icon>
          <v-icon @click="manageRiskRegister(templateData.data)" title="Manage risk register" color="teal lighten-1">business</v-icon>
      </div>

      <div slot="detailTemplate" slot-scope="templateData">
        <v-tabs>
          <v-tab>
            <span class="primary--text">{{templateData.data._id}}</span>
          </v-tab>

          <v-tabs-items>
            <v-tab-item>
              <v-layout row wrap mt-2 mb-2>
                <v-flex column xs4 v-for="field in visibleProjectsDetail" :key="field.value">
                  <v-flex row wrap text-xs-center>
                    <b>{{field.name}}</b>
                  </v-flex>

                  <v-flex row wrap text-xs-center style="min-height: 21px;">
                    {{templateData.data[field.value]}}
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
        storage-key="netTable"
        :savingTimeout="5000"
      />
    </dx-data-grid>

  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import InvoicingSigns from './NetMode/InvoicingSigns'
export default {
  name: 'NetMode',
  components: { InvoicingSigns },
  computed: mapGetters(['pmProjectsBasic', 'visibleProjectsDetail', 'generateTemplateDialog']),
  methods: {
    ...mapActions(['openGenerateTemplateDialog', 'chooseProjects', 'fetchProjectsDetail', 'fetchNetTasksInfo']),
    async generateTemplate(data) {
      await this.chooseProjects(data)
      this.openGenerateTemplateDialog(true)
    },
    async manageRiskRegister(data) {
      await this.chooseProjects(data)
      this.$router.push('/riskRegister')
    },
    async onSelectionChanged (data) {
      this.fetchNetTasksInfo(data.selectedRowsData[0]._id)
      await this.chooseProjects(data.selectedRowsData[0])
    }
  }
}
</script>

<style>
  #netMode .dx-datagrid-rowsview {
    font-size: medium;
  }

  #netMode .dx-datagrid-headers {
    font-size: medium;
  }
</style>
