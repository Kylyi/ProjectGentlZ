<template>
  <v-layout id="riskRegister">
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
          <!-- Project Selector & Properties setting -->
          <v-layout row wrap>
            <v-flex column shrink pr-2 align-center justify-center v-if="netWithRiskRegister">
              <v-menu
                offset-y
                :close-on-content-click="false"
                min-width="406"
                max-width="406"
              >
                <template v-slot:activator="{ on }">
                  <v-btn color="primary" v-on="on" depressed style="margin: 2px 0 0 0;"><v-icon>list</v-icon></v-btn>
                </template>

                <v-container style="background-color: white; padding: 4px;">
                  <v-layout row wrap>
                    <v-flex column shrink pr-2>
                      <v-text-field
                        :value="netWithRiskRegister.extraFields.hasOwnProperty('chargePerDayPercent') ? netWithRiskRegister.extraFields['chargePerDayPercent'] : 0.1"
                        type="number"
                        ref="chargePerDayPercent"
                        label="Charge per day [0 - 100%]"
                        :max="100"
                        :min="0"
                      ></v-text-field>

                      <v-text-field
                        :value="netWithRiskRegister.extraFields.hasOwnProperty('maxChargePercent') ? netWithRiskRegister.extraFields['maxChargePercent'] : 5"
                        type="number"
                        ref="maxChargePercent"
                        label="Maximum charge [0 - 100%]"
                      ></v-text-field>
                    </v-flex>

                    <v-flex column shrink>
                      <v-text-field
                        :value="netWithRiskRegister.extraFields.hasOwnProperty('warehouseTime') ? netWithRiskRegister.extraFields['warehouseTime'] : 0"
                        type="number"
                        ref="warehouseTime"
                        label="Warehouse time"
                      ></v-text-field>

                      <v-text-field
                        :value="netWithRiskRegister.extraFields.hasOwnProperty('guaranteePercent') ? netWithRiskRegister.extraFields['guaranteePercent'] : 5"
                        type="number"
                        ref="guaranteePercent"
                        label="Guarantee [0 - 100%]"
                      ></v-text-field>
                    </v-flex>

                    <v-flex row wrap>
                      <v-layout row>
                        <v-flex column xs9 style="display: flex; align-items: center;text-align: justify;">
                          <span style="font-size: smaller;"><i>These settings won't be saved until you complete risk register.</i></span>
                        </v-flex>
                        <v-flex column xs3 text-xs-right>
                          <v-btn icon @click="modifyExtraFields"><v-icon>save</v-icon></v-btn>
                        </v-flex>
                      </v-layout>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-menu>
            </v-flex>
            <v-flex column grow>
              <multiselect @input="projChange" :value="chosenProjects" :options="pmProjects" placeholder="Select project"
              :custom-label="projNetNo" track-by="Project Definition"><span slot="noResult">No projects found.</span></multiselect>
            </v-flex>
          </v-layout>

          <v-flex row wrap mt-3 v-if="netWithRiskRegister && Object.keys(netWithRiskRegister.extraFields).length === 6 ">
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
                  <risks ref="risks" :risk-register="riskRegister" :net="netWithRiskRegister" />
                </template>

                <template v-else-if="step===2 && riskRegister">
                  <opportunities ref="opportunities" :risk-register="riskRegister" :net="netWithRiskRegister" />
                </template>

                <template v-else-if="step===3 && riskRegister">
                  <confirm ref="confirmation" :risk-register="riskRegister" :net="netWithRiskRegister" />
                </template>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="newItemDialog = true" depressed outline v-if="step < 3">Create custom {{step === 1? 'risk' : 'opportunity'}}</v-btn>
                <v-spacer></v-spacer>
                <v-btn v-if="step !== 1" @click="step = step - 1" outline color="primary">Back</v-btn>
                <v-btn v-if="step !== 3" @click="step = step + 1" outline color="primary">Next</v-btn>
                <v-divider vertical style="padding-left: 8px;"></v-divider>
                <!-- @click="validateCategories(Object.entries(riskRegister[step === 1 ? 'risks' : 'opportunities']), step + 1, true)" -->
                <v-btn v-if="step === 3" color="accent" @click="saveRiskRegister(true)" style="margin-left: 8px;">Save draft</v-btn>
                <v-btn v-if="step === 3" color="primary" @click="saveRiskRegister(false)">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
          <v-flex row wrap mt-3 v-else-if="netWithRiskRegister" text-xs-center>
            Selected project doesn't have all the necessary data to create risk register. Please click on the red <v-icon color="primary">list</v-icon> to complete the data.
          </v-flex>
          <v-flex row wrap mt-3 v-else text-xs-center>
            Select project first. Created risk register is added to the <b>FIRST network</b> of selected project by design.
          </v-flex>

        </v-container>

      </v-flex>
    </v-layout>

    <new-item v-if="riskRegister && Object.keys(netWithRiskRegister.extraFields).length === 6" :risk-register="riskRegister" :step="step" :new-item-dialog="newItemDialog" ></new-item>
  </v-layout>
</template>

<script>
import ProjectSelector from './TemplateGenerator/ProjectSelector'
import Risks from './RiskRegister/Risks'
import Opportunities from './RiskRegister/Opportunities'
import Confirm from './RiskRegister/Confirm'
import NewItem from './RiskRegister/NewItem'

