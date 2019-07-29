<template>
  <v-layout row wrap>
    <v-flex column shrink>
      <v-icon
        :color="alert ==='warning' ? 'error' : alert === 'info' ? 'info' : alert ==='report' ? 'warning' : 'success'"
        :title="`Last evaluation: ${templateData.data.riskRegisterBilance.dateChanged || templateData.data.riskRegisterBilance.dateChangedDraft || 'never'}.`"
      >
        {{alert}}
      </v-icon>
      <!-- <div v-html="alert"></div> -->
    </v-flex>
    <v-flex column grow>
      <span v-if="templateData.data.riskRegisterBilance" style="color: #2E7D32;"> {{(templateData.data.riskRegisterBilance.bilanceOpps/1000).toFixed(0)}}K</span>
          / 
      <span v-if="templateData.data.riskRegisterBilance" style="color: #C62828;">{{(templateData.data.riskRegisterBilance.bilanceRisks/1000).toFixed(0)}}K</span>
    </v-flex>
  </v-layout>
</template>

<script>
import moment from 'moment'
export default {
  name: 'RiskRegisterAlert',
  props: ['templateData'],
  computed: {
    alert: function() {
      const dateChanged = this.templateData.data.riskRegisterBilance.dateChanged
      const dateChangedDraft = this.templateData.data.riskRegisterBilance.dateChangedDraft

      if (!dateChanged && dateChangedDraft) return 'report'
      if (!dateChanged) return 'warning'

      const date = new Date()
      const currentDay = Number(moment(date).format('DD'))
      if (currentDay >=15 && (moment(dateChanged).month() !== moment(date).month() )) {
        return 'warning'
      } else if (moment(dateChanged).month() === moment(date).month()) {
        return 'check'
      } else if (moment(date).diff(dateChanged, 'days') > 30) {
        return 'warning'
      } else {
        return 'info'
      }

    }
  }
}
</script>

<style>

</style>
