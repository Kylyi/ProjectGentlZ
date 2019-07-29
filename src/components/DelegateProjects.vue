<template>
  <v-layout column wrap fluid id="delegateProjects">
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="padding: 10px 24px;">
        <h3 class="display-2 white--text">Delegate projects</h3>
      </v-flex>

      <!-- MENU -->
      <v-flex column grow style="padding: 10px 24px; display: flex; justify-content: flex-end; align-items: center;">
        <multiselect :value="selectedPM" :options="uniquePms" placeholder="Select person" :searchable="true" @input="selectPM" style="width: 400px;">
          <span slot="noResult">No networks found.</span>
        </multiselect>
      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <!-- LEFT SIDE -->
        <v-flex column xs7 style="max-height: calc(100vh - 149px)">
            <dx-data-grid
              ref="allProjectsTable"
              :data-source="allProjectsProjectsMode"
              show-borders
              key-expr='Project Definition'
              column-auto-width
              :allow-column-reordering="true"
              :allow-column-resizing="true"
              :row-alternation-enabled="true"
              :show-row-lines="true"
              :show-column-lines="true"
              :word-wrap-enabled="true"
              style="height: 100%;"
            >
              <dx-scrolling mode="virtual"/>
              <dx-header-filter
                :visible="true"
                :allow-search="true"
              />
              <dx-selection
                select-all-mode="allPages"
                show-check-boxes-mode="always"
                mode="multiple"
              />

              <dx-column
                data-field="Project Definition"
                caption="Project #"
              />

              <dx-column
                data-field="Project Name"
                caption="Project name"
              />

              <dx-column
                data-field="Project Manager"
                caption="Project Manager"
                :header-filter="peoplePmFilter"
                :calculate-filter-expression="getFiltering"
              />

              <dx-column
                data-field="Project Revenues"
                caption="Revenues"
                format="#,##0"
              />

              <dx-column
                caption="Delegated"
                cell-template="delegateTemplate"
                alignment="center"
              />

              <div slot="delegateTemplate" slot-scope="templateData">
                <v-icon
                  small 
                  color="info" 
                  v-html="templateData.data.temporaryAssign.hasOwnProperty('personName') && templateData.data.temporaryAssign.personName.length > 0 ?'fas fa-chess-pawn' : ''" 
                  :title="templateData.data.temporaryAssign.hasOwnProperty('personName') && templateData.data.temporaryAssign.personName.length > 0 ? String(templateData.data.temporaryAssign.personName) : ''"
                />
              </div>
            </dx-data-grid>
        </v-flex>

        <!-- MIDDLE -->
        <v-flex column shrink>
          <v-layout align-center justify-center column fill-height>
            <v-btn @click="delegateProjectsLTR" icon><v-icon>chevron_right</v-icon></v-btn>
            <v-btn icon @click="delegateProjectsRTL"><v-icon>chevron_left</v-icon></v-btn>
          </v-layout>
        </v-flex>

        <!-- RIGHT SIDE -->
        <v-flex column grow style="max-height: calc(100vh - 149px); width: min-content;">
          <dx-data-grid
            ref="pmProjectsTable"
            :data-source="selectedPmProjects"
            show-borders
            key-expr='Project Definition'
            column-auto-width
            :allow-column-reordering="true"
            :allow-column-resizing="true"
            :row-alternation-enabled="true"
            :show-row-lines="true"
            :show-column-lines="true"
            :word-wrap-enabled="true"
            height="fit-content"
          >
            <dx-scrolling mode="virtual"/>
            <dx-header-filter
              :visible="true"
              :allow-search="true"
            />
            <dx-selection
              select-all-mode="allPages"
              show-check-boxes-mode="always"
              mode="multiple"
            />

            <dx-column
              data-field="Project Definition"
              caption="Project #"
            />

            <dx-column
              data-field="Project Name"
              caption="Project name"
            />

            <dx-column
                caption="Delegated"
                cell-template="delegateTemplate2"
                alignment="center"
              />

            <div slot="delegateTemplate2" slot-scope="templateData">
              <v-icon 
                :color="getColor(templateData.data)" 
                :title="getTitle(templateData.data)"
                v-html="getIcon(templateData.data)" 
              />
            </div>
          </dx-data-grid>
        </v-flex>
      </v-layout>
    </v-container>
    

    
  </v-layout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
