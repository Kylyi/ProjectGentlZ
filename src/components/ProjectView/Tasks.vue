<template>
  <v-layout column>
    <dx-data-grid
      ref="tasksGrid"
      :data-source="multipleNetsTasksInfo[paneNet[net]]"
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

      <dx-column
          cell-template="taskDoneTemplate"
          width="20"
        />

        <div
          slot="taskDoneTemplate"
          slot-scope="data">
          <v-icon :disabled="!data.data.MayStart" @click="completeTask(data.data)" style="font-size: small;" color="success">check</v-icon>
        </div>

    </dx-data-grid>
  </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'ProjectViewTasks',
  props: ['paneNet', 'net'],
  computed: {
    ...mapGetters(['taskColumns', 'multipleNetsTasksInfo'])
  }
}
</script>

<style>

</style>
