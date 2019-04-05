<template>
  <v-layout column wrap>
    <v-layout row wrap>
      <v-layout column wrap shrink><h1 display-3 class="myHeading" style="padding-right: 10px;">PCC</h1></v-layout>
      <v-layout column wrap shrink justify-center><v-icon>delete</v-icon></v-layout>
    </v-layout>
    <v-flex row wrap>

      <el-table
        v-if="taskInfo"
        :data="taskInfo"
        style="width: 100%;"
        max-height="450"
      >
        <el-table-column
          prop="May Start"
          label="May start"
          align="center"
        >
          <template slot-scope="scope">
            <v-btn
              icon
              @click="changeTaskDone"
            >
              <v-icon
                :color="scope.row['May Start'] === 'ANO' ? 'success' : 'error'"
                v-html="scope.row['May Start'] === 'ANO' ? 'mood' : 'sentiment_dissatisfied'"
              />
            </v-btn>
          </template>
        </el-table-column>
        <el-table-column
          prop="Task Num"
          label="Task #"
          align="center"
        />
        <el-table-column
          prop="Task Description"
          label="Task description"
          min-width="250"
          align="center"
        />
        <el-table-column
          prop="Days to Start"
          label="Days to start"
          align="center"
        />
        <el-table-column
          prop="Actual Work"
          label="Actual work"
          align="center"
        />
        <el-table-column
          prop="Work percentage"
          label="% done"
          align="center"
        />
        <el-table-column
          prop="Task Status"
          label="Status"
          align="center"
        >
          <template slot-scope="scope">
            <v-icon
              :color="scope.row['Task Status'] === 'NS' ? 'error' : 'success'"
              v-html="scope.row['Task Status'] === 'NS' ? 'clear' : 'check'"
              :title="scope.row['Task Status'] === 'NS' ? 'Not started.' : 'Vim jen, co je NS, ostatni nevim, co znamenaji :)'"
            />
          </template>
        </el-table-column>
      </el-table>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  computed: {
    ...mapGetters(['taskInfo'])
  },
  methods: {
    ...mapActions(['notify']),
    changeTaskDone() {
      this.notify({
        text: 'This will work once I get SAP connector :)',
        state: true,
        color: 'info'
      }) 
    }
  }
}
</script>

<style>

</style>
