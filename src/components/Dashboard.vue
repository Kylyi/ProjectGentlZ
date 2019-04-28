<template>
  <v-layout column xs12 wrap>
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Dashboard</h3>
      </v-flex>
      <v-flex column grow>

      </v-flex>
    </v-layout>

    <v-layout v-show="showDev" row wrap v-shortkey="['ctrl', 'alt', 'o']" @shortkey="showDev = !showDev">
      <v-flex row wrap>
        <v-btn @click="getDevTools">Show dev tools</v-btn>
        <v-btn @click="checkForUpdates">Check for updates</v-btn>
      </v-flex>

    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <v-flex column wrap xs8>
          <projects-grid />
        </v-flex>
        <v-flex column wrap xs4 pl-5>
          <!-- RISK REGISTER CHART -->
          <v-layout row wrap v-if="chosenProjects.length > 0 && chosenProjects[0].riskRegister.hasOwnProperty('bilance')" style="min-height: 350px;">
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
import { ipcRenderer } from 'electron'

export default {
  name: 'Dashboard',
  data: () => {
    return {
      showDev: false
    }
  },
  components: {
    ProjectsGrid,
    RiskRegister,
    Tasks
  },
  methods: {
    ...mapActions(['addActiveProjects']),
    getDevTools() {
      ipcRenderer.send('showDevTools')
    },
    checkForUpdates() {
      ipcRenderer.send('check-for-updates')
    }
  },
  computed: mapGetters(['chosenProjects', 'taskInfo'])
}
</script>

<style>

</style>