export default {
  name: 'DelegateProjects',
  created() {
    if (!this.peoplePmFilter.hasOwnProperty('dataSource')) {
      this.setPeopleFilter()
    }
  },
  data: () => {
    return {
      chosenPerson: null
    }
  },
  computed: {
    ...mapGetters(['allProjectsProjectsMode', 'uniquePms', 'selectedPM', 'selectedPmProjects', 'peoplePmFilter', 'peopleSameLevel'])
  },
  methods: {
    ...mapActions(['selectPM', 'delegateProjects', 'notify', 'setPeopleFilter']),
    getIcon({temporaryAssign, project_pm}) {
      if (temporaryAssign.hasOwnProperty('personName') && temporaryAssign.personName.length > 0) {
        const currentUserSapName = this.selectedPM
        if (project_pm === currentUserSapName) {
          return 'supervised_user_circle'
        }

        if (temporaryAssign.personName.includes(currentUserSapName)) {
          return 'supervised_user_circle'
        } else if (project_pm === currentUserSapName) {
          return 'success'
        } else {
          return 'supervised_user_circle'
        }
      } else {
        return ''
      }
    },
    getColor({temporaryAssign, project_pm}) {
      if (temporaryAssign.hasOwnProperty('personName') && temporaryAssign.personName.length > 0) {
        const currentUserSapName = this.selectedPM
        if (temporaryAssign.personName.includes(currentUserSapName)) {
          return 'error'
        } else if (project_pm === currentUserSapName) {
          return 'success'
        } else {
          return ''
        }
      } else {
        return ''
      }
    },
    getTitle({temporaryAssign, project_pm}) {
      if (temporaryAssign.hasOwnProperty('personName') && temporaryAssign.personName.length > 0) {
        const currentUserSapName = this.selectedPM
        if (temporaryAssign.personName.includes(currentUserSapName)) {
          return 'This project was delegated TO currently selected PM.'
        } else if (project_pm === currentUserSapName) {
          return 'This project was delegated FROM currently selected PM.'
        } else {
          return ''
        }
      } else {
        return ''
      }
    },
    delegateProjectsLTR() {
      const projs = this.$refs.allProjectsTable.instance.getSelectedRowsData()
      const check = projs.map(n => n.project_pm === this.selectedPM).indexOf(true)

      if (check === -1) {
        this.delegateProjects({ projs, LTR: true })
      } else {
        this.notify({
          text: 'Some of your selected projects are already assigned to chosen PM.',
          state: true,
          color: 'error',
          timeout: 5000
        }) 
      }
      
    },
    delegateProjectsRTL() {
      const projs = this.$refs.pmProjectsTable.instance.getSelectedRowsData()
      const check = projs.map(n => n.project_pm === this.selectedPM).indexOf(true)

      if (check === -1) {
        this.delegateProjects({ projs, LTR: false })
      } else {
        this.notify({
          text: 'Some of your selected projects have the same PM as the one selected.',
          state: true,
          color: 'error',
          timeout: 5000
        }) 
      }

      
    },
    getFiltering(value, operation, target) {
      if (target === 'headerFilter') {
        let filterExpr = [['Project Manager', '=', value.val]]
        this.peopleSameLevel.forEach(p => {
          if (p.supervisors.includes(value.lookup)) {
            filterExpr.push('or')
            filterExpr.push(['Project Manager', '=', p.sapUsername])
          }
        })
        return filterExpr
      }
    }
  }
}
</script>

<style>
  
</style>
