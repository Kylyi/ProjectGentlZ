<template>
  <v-layout column wrap>
    <v-layout row wrap>

      <!-- RISKS -->
      <v-flex column xs6 wrap pr-2 style="border-right-style: groove;">
        <v-flex row wrap>
          <h5 class="myHeading" display-1>Existing risks</h5>
        </v-flex>
        <v-flex row wrap>
          <el-table
            :data="existingRisks"
            style="width: 100%;"
            >
            <el-table-column
              prop="name"
              label="Name"
              width="350"
            />
            <el-table-column
              prop="owner"
              label="Owner"
            />
            <el-table-column
              prop="priceImpact"
              label="Maximum price impact"
            />
          </el-table>
        </v-flex>
      </v-flex>

      <!-- OPPORTUNITIES -->
      <v-flex column xs6 wrap pl-2>
        <v-flex row wrap>
          <h5 class="myHeading" display-1>Existing opportunities</h5>
        </v-flex>
        <v-flex row wrap>
          <el-table
            :data="existingOpps"
            style="width: 100%;"
            >
            <el-table-column
              prop="name"
              label="Name"
              width="350"
            />
            <el-table-column
              prop="owner"
              label="Owner"
            />
            <el-table-column
              prop="priceImpact"
              label="Maximum price impact"
            />
          </el-table>
        </v-flex>
      </v-flex>
    </v-layout>

    <!-- GRAF -->
    <v-layout row wrap style="min-height: 100px;" mt-5>
      <img :src="graf" style="margin:auto;">
    </v-layout>

    <v-layout row wrap>
      <v-flex column wrap text-xs-right>
        <v-btn @click="changeProjectRiskRegister(newRiskRegister)">Update</v-btn>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script>
import _ from 'underscore'
import { mapActions } from 'vuex';
export default {
  mounted() {
    this.$root.$on('riskRegisterChanged', newRiskRegister => {
      this.newRiskRegister = newRiskRegister
      this.existingRisks = _.flatten(_.values(newRiskRegister.risks)).filter(e => e.exists)
      this.existingOpps = _.flatten(_.values(newRiskRegister.opportunities)).filter(e => e.exists)
    })
  },
  data: () => {
    return {
      newRiskRegister: {},
      existingRisks: [],
      existingOpps: [],
      graf: require('./../../renderer/assets/graf_tbd.png')
    }
  },
  methods: {
    ...mapActions(['changeProjectRiskRegister'])
  }
}
</script>

<style>

</style>
