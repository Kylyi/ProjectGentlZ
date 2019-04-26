<template>
  <v-layout id="riskRegister" fluid>
    <v-layout column wrap>
      <!-- Title -->
      <v-layout row wrap style="padding: 28px 24px; background-color: #424242;">
        <v-flex column shrink>
          <h3 class="display-2 white--text">Manage risk register</h3>
        </v-flex>
        <v-flex column grow>

        </v-flex>
      </v-layout>

      <v-flex row wrap>
        <v-container fluid>
          <!-- Project Selector -->
          <v-flex row wrap mt-2>
            <multiselect @input="projChange" :value="chosenProjects" :options="pmProjectsUniqueProjects" placeholder="Select project"
              :custom-label="projNetNo" track-by="Project Definition"><span slot="noResult">No projects found.</span></multiselect>
          </v-flex>




          <v-flex row wrap mt-3 v-if="chosenProjects.length > 0">
            <v-card>
              <v-card-title style="padding: 0;">
                <v-layout align-center row wrap>
                  <v-flex column xs4>
                    <v-btn @click="step=1" outline
                      :style="`width: 100%; margin: 0; background-color: ${step === 1 ? 'black!important' : ''}; color: ${step === 1 ? 'white!important' : ''};`"
                    >
                      RISKS
                    </v-btn>
                  </v-flex>
                  <v-flex column xs4>
                    <v-btn @click="step=2" outline
                      :style="`width: 100%; margin: 0; background-color: ${step === 2 ? 'black!important' : ''}; color: ${step === 2 ? 'white!important' : ''};`"
                    >
                      OPPORTUNITIES
                    </v-btn>
                  </v-flex>
                  <v-flex column xs4>
                    <v-btn @click="step=3" outline
                      :style="`width: 100%; margin: 0; background-color: ${step === 3 ? 'black!important' : ''}; color: ${step === 3 ? 'white!important' : ''};`"
                    >
                      FINAL CHECK
                    </v-btn>
                  </v-flex>
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
                  <confirm ref="confirmation" :risk-register="riskRegister" :net="netWithRiskRegister" />
                </template>
              </v-card-text>
              <v-card-actions>
                <v-btn v-if="step !== 1" @click="step = step - 1" outline color="primary">Back</v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="step !== 3" @click="step = step + 1" outline color="primary">Next</v-btn>
                <v-btn v-if="step === 3" color="primary" @click="saveRiskRegister">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
          <v-flex row wrap mt-3 v-else text-xs-center>
            Select project first. Created risk register is added to the <b>FIRST network</b> of selected project by design.
          </v-flex>

        </v-container>

      </v-flex>
      
    </v-layout>
  </v-layout>
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
      riskRegister: [],
      netWithRiskRegister: null
    }
  },
  methods: {
    ...mapActions(['fetchDefaultRiskRegister', 'chooseProjects', 'changeProjectRiskRegister']),
    async getRiskRegister() {
      if (this.chosenProjects.length > 0) {
        const allNets = this.$store.state.projects.allProjectsBasic.filter(e => e['Project Definition'] === this.chosenProjects[0]['Project Definition'])
        const netWithRiskRegister = allNets[0]
        this.netWithRiskRegister = netWithRiskRegister

        if (netWithRiskRegister.riskRegister.hasOwnProperty('risks')) {
          this.riskRegister = JSON.parse(JSON.stringify(netWithRiskRegister.riskRegister))
        } else {
          if (this.defaultRiskRegister.hasOwnProperty(('risks'))) {
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
      return proj.hasOwnProperty('netsKeys') ?  `${proj['Project Definition']} — ${proj.netsKeys.length} networks` : ''
    },
    async saveRiskRegister() {
      const editedRiskRegister = Object.assign(this.riskRegister, { bilance: this.$refs.confirmation.bilance })
      const netId = this.netWithRiskRegister['_id']
      this.changeProjectRiskRegister({ editedRiskRegister, netId })
    }
  }
}
</script>

<style>

</style>