import { mapGetters, mapActions } from 'vuex';
export default {
  name: "RiskRegister",
  async created () {
    this.getRiskRegister()
    this.calculateFields()
  },
  computed: {
    ...mapGetters(['chosenProjects', 'defaultRiskRegister', 'pmProjects'])
  },
  components: { ProjectSelector, Risks, Opportunities, Confirm, NewItem },
  data: () => {
    return {
      step: 1,
      riskRegister: false,
      netWithRiskRegister: null,
      step2Allowed: false,
      step3Allowed: false,
      worstBPO: 0,
      allNets: [],
      newItemDialog: false
    }
  },
  methods: {
    ...mapActions(['fetchDefaultRiskRegister', 'chooseProjects', 'changeProjectRiskRegister', 'notify', 'changeProjectData']),
    async getRiskRegister() {
      if (this.chosenProjects.length > 0) {
        const allNets = this.$store.state.projects.allProjectsBasic.filter(e => e['Project Definition'] === this.chosenProjects[0]['Project Definition'])
        this.worstBPO = Math.min(allNets.reduce((agg, e) => { return e['Buffer Size - Overall Project'] < agg ? e['Buffer Size - Overall Project'] : agg }, 0), 0)

        this.allNets = JSON.parse(JSON.stringify(allNets))
        const netWithRiskRegister = JSON.parse(JSON.stringify(allNets[0]))
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
            this.riskRegister = JSON.parse(JSON.stringify(this.defaultRiskRegister))
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
        this.netWithRiskRegister = null
        this.riskRegister = false
        await this.chooseProjects([])
        return
      }

      this.riskRegister = false
      this.$nextTick(() => {
        this.getRiskRegister()
          .then(() => this.calculateFields())
          .then(() => {
            if (this.netWithRiskRegister && Object.keys(this.netWithRiskRegister.extraFields).length === 6) this.modifyExtraFields()
          })
      })
    },
    projNetNo (proj) {
      return `${proj['Project Definition']}: ${proj['Project Name'] || ''}`
    },
    async saveRiskRegister(isDraft = false) {
      if (!isDraft) {
        this.validateCategories(Object.entries(this.riskRegister.risks), 2)
        this.validateCategories(Object.entries(this.riskRegister.opportunities), 3)
        
        if (!this.step2Allowed ||!this.step3Allowed ) {
          this.notify({
            text: 'You cannot save incomplete risk register! Although, you can save a draft for now.',
            state: true,
            color: 'error',
            timeout: 5000
          })
          return
        }
      }

      const editedRiskRegister = Object.assign(this.riskRegister, { bilance: this.$refs.confirmation.bilance })
      const net = this.netWithRiskRegister

      net.riskRegister = editedRiskRegister
      const extraFields = net.extraFields

      if (extraFields.strategicProject && extraFields.fixedInstallation) {
        net.priority = 'Strategic project & fixed installation'
      } else if(extraFields.strategicProject) {
        net.priority = 'Strategic project'
      } else if (extraFields.fixedInstallation) {
        net.priority = 'Fixed installation'
      } else {
        net.priority = ''
      }

      const date = new Date()
      
      if (isDraft) {
        net.riskRegister.bilance.draft = true
        net.riskRegister.bilance.dateChangedDraft = date.toISOString().substr(0,10)
      } else {
        net.riskRegister.bilance.draft = false
        net.riskRegister.bilance.dateChanged = date.toISOString().substr(0,10)
      }

      this.changeProjectData(net)
    },
    validateCategories(cats = [], step, go) {
      if (this.chosenProjects.length === 0) return

      try {
        cats.forEach(cat => {
        for (let idx = 0; idx < cat[1].length; idx++) {
          const risk = cat[1][idx]
          if (risk.exists) {
            if (risk.description === "" || risk.owner === "" || risk.plannedAction === "") {
              this['step'+step+'Allowed'] = false
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
    },
    calculateFields() {
      if (!this.netWithRiskRegister || Object.keys(this.netWithRiskRegister.extraFields).length < 6) return
      const worstBPO = this.worstBPO
      const projectData = this.netWithRiskRegister
      const extraFields = this.netWithRiskRegister.extraFields

      for (let [key, value] of Object.entries(this.riskRegister.risks)) {
        value.forEach(risk => {
          if (risk.hasOwnProperty('priceImpactCalculated')) {
            risk.priceImpact = eval(risk.priceImpactCalculated)
          }
        })
      }
    },
    modifyExtraFields() {
      if (!Object.keys(this.netWithRiskRegister.extraFields).length < 6) {
        this.netWithRiskRegister.extraFields = {
          fixedInstallation: true,
          strategicProject: true
        }
      }

      this.netWithRiskRegister.extraFields['guaranteePercent'] = Number(this.$refs['guaranteePercent'].internalValue)
      this.netWithRiskRegister.extraFields['chargePerDayPercent'] = Number(this.$refs['chargePerDayPercent'].internalValue)
      this.netWithRiskRegister.extraFields['maxChargePercent'] = Number(this.$refs['maxChargePercent'].internalValue)
      this.netWithRiskRegister.extraFields['warehouseTime'] = Number(this.$refs['warehouseTime'].internalValue)

      this.calculateFields()
      this.$forceUpdate()

      this.$nextTick(() => {
        if (this.step === 1) {
          this.$refs['risks'].validateCategories(Object.entries(this.riskRegister.risks))
        } else if (this.step === 2) {
          this.$refs['opportunities'].validateCategories(Object.entries(this.riskRegister.opportunities))
        }
      })
    }
  }
}
</script>

<style>
  #riskRegister .v-btn-toggle--selected {
    box-shadow: none;
  }

  .btnToggleRR > .v-btn--active {
    color: #ef5350!important;
  }
</style>
