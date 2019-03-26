<template>
  <v-layout>
    <template v-if="chosenProjects.length > 0">
      <v-expansion-panel>
        <v-expansion-panel-content
          v-for="(opportunityCategory, i) in riskRegister.opportunities"
          :key="i"
        >
          <template v-slot:header>
            <div style="font-size: 16px;"><b>{{i}}</b></div>
          </template>

          <el-table
            :data="opportunityCategory"
            style="width: 100%"
          >
            <!-- NAME -->
            <!-- NAME -->
            <el-table-column
              id="COLNAME"
              fixed
              prop="name"
              label="Name"
              width="250"
              >
              <template slot-scope="scope">
                {{scope.row.name}}
              </template>
            </el-table-column>
            <!-- DESCRIPTION -->
            <el-table-column
              prop="info"
              label="Description"
              width="275"
              >
              <template slot-scope="scope">
                {{scope.row.info}}
              </template>
            </el-table-column>
            <!-- RISK EXISTS -->
            <el-table-column
              prop="exists"
              label="Exists"
              width="75"
              >
              <template slot-scope="scope">                
                <v-switch
                  v-model="scope.row.exists"
                  color="error"
                  hide-details
                ></v-switch>
              </template>
            </el-table-column>
            <!-- ADDITIONAL INFO -->
            <el-table-column
              prop="description"
              label="Additional info"
              width="250"
              >
              <template slot-scope="scope">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 2}"
                  resize="none"
                  v-model="scope.row.description">
                </el-input>
              </template>
            </el-table-column>
            <!-- PLANNED ACTION -->
            <el-table-column
              prop="plannedAction"
              label="Planned action for mitigation"
              width="250"
              >
              <template slot-scope="scope">
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 2}"
                  resize="none"
                  v-model="scope.row.plannedAction">
                </el-input>
              </template>
            </el-table-column>
            <!-- OWNER -->
            <el-table-column
              prop="owner"
              label="Owner"
              width="150"
              >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.owner">
                </el-input>
              </template>
            </el-table-column>
            <!-- PROBABILITY -->
            <el-table-column
              prop="probability"
              label="Probability [%]"
              width="190"
              >
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.probability" controls-position="right" :min="0" :max="100"></el-input-number>
              </template>
            </el-table-column>
            <!-- PRICE IMPACT -->
            <el-table-column
              prop="priceImpact"
              label="Price impact [CZK]"
              width="190"
              >
              <template slot-scope="scope">
                <el-input-number v-model="scope.row.priceImpact" controls-position="right" :min="0" :step="1000"></el-input-number>
              </template>
            </el-table-column>

          </el-table>
          
        </v-expansion-panel-content>
      </v-expansion-panel>
    </template>

    <template v-else>
      First, select a project.
    </template>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: 'Opportunities',
  async created() {
    this.mutationSub = this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setChosenProjects') {
        if (this.$store.state.projects.chosenProjects.length > 0) {
          const allNets = this.$store.state.projects.allProjectsBasic.filter(e => e['Project Definition'] === this.$store.state.projects.chosenProjects[0]['Project Definition'])
          const netWithRiskRegister = allNets[0]

          if (!netWithRiskRegister.riskRegister.hasOwnProperty('opportunities')) {
            this.fetchDefaultRiskRegister()
            .then(() => this.riskRegister = this.defaultRiskRegister)
            .catch(err => console.log(err))
            return
          }
          
          this.riskRegister = netWithRiskRegister.riskRegister
        } else {
          this.fetchDefaultRiskRegister()
            .then(() => this.riskRegister = this.defaultRiskRegister)
        }
      }
    })

    if (this.$store.state.projects.chosenProjects.length > 0) {
      const allNets = this.$store.state.projects.allProjectsBasic.filter(e => e['Project Definition'] === this.$store.state.projects.chosenProjects[0]['Project Definition'])
      const netWithRiskRegister = allNets[0]

      if (!netWithRiskRegister.riskRegister.hasOwnProperty('opportunities')) {
        this.fetchDefaultRiskRegister()
        .then(() => this.riskRegister = this.defaultRiskRegister)
        .catch(err => console.log(err))
        return
      }
      
      this.riskRegister = netWithRiskRegister.riskRegister
    } else {
      this.fetchDefaultRiskRegister()
        .then(() => this.riskRegister = this.defaultRiskRegister)
    }
  },
  data: () => {
    return {
      riskRegister: []
    }
  },
  computed: {
    ...mapGetters(['chosenProjects', 'defaultRiskRegister'])
  },
  methods: {
    ...mapActions(['fetchDefaultRiskRegister'])
  },
  watch: {
    riskRegister: {
      deep: true,
      handler(newVal, oldVal) {
        this.$root.$emit('riskRegisterChanged', newVal);
      }
    }
  }
}
</script>

<style>
.v-expansion-panel__body {
  padding: 20px;
}
</style>
