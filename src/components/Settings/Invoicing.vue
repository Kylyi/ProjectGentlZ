<template>
  <v-layout row>
    <v-flex column shrink pr-3>
      <v-flex row mb-1 style="width: 580px;">
        This sets up which data will be shown when clicked on <b>detail</b> in <b>Revenues table</b>.
        Select which fields you want to see. Order of item matters as items will be shown accordingly to these settings.
        Don't forget to <b style="color: red;">SAVE</b>.
      </v-flex>
      <v-divider></v-divider>
      <v-flex row mt-1>
        <table class="draggableTable">
          <thead class="el-table__header">
            <tr>
              <th></th>
              <th style="text-align: left;">Database field</th>
              <th style="text-align: left;">Display value</th>
              <th style="text-align: center;">Visible</th>
            </tr>
          </thead>
          <draggable tag="tbody" v-model="invoicingDetail" class="list-group" handle=".handleSettings" v-bind="dragOptions" @start="drag = true" @end="drag = false">
            <tr v-for="(e) in invoicingDetail" :key="e.value" style="width: 100%;">
              <td><v-icon class="handleSettings" style="width: 30px; text-align: center; cursor: -webkit-grab;" small>drag_indicator</v-icon></td>
              <td style="width: 249px;">{{e.value}}</td>
              <td style="width: 249px;"><input style="width: 100%;" type="text" v-model="e.name" /></td>
              <td><v-checkbox hide-details v-model="e.visible"></v-checkbox></td>
            </tr>
          </draggable>
        </table>
      </v-flex>
    </v-flex>

    <v-divider vertical></v-divider>

    <v-flex column grow>
      <v-layout column>
        <v-flex row style="display: inline-flex;">
          <upload-btn :uniqueId="true" :fileChangedCallback="setPath1301" title="Choose OB daily file path 1301" outline />
          <v-text-field :value="obDailyPath1301" :readonly="true" label="Path to OB Daily file - 1301" />
        </v-flex>
        <v-flex row style="display: inline-flex;">
          <upload-btn :uniqueId="true" :fileChangedCallback="setPath1601" readonly title="Choose OB daily file path 1601" outline />
          <v-text-field :value="obDailyPath1601" :readonly="true" label="Path to OB Daily file - 1601" />
        </v-flex>
      </v-layout>
      
    </v-flex>
  </v-layout>
</template>

<script>
import draggable from 'vuedraggable'
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'SettingsDashboard',
  components: {
    draggable
  },
  created() {
    this.invoicingDetail = JSON.parse(JSON.stringify(this.$store.getters['invoicingDetail']))
  },
  data: () => ({
    drag: false,
    invoicingDetail: null
  }),
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
  methods: {
    ...mapActions(['editProjectsDetail', 'changeInvoicingDetail', 'changeFileLocation']),
    setInvoicingDetails(fileName) {
      this.changeInvoicingDetail({fileName: 'invoicingDetails', invoicingDetail: this.invoicingDetail})
    },
    setPath1301(file) {
      this.changeFileLocation({plant: '1301', path: file.path})
    },
    setPath1601(file) {
      this.changeFileLocation({plant: '1601', path: file.path})
    },
  }
}
</script>

<style>

</style>
