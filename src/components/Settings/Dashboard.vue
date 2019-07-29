<template>
  <v-layout row>
    <v-flex column shrink>
      <v-flex row mb-1 style="width: 580px;">
        This sets up which data will be shown when clicked on <b>detail</b> in <b>Dashboard - My projects</b> table.
        Select fields you want to see. Order of items matters as items will be shown accordingly to these settings.
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
          <draggable tag="tbody" v-model="projectsDetail" class="list-group" handle=".handleSettings" v-bind="dragOptions" @start="drag = true" @end="drag = false">
            <tr v-for="(e) in projectsDetail" :key="e.value" style="width: 100%;">
              <td><v-icon class="handleSettings" style="width: 30px; text-align: center; cursor: -webkit-grab;" small>drag_indicator</v-icon></td>
              <td style="width: 249px;">{{e.value}}</td>
              <td style="width: 249px;"><input style="width: 100%;" type="text" v-model="e.name" /></td>
              <td><v-checkbox hide-details v-model="e.visible"></v-checkbox></td>
            </tr>
          </draggable>
        </table>
      </v-flex>
    </v-flex>
    <v-flex column grow>
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
    this.projectsDetail = JSON.parse(JSON.stringify(this.$store.getters['projectsDetail']))
  },
  data: () => ({
    drag: false,
    projectsDetail: null
  }),
  computed: {
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
    ...mapActions(['editProjectsDetail']),
    setProjectDetails(fileName) {
      this.editProjectsDetail({fileName, projectsDetailObj: this.projectsDetail})
    }
  }
}
</script>

<style>

</style>
