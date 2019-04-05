<template>
  <v-container id="riskRegister" fluid>
    <v-layout column wrap>
      <!-- Title -->
      <v-flex row wrap>
        <h3 class="display-2 primary--text"><span class="tit">Risk register</span></h3>
      </v-flex>

      <!-- Project Selector -->
      <v-flex row wrap mt-2>
        <project-selector :forceMode="'project'" />
      </v-flex>

      <!-- Stepper -->
      <v-flex row wrap mt-2>
        <v-stepper v-model="stepComplete">
          <v-stepper-header>
            <v-stepper-step editable step="1" :complete="stepComplete > 1">Manage risks</v-stepper-step>
            <v-stepper-step editable step="2" :complete="stepComplete > 1">Manage opportunities</v-stepper-step>
            <v-stepper-step step="3" :complete="stepComplete > 2">Confirm</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-layout column mb-3 min-height="200">
                <risks />
              </v-layout>
              <v-flex row wrap text-xs-right>
                <v-btn color="primary" outline @click="stepComplete=2">Next</v-btn>
              </v-flex>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-layout column mb-3 min-height="200">
                <opportunities />
              </v-layout>
              <v-flex row wrap text-xs-right>
                <v-btn color="primary" outline @click="stepComplete=3">Next</v-btn>
              </v-flex>
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-layout column mb-3 min-height="200">
                <confirm />
              </v-layout>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
import ProjectSelector from './TemplateGenerator/ProjectSelector'
import Risks from './RiskRegister/Risks'
import Opportunities from './RiskRegister/Opportunities'
import Confirm from './RiskRegister/Confirm'
export default {
  name: "RiskRegister",
  components: { ProjectSelector, Risks, Opportunities, Confirm },
  data: () => {
    return {
      stepComplete: 1
    }
  }
}
</script>

<style>
#app .el-table .cell {
  word-break: break-word;
}
#riskRegister .v-expansion-panel {
  box-shadow: none;
}
#riskRegister .v-input--selection-controls__input {
  height: 40px;
}
</style>
