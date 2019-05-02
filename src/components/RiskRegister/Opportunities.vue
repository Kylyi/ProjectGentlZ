<template>
  <v-layout id="opportunities">
    <template>
      <el-collapse v-model="selectedTab" style="width: 100%;">
        <el-collapse-item
          v-for="(riskCategory, i) in opportunities"
          :name="i"
          :key="i"
        >
          <template slot="title">
           <span>{{i}}</span>
           <!-- <span style="padding-left: 24px; position: absolute; right: 80px;">
             <v-btn @click.stop="validateCategories([[i, riskCategory]])" outline small color="#1E88E5" style="margin: 0;">Validate</v-btn>
            </span> -->
           <span style="padding-left: 24px; position: absolute; right: 48px; display: table-row; vertical-align: middle;">
             <v-icon
              style="display:table-cell;" :color="forms[i].length > 0 ? 'error' : 'success'"
              :title="forms[i].length === 0 ? '' : `Check rows ${forms[i].toString()}`" 
            >
              {{ forms[i].length > 0 ? 'warning' : 'check'}}
            </v-icon>
           </span>
          </template>

          <v-layout row wrap class="categoryWrapper" style="overflow: -webkit-paged-x;">
            <template v-if="selectedTab.includes(i)">
                <v-layout row>
                  <v-flex column style="min-width: 250px; max-width: 250px; padding: 0 4px;">Definition</v-flex>
                  <v-flex column style="min-width: 320px; max-width: 100%; padding: 0 4px;">Description</v-flex>
                  <v-flex column text-xs-center style="min-width: 85px; max-width: 85px; padding: 0 4px;">Exists</v-flex>
                  <v-flex column style="min-width: 200px; max-width: 200px; padding: 0 4px;">Additional info</v-flex>
                  <v-flex column style="min-width: 250px; max-width: 250px; padding: 0 4px;">Planned action for mitigation</v-flex>
                  <v-flex column style="min-width: 128px; max-width: 180px; min-width:180px; padding: 0 4px;">Owner</v-flex>
                  <v-flex column text-xs-center style="min-width: 100px; max-width: 100px; padding: 0 4px;">Probability</v-flex>
                  <v-flex column text-xs-center style="min-width: 130px; max-width: 130px; padding: 0 4px;">Price impact [CZK]</v-flex>
                </v-layout>

                <v-layout row v-for="(risk, idx) in riskCategory" :key="idx">
                  <v-flex column style="min-width: 250px; max-width: 250px; padding: 0 4px;">{{risk.name}}</v-flex>
                  <v-flex column style="min-width: 320px; max-width: 100%; padding: 0 4px;">{{risk.info}}</v-flex>
                  <v-flex column style="min-width: 85px; max-width: 85px; padding: 0 4px;">
                    <v-layout row wrap justify-center align-center fill-height>
                      <v-btn-toggle v-model="opportunities[i][idx].exists" style="box-shadow: none;" @change="validateCategories([[i, riskCategory]])">
                        <v-btn flat :value="false" :color="!opportunities[i][idx].exists ? 'success' : ''">No</v-btn>
                        <v-btn flat :value="true" :color="opportunities[i][idx].exists ? 'error' : ''">Yes</v-btn>
                      </v-btn-toggle>
                    </v-layout>
                  </v-flex>
                  <v-flex column style="min-width: 200px; max-width: 200px; padding: 0 4px;">
                    <textarea v-model="opportunities[i][idx].description" @blur="validateCategories([[i, riskCategory]])" style="font-size: 13px; height: 100%; width: 100%; padding: 4px;"></textarea>
                  </v-flex>
                  <v-flex column style="min-width: 250px; max-width: 250px; padding: 0 4px;">
                    <textarea v-model="opportunities[i][idx].plannedAction" @blur="validateCategories([[i, riskCategory]])" style="font-size: 13px; height: 100%; width: 100%;  padding: 4px;"></textarea>
                  </v-flex>
                  <v-flex column style="min-width: 180px; max-width: 180px; padding: 0 4px;">
                    <v-layout row wrap align-center justify-center fill-height>
                      <!-- <multiselect v-model="opportunities[i][idx].owner" @input="validateCategories([[i, riskCategory]])"  :multiple="true" :options="people" style="font-size: 13px; max-width: 100%;" placeholder="" select-label="" deselect-label="" tag-placeholder="" :taggable="true" @tag="addPerson($event,i,idx )" /> -->
                      <!-- <v-combobox
                        :items="people"
                        v-model="opportunities[i][idx].owner"
                        style="font-size: 13px;"
                        @change="validateCategories([[i, riskCategory]])"
                      >
                      </v-combobox> -->
                      <textarea v-model="opportunities[i][idx].owner" @blur="validateCategories([[i, riskCategory]])" style="font-size: 13px; height: 100%; width: 100%;  padding: 4px;"></textarea>
                    </v-layout>
                  </v-flex>
                  <v-flex column style="min-width: 100px; max-width: 100px; padding: 0 4px;">
                    <vue-numeric
                      v-model="opportunities[i][idx].probability"
                      @blur="validateCategories([[i, riskCategory]])"
                      thousand-separator=" "
                      decimal-separator=","
                      :precision="2"
                      :min="0"
                      :max="1"
                      style="width: 100%; height: 100%;  padding: 4px; text-align: center;"
                    >
                    </vue-numeric>
                  </v-flex>
                  <v-flex column style="min-width: 130px; max-width: 130px; padding: 0 4px;">
                    <vue-numeric
                      v-model="opportunities[i][idx].priceImpact"
                      @blur="validateCategories([[i, riskCategory]])"
                      thousand-separator=" "
                      decimal-separator=","
                      :precision="0"
                      style="width: 100%; height: 100%; padding: 4px; text-align: center;"
                    >
                    </vue-numeric>
                  </v-flex>
                </v-layout>
            </template>
          </v-layout>
        </el-collapse-item>
      </el-collapse>


      <!-- <v-dialog
        v-model="dialog"
        width="500"
      >
        <v-card>
          <v-card-title
            class="headline grey lighten-2"
            primary-title
          >
            {{selectedFieldCaption}}
          </v-card-title>

          <v-card-text>
            <textarea style="width: 100%; outline-color:#1976D2; border: 1px dashed;"
              @blur="commitChanges"
              rows="12"
              :value="selectedFieldValue"
              placeholder="Text..."  
            ></textarea>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              flat
              @click="dialog = false"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog> -->
    </template>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: 'Risks',
  props: ['riskRegister'],
  created() {
    this.opportunities = this.riskRegister.opportunities
    this.people = this.uniquePms
    
    this.validateCategories(Object.entries(this.opportunities))
  },
  data: () => {
    return {
      selectedTab: [],
      dialog: false,
      selectedCategory: null,
      selectedRowIndex: null,
      selectedField: null,
      selectedFieldValue: null,
      selectedFieldCaption: null,
      forms: {},
      opportunities: {},
      people: []
    }
  },
  computed: {
    ...mapGetters(['uniquePms'])
  },
  methods: {
    validateCategories(cats = []) {
      let catsNotValid = {}

      cats.forEach(cat => {
        const category = cat[0]
        Object.assign(catsNotValid, { [category]: [] })
        for (let idx = 0; idx < cat[1].length; idx++) {
          const risk = cat[1][idx]
          if (risk.exists) {
            if (risk.description === "" || risk.owner === "" || risk.plannedAction === "" || !risk.probability || !risk.priceImpact) {
              catsNotValid[category].push(idx+1)
            }   
          } else {
            // catsNotValid[category].push(false)
          }
          
        }
      })

      Object.assign(this.forms, catsNotValid)
      this.$forceUpdate()
    },
    addPerson(person, i, idx) {
      this.people.push(person)
      this.opportunities[i][idx].owner.push(person)
    }
  }
}
</script>

<style>
  /* .categoryWrapper > div.layout.row:nth-child(even) {
    border-top: 1px dashed darkgrey;
    border-bottom: 1px dashed darkgrey;
  } */
  .categoryWrapper > div.layout.row:first-child {
    font-weight: bold;
    color: #ef5350;
  }
  /* .categoryWrapper > div.layout.row:last-child {
    border-bottom: 1px dashed darkgrey;
  } */

  .categoryWrapper > div.layout.row > div.flex.column {
    border-bottom: 1px dashed darkgray;
  }

  .categoryWrapper > div.layout.row:not(:first-child) > div.flex.column:nth-child(even) {
    border-left: 1px dashed darkgrey;
    border-right: 1px dashed darkgrey;
  }
  .categoryWrapper > div.layout.row:not(:first-child) > div.flex.column:first-child {
    border-left: 1px dashed darkgrey;
  }

  #opportunities .v-btn__content {
    height: 28px;
  }
  #opportunities .multiselect--active .multiselect__input {
    max-width: 100%!important;
  }

  #opportunities .el-collapse-item__wrap {
   overflow: visible;
  } 
</style>
