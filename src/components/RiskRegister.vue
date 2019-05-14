<template>
  <v-layout id="riskRegister" fluid>
    <v-layout column wrap>
      <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
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
                    <v-layout row wrap justify-center align-center fill-height
                      :style="`width: 100%; height: 32px; margin: 0; background-color: ${step === 1 ? 'black!important' : ''}; color: ${step === 1 ? 'white!important' : ''}; border: 1px dashed black;`"
                    >
                      RISKS
                      <v-icon v-if="step > 1" style="padding-left: 16px;" color="success">check</v-icon>
                    </v-layout>
                  </v-flex>
                  <v-flex column xs4>
                    <v-layout row wrap justify-center align-center fill-height
                      :style="`width: 100%; height: 32px; margin: 0; background-color: ${step === 2 ? 'black!important' : ''}; color: ${step === 2 ? 'white!important' : ''}; border: 1px dashed black;`"
                    >
                      OPPORTUNITIES
                      <v-icon v-if="step > 2" style="padding-left: 16px;" color="success">check</v-icon>
                    </v-layout>
                  </v-flex>
                  <v-flex column xs4>
                    <v-layout row wrap justify-center align-center fill-height
                      :style="`width: 100%; height: 32px; margin: 0; background-color: ${step === 3 ? 'black!important' : ''}; color: ${step === 3 ? 'white!important' : ''}; border: 1px dashed black;`"
                    >
                      FINAL CHECK
                    </v-layout>
                  </v-flex>
                </v-layout>
              </v-card-title>
              <v-card-text>
                <template v-if="step===1 && riskRegister">
                  <risks :risk-register="riskRegister" />
                </template>

                <template v-else-if="step===2 && riskRegister">
                  <opportunities :risk-register="riskRegister" />
                </template>

                <template v-else-if="step===3 && riskRegister">
                  <confirm ref="confirmation" :risk-register="riskRegister" :net="netWithRiskRegister" />
                </template>
              </v-card-text>
              <v-card-actions>
                <v-btn v-if="step !== 1" @click="step = step - 1" outline color="primary">Back</v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="step !== 3" @click="validateCategories(Object.entries(riskRegister[step === 1 ? 'risks' : 'opportunities']), step + 1, true)" outline color="primary">Next</v-btn>
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
    // this.validateCategories(Object.entries(this.riskRegister.risks), 2)
    // this.validateCategories(Object.entries(this.riskRegister.opportunities), 3)
  },
  computed: {
    ...mapGetters(['chosenProjects', 'defaultRiskRegister', 'pmProjectsUniqueProjects'])
  },
  components: { ProjectSelector, Risks, Opportunities, Confirm },
  data: () => {
    return {
      step: 1,
      riskRegister: false,
      netWithRiskRegister: null,
      step2Allowed: false,
      step3Allowed: false
    }
  },
  methods: {
    ...mapActions(['fetchDefaultRiskRegister', 'chooseProjects', 'changeProjectRiskRegister', 'notify']),
    async getRiskRegister() {
      if (this.chosenProjects.length > 0) {
        const allNets = this.$store.state.projects.allProjectsBasic.filter(e => e['Project Definition'] === this.chosenProjects[0]['Project Definition'])
        const netWithRiskRegister = allNets[0]
        this.netWithRiskRegister = netWithRiskRegister

        if (netWithRiskRegister.riskRegister.hasOwnProperty('risks')) {
          this.riskRegister = JSON.parse(JSON.stringify(netWithRiskRegister.riskRegister))
          this.validateCategories(Object.entries(this.riskRegister.risks), 2)
          this.validateCategories(Object.entries(this.riskRegister.opportunities), 3)
        } else {
          this.step2Allowed = false
          this.step3Allowed = false
          this.step = 1
          if (this.defaultRiskRegister.hasOwnProperty(('risks'))) {
            this.riskRegister = this.defaultRiskRegister
          } else {
            await this.fetchDefaultRiskRegister()
            this.riskRegister = JSON.parse(JSON.stringify(this.defaultRiskRegister))
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

      this.riskRegister = false
      this.$nextTick(() => {
        this.getRiskRegister()
      })
    },
    projNetNo (proj) {
      return proj.hasOwnProperty('netsKeys') ?  `${proj['Project Definition']}: ${proj['Project Name'] || ''} (${proj.netsKeys.length} networks)` : `${proj['Project Definition']}`
    },
    async saveRiskRegister() {
      const editedRiskRegister = Object.assign(this.riskRegister, { bilance: this.$refs.confirmation.bilance })
      const netId = this.netWithRiskRegister['_id']
      this.changeProjectRiskRegister({ editedRiskRegister, netId })
    },
    validateCategories(cats = [], step, go) {
      if (this.chosenProjects.length === 0) return

      try {
        cats.forEach(cat => {
        for (let idx = 0; idx < cat[1].length; idx++) {
          const risk = cat[1][idx]
          if (risk.exists) {
            if (risk.description === "" || risk.owner === "" || risk.plannedAction === "" || !risk.probability || !risk.priceImpact) {
              throw 'Nope'
              break
            }   
          } else {
            // catsNotValid[category].push(false)
          }
        }
      })
      this['step'+step+'Allowed'] = true
      if (go) {
        this.step = step
      }
      } catch (error) {
        if (go) this.notify({
          text: 'Not filled properly. You can check which rows are throwing errors by hovering over error icons.',
          state: true,
          color: 'error',
          timeout: 5000
        })
      }
    }
  }
}
</script>

<style>

</style>
