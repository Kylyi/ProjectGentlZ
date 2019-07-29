 <template>
   <v-dialog
      v-model="newItemDialog"
      persistent
      max-width="500px"
      transition="dialog-transition"
    >
      <v-container fluid style="background-color: white;">
        <v-layout column>
          <v-flex row wrap>
            <v-layout>
              <v-flex column grow><b>New {{step === 1? 'risk' : 'opportunity'}} definition</b></v-flex>
              <v-flex column shrink style="position: relative;"><v-icon @click="closeDialog" color="primary" style="position: absolute; top: -24px;">close</v-icon></v-flex>
            </v-layout>
          </v-flex>
          <v-flex row wrap>
            <!-- <v-combobox
              v-model="newItem.category"
              :items="step === 1 ? Object.keys(riskRegister.risks) : Object.keys(riskRegister.opportunities)"
              label="Category"
              hint="Choose existing category or create a new one"
            >
            </v-combobox> -->
            <v-textarea
              v-model="newItem.name"
            ></v-textarea>
          </v-flex>
          <v-flex row wrap>
            <v-layout row wrap>
              <v-flex column xs6><v-btn color="accent" @click="closeDialog">close</v-btn></v-flex>
              <v-flex column xs6 text-xs-right><v-btn @click="saveNewItem" color="primary">save</v-btn></v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-dialog>
 </template>
 
 <script>
 export default {
   data: function() {
     return {
       newItem: {
         name: '',
         info: '',
         exists: true,
         description: '',
         plannedAction: '',
         owner: '',
         priceImpact: 0,
         category: null
       }
     }
   },
   methods: {
     closeDialog() {
       this.$parent.newItemDialog = false
     },
     saveNewItem() {
       const riskOpp = this.step === 1 ? 'risks' : 'opportunities'
       let newItem = JSON.parse(JSON.stringify(this.newItem))
       newItem.category = this.step === 1 ? 'Custom risks' : 'Custom opportunities'

        Object.assign(newItem, { mainCategory: this.step === 1 ? 'risk' : 'opportunity' })
        if (this.$parent.riskRegister[riskOpp].hasOwnProperty(newItem.category)) {
          this.$parent.riskRegister[riskOpp][newItem.category].push(newItem)
        } else {
          this.$parent.riskRegister[riskOpp][newItem.category] = [newItem]
        }

        this.newItem = {
          name: '',
          info: '',
          exists: true,
          description: '',
          plannedAction: '',
          owner: '',
          priceImpact: 0,
          category: null
        }
        this.$parent.newItemDialog = false
        this.$parent.$refs[riskOpp].validateCategories(Object.entries(this.riskRegister[riskOpp]))
     }
   },
   props: ['riskRegister', 'step', 'newItemDialog']
 }
 </script>
 
 <style>
 
 </style>
 