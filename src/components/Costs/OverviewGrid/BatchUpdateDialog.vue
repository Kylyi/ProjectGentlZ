<template>
  <v-dialog
    v-model="dialog"
    scrollable 
    persistent
    max-width="800px"
    transition="dialog-transition"
  >
    <v-container fluid style="background-color: white;">
      <v-layout row mb-2 style="display: flex; justify-content: center;">
        <v-flex column shrink pr-4>
          <table>
            <tr>
              <td rowspan="3" style="width: 110px;"><span><b>Leadtimes</b></span></td>
              <td style="text-align: right; vertical-align: bottom;"><b>LV [days]</b></td>
              <td>
                <vue-numeric
                  v-model="costsParameters.lvMat_leadtime"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="text-align: right; vertical-align: bottom;"><b>MV [days]</b></td>
              <td>
                <vue-numeric
                  v-model="costsParameters.mvMat_leadtime"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="text-align: right; vertical-align: bottom;"><b>UV [days]</b></td>
              <td>
                <vue-numeric
                  v-model="costsParameters.uvMat_leadtime"
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

        <v-flex column shrink pr-4>
          <table>
            <tr>
              <td rowspan="3" style="width: 110px;"><span><b>Material distribution</b></span></td>
              <td style="text-align: right; vertical-align: bottom;"><b>LV [%]</b></td>
              <td>
                <vue-numeric
                  v-model="costsParameters.lvMat"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="text-align: right; vertical-align: bottom;"><b>MV [%]</b></td>
              <td>
                <vue-numeric
                  v-model="costsParameters.mvMat"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                ></vue-numeric>
              </td>
            </tr>
            <tr>
              <td style="text-align: right; vertical-align: bottom;"><b>UV [%]</b></td>
              <td>
                <vue-numeric
                  v-model="costsParameters.uvMat"
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
          <v-btn @click="dialog=false" color="accent">cancel</v-btn>
        </v-flex>
        <v-flex column xs6 text-xs-right>
          <v-btn @click="setParameters" color="primary">save</v-btn>
        </v-flex>
      </v-layout>


      
    </v-container>
  </v-dialog>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: 'OverviewGridBatchDialog',
  props: ['filteredData', 'dateRange'],
  data() {
    return {
      dialog: false,
      costsParameters: {
        lvMat_leadtime: 15,
        mvMat_leadtime: 15,
        uvMat_leadtime: 15,
        lvMat: 30,
        mvMat: 40,
        uvMat: 30
      }
    }
  },
  methods: {
    ...mapActions(['changeProjectsData']),
    setParameters() {
      let dataChanges = {}
      Object.keys(this.costsParameters).forEach(k => {
        this.costsParameters[k] = Number(this.costsParameters[k])
      })

      this.filteredData.forEach(netData => {
        Object.keys(this.costsParameters).forEach(key => {
          Object.keys(netData.costs.result).forEach(e => {
            const category = key.charAt(0).toUpperCase() + key.slice(1, 2)
            if (e.indexOf(category) !== -1 && e.indexOf('Total') === -1 && e.indexOf('leadtime') === -1) {
              netData.costs.result[e] = netData.costs.result[e] / netData.costsParameters[key] * this.costsParameters[key]
            }
          })

          const categories = [
            { field: 'rmTotal', condition: 'total', fields: ['rmLv', 'rmMv', 'rmUv'] },
            { field: 'wipTotal', condition: 'total', fields: ['wipLv', 'wipMv', 'wipUv'] },
            { field: 'fg', weight: 1 }
          ]

          this.dateRange.forEach(date => {
            categories.forEach(c => {
              if (c.condition === 'total') {
                netData.costs.result[c.field + '_' + date] = c.fields.reduce((agg, f) => {
                  agg = agg + netData.costs.result[f+'_'+date]
                  return agg
                } , 0)
              } else {
                netData.costs.result[c.field + '_' + date] = (netData['Planned Costs'] || 0) * c.weight / 100
              }
            })
          })
        })
        netData.costsParameters = JSON.parse(JSON.stringify(this.costsParameters))
        Object.assign(dataChanges, {
          [netData._id]: {
            costsParameters: this.costsParameters
          }
        })
      })
      this.costsParameters = {
        lvMat_leadtime: 15,
        mvMat_leadtime: 15,
        uvMat_leadtime: 15,
        lvMat: 30,
        mvMat: 40,
        uvMat: 30
      }

      this.changeProjectsData({
        netNums: Object.keys(dataChanges),
        data: Object.values(dataChanges)
      })
      this.dialog = false
      this.$parent.datagridContentReady = false
      this.$parent.$refs['costsTable'].instance.refresh()
    }
  }
}
</script>