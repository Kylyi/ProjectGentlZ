<template>
  <v-container id="riskRegister" fluid>
    <v-layout column wrap>
      <!-- Title -->
      <v-flex row wrap>
        <h3 class="display-2 primary--text"><span class="tit">Risk register</span></h3>
      </v-flex>

      <!-- Project Selector -->
      <v-flex row wrap mt-2>
        <multiselect @input="projChange" :value="chosenProjects" :options="pmProjectsUniqueProjects" placeholder="Select project"
          :custom-label="projNetNo" track-by="Project Definition"><span slot="noResult">No projects found.</span></multiselect>
      </v-flex>

      <v-flex row wrap mt-3>
        
        
        <v-card>
          <v-card-title style="padding: 0;">
            <v-layout align-center row wrap>
              <v-flex column xs4><v-btn @click="step=1" outline color="primary" style="width:100%; margin:0;">RISKS</v-btn></v-flex>
              <v-flex column xs4><v-btn @click="step=2" outline color="primary" style="width:100%;margin:0;">OPPORTUNITIES</v-btn></v-flex>
              <v-flex column xs4><v-btn @click="step=3" outline color="primary" style="width:100%;margin:0;">FINAL CHECK</v-btn></v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text>
            <template v-if="step===1">
              <risks :risk-register="riskRegister" />
            </template>

            <template v-else-if="step===2">
              <opportunities :risk-register="riskRegister" />
            </template>

            <template v-else>
              <confirm :risk-register="riskRegister" />
            </template>
          </v-card-text>
          <v-card-actions>
            <v-btn v-if="step !== 1" @click="step = step - 1" outline color="primary">Back</v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="step !== 3" @click="step = step + 1" outline color="primary">Next</v-btn>
          </v-card-actions>
        </v-card>
          

      </v-flex>

      <!-- Stepper -->
      <!-- <v-flex row wrap mt-2 v-if="chosenProjects.length > 0">
        <v-stepper v-model="stepComplete">
          <v-stepper-header>
            <v-stepper-step editable step="1" :complete="stepComplete > 1">Manage risks</v-stepper-step>
            <v-stepper-step editable step="2" :complete="stepComplete > 1">Manage opportunities</v-stepper-step>
            <v-stepper-step step="3" :complete="stepComplete > 2">Confirm</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-layout column mb-3 min-height="200">
                <risks :risk-register="riskRegister" />
              </v-layout>
              <v-flex row wrap text-xs-right>
                <v-btn color="primary" outline @click="stepComplete=2">Next</v-btn>
              </v-flex>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-layout column mb-3 min-height="200">
                <opportunities :risk-register="riskRegister" />
              </v-layout>
              <v-layout row wrap text-xs-right>
                <v-flex column xs6 text-xs-left>
                  <v-btn color="primary" outline @click="stepComplete=1">Back</v-btn>
                </v-flex>

                <v-flex column xs6 text-xs-right>
                  <v-btn color="primary" outline @click="stepComplete=3">Next</v-btn>
                </v-flex>
                
              </v-layout>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-layout column mb-3 min-height="200">
                <confirm :risk-register="riskRegister" />
              </v-layout>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-flex>

      <v-flex row wrap mt-2 v-else style="min-height: 200;">
        <v-layout column wrap justify-center align-center>
          Choose a project first.
        </v-layout>
      </v-flex> -->

    </v-layout>
  </v-container>
</template>

<script>
import ProjectSelector from './TemplateGenerator/ProjectSelector'
import Risks from './RiskRegister/Risks'
import Opportunities from './RiskRegister/Opportunities'
import Confirm from './RiskRegister/Confirm'
import { mapGetters, mapActions } from 'vuex';
export default {
  name: "RiskRegister",
  async created () {
    this.getRiskRegister()
  },
  computed: {
    ...mapGetters(['chosenProjects', 'defaultRiskRegister', 'pmProjectsUniqueProjects'])
  },
  components: { ProjectSelector, Risks, Opportunities, Confirm },
  data: () => {
    return {
      step: 1,
      riskRegister: []
    }
  },
  methods: {
    ...mapActions(['fetchDefaultRiskRegister', 'chooseProjects']),
    async getRiskRegister() {
      if (this.chosenProjects.length > 0) {
        const allNets = this.$store.state.projects.allProjectsBasic.filter(e => e['Project Definition'] === this.chosenProjects[0]['Project Definition'])
        const netWithRiskRegister = allNets[0]

        if (netWithRiskRegister.riskRegister.hasOwnProperty('risks')) {
          this.riskRegister = JSON.parse(JSON.stringify(netWithRiskRegister.riskRegister))
        } else {
          if (this.defaultRiskRegister.length > 0) {
            this.riskRegister = this.defaultRiskRegister
          } else {
            await this.fetchDefaultRiskRegister()
            this.riskRegister = this.defaultRiskRegister
          }
        }
      }
    },
    async projChange (proj) {
      if (proj) {
        await this.chooseProjects(proj)
      } else {
        await this.chooseProjects([])
      }

      this.getRiskRegister()
    },
    projNetNo (proj) {
      return proj ?  `${proj['Project Definition']} — ${proj.netsKeys.length} networks` : ''
    },
  }
}
</script>

<style>

</style>
