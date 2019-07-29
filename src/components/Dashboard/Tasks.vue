<template>
  <v-layout id="tasksQuickview" column style="max-height: 100%; background-color: white;">
    <h5 class="headline" style="z-index:3; position: absolute; left: 16px; top: 4px;"><b>Tasks</b></h5>
    <p style="display: none;">{{ tableLoading }}</p>

    <v-layout row wrap mt-2 style="max-height: 100%;">
      <dx-data-grid
        ref="tasksGrid"
        :data-source="taskInfo"
        show-borders
        key-expr='TaskID'
        column-auto-width
        :allow-column-reordering="true"
        :allow-column-resizing="true"
        :row-alternation-enabled="true"
        :show-row-lines="true"
        :show-column-lines="true"
        :word-wrap-enabled="true"
        :column-min-width="20"
        no-data-text="No network selected or possible connection problems."
      >
        <dx-header-filter
          :visible="true"
          :allow-search="true"
        />

        <dx-column-chooser :enabled="true"/>
        <dx-state-storing
          :enabled="true"
          type="localStorage"
          storage-key="tasksGrid"
          :savingTimeout="2000"
        />

        <dx-column
          v-for="col in taskColumns"
          :key="col.value"
          :caption="col.name"
          :data-field="col.value"
          :data-type="col.dataType"
          :format="col.dataType === 'number' ? '#,##0' : col.dataType === 'date' ? 'dd.MM.yy' : ''"
          :visible="col.visible"
        />

      </dx-data-grid>
      
    </v-layout>
  </v-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  created() {
    if (!this.taskColumns) {
      this.setTaskColumns()
    }
  },
  computed: {
    ...mapGetters(['taskInfo', 'tasksLoading', 'taskColumns']),
    tableLoading: function() {
      if (!this.$refs['tasksGrid']) return this.tasksLoading

      if (this.tasksLoading) {
        this.$refs['tasksGrid'].instance.beginCustomLoading('Fetching data from SAP.')
      } else {
        this.$refs['tasksGrid'].instance.endCustomLoading()
      }
      return this.tasksLoading
    }
  },
  methods: {
    ...mapActions(['notify', 'setTaskColumns'])
  }
}
</script>

<style>
#tasksQuickview .dx-datagrid-header-panel {
  padding-right: 4px;
}
</style>
