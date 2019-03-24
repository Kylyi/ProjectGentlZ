<template>
  <v-container>
    <v-layout row>
      <v-flex xs10>
        <h3 class="display-2 primary--text"><span class="tit">Dashboard</span></h3>
      </v-flex>
      <v-flex xs2 text-xs-right> 
        
      </v-flex>
    </v-layout>

    <v-layout row mt-4>
      <v-flex column wrap xs6>
        <projects-grid />
      </v-flex>
      <v-flex column wrap xs6>
        <!-- RISK REGISTER CHART -->
        <risk-register v-if="riskRegisterTraces.data.length > 0" />
        <v-layout row v-else justify-center align-center style="min-height:200px;">
          No risk register available.
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import ProjectsGrid from './Dashboard/ProjectsGrid'
import RiskRegister from './Dashboard/RiskRegister'
import { mapGetters, mapActions } from "vuex";

export default {
  name: 'Dashboard',
  components: {
    ProjectsGrid,
    RiskRegister
  },
  methods: {
    ...mapActions(['addActiveProjects'])
  },
  computed: mapGetters(['riskRegisterTraces'])
}
</script>
