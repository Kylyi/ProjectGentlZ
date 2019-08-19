<template>
  <v-dialog
    v-model="dialog"
    scrollable 
    persistent
    max-width="1200px"
    transition="dialog-transition"
  >
    <v-container fluid style="background-color: white;">
      <v-layout row mb-2 style="display: flex; justify-content: center;">
        <v-flex column shrink pr-4>
          <table>
            <tr>
              <td rowspan="4" style="width: 110px;"><span><b>Raw material</b></span></td>
              <td style="text-align: right; vertical-align: bottom;"><b>LV</b></td>
              <td>
                <vue-numeric
                  v-model="realCostsData['rmLv']"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="text-align: right; vertical-align: bottom;"><b>MV</b></td>
              <td>
                <vue-numeric
                  v-model="realCostsData['rmMv']"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="text-align: right; vertical-align: bottom;"><b>UV</b></td>
              <td>
                <vue-numeric
                  v-model="realCostsData['rmUv']"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="width: 60px; text-align: right; vertical-align: bottom;"><b>TOTAL</b></td>
              <td>
                <vue-numeric
                  :value="rmTotal"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                  :read-only="true"
                ></vue-numeric>
              </td>
            </tr>
          </table>
        </v-flex>

        <v-flex column shrink pr-4>
          <table>
            <tr>
              <td rowspan="4" style="width: 125px;"><span><b>Work in progress</b></span></td>
              <td style="text-align: right; vertical-align: bottom;"><b>LV</b></td>
              <td>
                <vue-numeric
                  v-model="realCostsData['wipLv']"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="text-align: right; vertical-align: bottom;"><b>MV</b></td>
              <td>
                <vue-numeric
                  v-model="realCostsData['wipMv']"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="text-align: right; vertical-align: bottom;"><b>UV</b></td>
              <td>
                <vue-numeric
                  v-model="realCostsData['wipUv']"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="width: 60px; text-align: right; vertical-align: bottom;"><b>TOTAL</b></td>
              <td>
                <vue-numeric
                  :value="wipTotal"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                  :read-only="true"
                ></vue-numeric>
              </td>
            </tr>
          </table>
        </v-flex>

        <v-flex column shrink style="display: flex; align-items: center;">
          <table>
            <tr>
              <td style="width: 125px;"><span><b>Finished goods</b></span></td>
              <td>
                <vue-numeric
                  v-model="realCostsData['fg']"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
          </table>
        </v-flex>
      </v-layout>

      <v-divider></v-divider>

      <v-layout row mt-2>
        <v-flex column xs6>
          <v-btn color="accent" @click="dialog = false">Cancel</v-btn>
        </v-flex>
        <v-flex column xs6 text-xs-right>
          <v-btn @click="saveRealData" color="primary">save</v-btn>
        </v-flex>
      </v-layout>
    </v-container>
  </v-dialog>
</template>

<script>
import moment from 'moment'
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'CostsRealDataDialog',
  created() {
    this.getRealCostsDataObject()
  },
  data() {
    return {
      dialog: false,
      realCostsData: {},
      date: moment().format('YYYY-MM-DD')
    }
  },
  computed: {
    ...mapGetters(['costsSettings']),
    rmTotal() {
      return (Number(this.realCostsData['rmLv']) || 0) + (Number(this.realCostsData['rmMv']) || 0) + (Number(this.realCostsData['rmUv']) || 0)
    },
    wipTotal() {
      return (Number(this.realCostsData['wipLv']) || 0) + (Number(this.realCostsData['wipMv']) || 0) + (Number(this.realCostsData['wipUv']) || 0)
    }
  },
  methods: {
    ...mapActions(['overwriteCostsSettings']),
    getRealCostsDataObject() {
      const date = this.date
      this.realCostsData = {
        ['rmLv']: 0,
        ['rmMv']: 0,
        ['rmUv']: 0,
        ['wipLv']: 0,
        ['wipMv']: 0,
        ['wipUv']: 0,
        ['fg']: 0
      }
    },
    saveRealData() {
      const realData = Object.assign(this.realCostsData, {
        ['rmTotal']: this.rmTotal,
        ['wipTotal']: this.wipTotal
      })
      this.overwriteCostsSettings({
        realData: {
          [this.date]: realData
        },
        lastUpdate: this.date,
        lastUpdateMonth: moment(this.date).format('YYYY-MM')
      })
    }
  }
}
</script>