<template>
  <v-layout column wrap>
    <v-flex row wrap><span class="title"><b>PCC</b></span><v-icon>delete</v-icon></v-flex>
    <v-flex row wrap>
      <!-- <table v-if="taskInfo">
        <tr v-for="task in taskInfo" :key="task['Task Num']">
          <td>{{task['Task Num']}}</td>
          <td>{{task['Task Description']}}</td>
          <td>{{task['Task Status']}}</td>
          <td>{{task['May Start']}}</td>
          <td>{{task['Days To Start']}}</td>
          <td>{{task['Total Float']}}</td>
          <td>{{task['Normal Work']}}</td>
          <td>{{task['Normal Work - unit']}}</td>
          <td>{{task['Actual Work']}}</td>
          <td>{{task['Priority']}}</td>
          <td>{{task['Capacity']}}</td>
          <td>{{task['Work percentage']}}</td>
        </tr>
      </table> -->

      <el-table
        v-if="taskInfo"
        :data="taskInfo"
        style="width: 100%;"
      >
        <el-table-column
          prop="May Start"
          label="May start"
        >
          <template slot-scope="scope">
            <v-icon :color="scope.row['May Start'] === 'ANO' ? 'error' : 'info'">new_releases</v-icon>
          </template>
        </el-table-column>
        <el-table-column
          prop="Task Status"
          label="Task status"
        />
        <el-table-column
          prop="Task Num"
          label="Task #"
        />
        <el-table-column
          prop="Task Description"
          label="Task description"
        />
        <el-table-column
          prop="Days to Start"
          label="Days to start"
        />
        <el-table-column
          prop="Actual Work"
          label="Actual work"
        />
        <el-table-column
          prop="Work percentage"
          label="Work done [%]"
        />
      </el-table>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters(['taskInfo'])
  }
}
</script>

<style>

</style>
