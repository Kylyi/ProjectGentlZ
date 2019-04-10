<template>
  <v-layout column xs12 wrap>
    <v-layout row wrap style="padding: 28px 24px; background-color: #424242;">
      <v-flex column shrink>
        <h3 class="display-2 white--text">Dashboard</h3>
      </v-flex>
      <v-flex column grow>

      </v-flex>
    </v-layout>
    <v-container fluid>
      <v-layout row wrap>
        <v-flex column wrap xs8>
          <projects-grid />
        </v-flex>
        <v-flex column wrap xs4 pl-5>
          <!-- RISK REGISTER CHART -->
          <v-layout row wrap v-if="riskRegisterTraces.data.length > 0" style="min-height: 350px;">
            <risk-register />
          </v-layout>
          
          <v-layout row v-else justify-center align-center style="min-height: 350px;">
            No risk register available.
          </v-layout>

          <!-- PCC -->
          <!-- <v-layout row wrap v-if="taskInfo">
            <tasks style="margin-top: 20px;" />
          </v-layout>
          <v-layout v-else row justify-center align-center style="min-height: 350px;">
            No network selected. Click any row in My projects table.
          </v-layout> -->
        </v-flex>
      </v-layout>
    </v-container>

  </v-layout>
</template>

<script>
import ProjectsGrid from './Dashboard/ProjectsGrid'
import RiskRegister from './Dashboard/RiskRegister'
import Tasks from './Dashboard/Tasks'
import { mapGetters, mapActions } from "vuex";

export default {
  name: 'Dashboard',
  components: {
    ProjectsGrid,
    RiskRegister,
    Tasks
  },
  methods: {
    ...mapActions(['addActiveProjects'])
  },
  computed: mapGetters(['riskRegisterTraces', 'taskInfo'])
}
</script>

<style>

</style>
