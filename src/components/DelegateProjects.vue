<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex column shrink>
        <h3 class="display-2"><span class="tit">Delegate projects</span></h3>
      </v-flex>
      <v-flex column grow>
        <b style="color: red;">IN DEVELOPMENT!</b>
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <!-- LEFT SIDE -->
      <v-flex column xs7>
        <v-flex row wrap>
          <!-- ALL PROJECTS -->
          <el-table
            :data="allProjectsProjectsMode"
            style="width: 100%;"
            height="700"
            :lazy="true"
            >
            <el-table-column
              prop="project_id"
              label="Project #"
              sortable
              align="left"
              width="110"
            />
            <el-table-column
              prop="project_name"
              label="Project name"
              sortable
              align="left"
              min-width="230"
            />
            <el-table-column
              prop="project_pm"
              label="PM"
              sortable
              align="center"
              min-width="165"
            />
            <el-table-column
              prop="project_revenue"
              label="Revenue"
              align="left"
              min-width="125"
              sortable
            />
            <el-table-column
              label="Assigned"
              min-width="80"
              align="center"
            >
              <template slot-scope="scope">
                <v-icon 
                  :color="scope.row.temporaryAssign.hasOwnProperty('personName') && scope.row.temporaryAssign.personName.length > 0 ? 'error' : ''" 
                  v-html="'supervised_user_circle'" 
                  :title="scope.row.temporaryAssign.hasOwnProperty('personName') && scope.row.temporaryAssign.personName.length > 0 ? String(scope.row.temporaryAssign.personName) : ''"
                />
              </template>
            </el-table-column>
          </el-table>
        </v-flex>
      </v-flex>

      <!-- MIDDLE -->
      <v-flex column xs1>
        <v-layout align-center justify-center column fill-height>
          <v-btn icon><v-icon>chevron_right</v-icon></v-btn>
          <v-btn icon><v-icon>chevron_left</v-icon></v-btn>
        </v-layout>
      </v-flex>

      <!-- RIGHT SIDE -->
      <v-flex column xs4>
        <multiselect :value="selectedPM" :options="uniquePms" placeholder="Select person" :searchable="true" @input="selectPM">
          <span slot="noResult">No networks found.</span>
        </multiselect>

        <el-table
            :data="selectedPmProjects"
            style="width: 100%;"
            height="700"
            :lazy="true"
            >
            <el-table-column
              prop="project_id"
              label="Project #"
              sortable
              align="left"
              width="110"
            />
            <el-table-column
              prop="project_name"
              label="Project name"
              sortable
              align="left"
              min-width="230"
            />
            <el-table-column
              label="Assigned"
              min-width="80"
              align="center"
            >
              <template slot-scope="scope">
                <v-icon 
                  :color="getColor(scope.row)" 
                  v-html="'supervised_user_circle'" 
                  :title="getTitle(scope.row)"
                />
              </template>
            </el-table-column>
          </el-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'DelegateProjects',
  data: () => {
    return {
      chosenPerson: null
    }
  },
  computed: {
    ...mapGetters(['allProjectsProjectsMode', 'uniquePms', 'selectedPM', 'selectedPmProjects'])
  },
  methods: {
    ...mapActions(['selectPM']),
    getColor({temporaryAssign, project_pm}) {
      if (temporaryAssign.hasOwnProperty('personName') && temporaryAssign.personName.length > 0) {
        const currentUserSapName = this.selectedPM
        if (temporaryAssign.personName.includes(currentUserSapName)) {
          return 'error'
        } else if (project_pm === currentUserSapName) {
          return 'success'
        } else {
          return ''
        }
      } else {
        return ''
      }
    },
    getTitle({temporaryAssign, project_pm}) {
      if (temporaryAssign.hasOwnProperty('personName') && temporaryAssign.personName.length > 0) {
        const currentUserSapName = this.selectedPM
        if (temporaryAssign.personName.includes(currentUserSapName)) {
          return 'This project was delegated TO currently selected PM.'
        } else if (project_pm === currentUserSapName) {
          return 'This project was delegated FROM currently selected PM.'
        } else {
          return ''
        }
      } else {
        return ''
      }
    },
  }
}
</script>

<style>

</style>
