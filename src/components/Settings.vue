<template>
  <v-layout column wrap>


    <v-layout row wrap style="padding: 28px 24px; background-color: #424242;">
      <v-flex column shrink>
        <h3 class="display-2 white--text">Settings</h3>
      </v-flex>
      <v-flex column grow>

      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <v-expansion-panel v-model="expansionOpen">
          <!-- USER SETTINGS -->
          <v-expansion-panel-content>
            <span slot="header"><b>User settings</b></span>
            <v-layout row wrap v-if="expansionOpen === 0" style="padding: 0px 24px 10px 24px; text-align:justify;">

              <!-- DATA-MAPPING -->
              <v-flex column shrink>
                <v-flex row wrap>
                  <v-layout row wrap>
                    <v-layout column grow justify-center>
                      <b class="subheading primary--text">Data-mapping settings</b>
                    </v-layout>
                    <v-layout column shrink>
                      <v-btn @click="changeUser(sapUsername, sapUsernumber)" flat icon style="margin: 0;"><v-icon>save</v-icon></v-btn>
                    </v-layout>
                  </v-layout>
                </v-flex>
                <v-flex row wrap mt-2>
                  <v-text-field v-model="sapUsername" style="width: 200px;" hide-details label="SAP name (check PPES)" placeholder="Jméno Příjmení"></v-text-field>
                </v-flex>
                <v-flex row wrap mt-2>
                  <v-text-field v-model="sapUsernumber" style="width: 200px;" hide-details label="SAP personal number" placeholder="0XXXXXXXX"></v-text-field>
                </v-flex>
              </v-flex>

              <!-- CONTACT INFO -->
              <v-flex column shrink pl-5>
                <v-flex row wrap>
                  <v-layout row wrap>
                    <v-layout column grow justify-center>
                      <b class="subheading primary--text">Contact</b>
                    </v-layout>
                    <v-layout column shrink>
                      <v-btn @click="changeContactInfo(userEmail, userPhone)" flat icon style="margin: 0;"><v-icon>save</v-icon></v-btn>
                    </v-layout>
                  </v-layout>
                </v-flex>
                <v-form v-model="contactInfoForm" @submit.prevent="changeContactInfo(userEmail, userPhone)" ref="contactInfoForm">
                  <v-flex row wrap mt-2>
                    <v-text-field hide-details suffix="@cz.abb.com" label="Email address" v-model="userEmail" validate-on-blur :rules="[v => (v && v.length > 0) || 'Empty']"></v-text-field>
                  </v-flex>
                  <v-flex row wrap mt-2>
                    <v-text-field hide-details prefix="+420" mask="###-###-###" label="Phone" v-model="userPhone" validate-on-blur :rules="[v => (v && v.length === 9) || 'Bad format']"></v-text-field>
                  </v-flex>
                </v-form>
              </v-flex>
              <v-flex column grow>

              </v-flex>

              <!-- PASSWORD CHANGE -->
              <v-flex column shrink pl-5>
                <v-flex row wrap>
                  <v-layout row wrap>
                    <v-layout column grow justify-center>
                      <b class="subheading primary--text">Change password</b>
                    </v-layout>
                    <v-layout column shrink>
                      <v-btn @click="changePwd" flat icon style="margin: 0;"><v-icon>save</v-icon></v-btn>
                    </v-layout>
                  </v-layout>
                </v-flex>
                <v-form v-model="changePasswordForm" @submit.prevent="changePwd" ref="changePasswordForm">
                  <v-flex row wrap mt-2>
                    <v-text-field v-model="oldPassword" type="password" hide-details style="width: 300px;" validate-on-blur :rules="[checkPwd]" required label="Old password"></v-text-field>
                  </v-flex>
                  <v-flex row wrap mt-2>
                    <v-text-field v-model="newPassword" type="password" hide-details style="width: 300px;" validate-on-blur :rules="[pwdLengthRule]" required label="New password"></v-text-field>
                  </v-flex>
                  <v-flex row wrap mt-2>
                    <v-text-field v-model="newPasswordAgain" type="password" hide-details style="width: 300px;" validate-on-blur :rules="[pwdSameRule]" required label="New password again"></v-text-field>
                  </v-flex>
                </v-form>
              </v-flex>
            </v-layout>
          </v-expansion-panel-content>

          <!-- Dashboard -->
          <v-expansion-panel-content>
            <span slot="header"><b>Dashboard & Template Generator</b></span>

            <v-layout row wrap v-if="expansionOpen === 1">
              <v-layout row wrap>
                <v-flex column style="max-width: 650px; padding: 10px 24px; text-align:justify">
                  <v-flex row wrap mb-4>
                    This sets up which data will be shown when clicked on <b>detail</b> in <b>Dashboard - My projects</b> table.
                    Select fields you want to see. Order of items matters as items will be shown accordingly to these settings.
                    Don't forget to <b style="color: red;">SAVE</b>.
                  </v-flex>

                  <v-flex row wrap>
                    <v-flex row wrap><p class="subheading primary--text" style="margin-bottom: 0;">Available fields</p></v-flex>
                    <table class="draggableTable">
                      <thead class="el-table__header">
                        <tr>
                          <th></th>
                          <th>Database field</th>
                          <th>Display value</th>
                          <th style="text-align: center;">Visible</th>
                        </tr>
                      </thead>
                      <draggable tag="tbody" v-model="projectsDetail" class="list-group" handle=".handle" v-bind="dragOptions" @start="drag = true" @end="drag = false">
                        <tr v-for="(e) in projectsDetail" :key="e.value" style="width: 100%;">
                          <td><v-icon class="handle" style="width: 30px; text-align: center; cursor: -webkit-grab;" small>drag_indicator</v-icon></td>
                          <td style="width: 249px;">{{e.value}}</td>
                          <td style="width: 249px;"><input style="width: 100%;" type="text" v-model="e.name" /></td>
                          <td><v-checkbox hide-details v-model="e.visible"></v-checkbox></td>
                        </tr>
                      </draggable>
                    </table>
                  </v-flex>
                </v-flex>
                <v-flex column>
                  <v-btn flat icon @click="triggerEdit('projectDetails')"><v-icon>save</v-icon></v-btn>
                </v-flex>
              </v-layout>
            </v-layout>
          </v-expansion-panel-content>
          <!-- Invoicing -->
          <v-expansion-panel-content>
            <span slot="header"><b>Invoicing</b></span>

            <v-layout row wrap v-if="expansionOpen === 2">
              <v-layout row wrap>
                <v-flex column style="max-width: 650px; padding: 10px 24px; text-align:justify">
                  <v-flex row wrap mb-4>
                    This sets up which data will be shown when clicked on <b>detail</b> in <b>Invoicing table</b>.
                    Select which fields you want to see. Order of item matters as items will be shown accordingly to these settings.
                    Don't forget to <b style="color: red;">SAVE</b>.
                  </v-flex>

                  <v-flex row wrap>
                    <v-flex row wrap><p class="subheading primary--text" style="margin-bottom: 0;">Available fields</p></v-flex>
                    <table class="draggableTable">
                      <thead class="el-table__header">
                        <tr>
                          <th></th>
                          <th>Database field</th>
                          <th>Display value</th>
                          <th style="text-align: center;">Visible</th>
                        </tr>
                      </thead>
                      <draggable tag="tbody" v-model="invoicingDetail" class="list-group" handle=".handle" v-bind="dragOptions" @start="drag = true" @end="drag = false">
                          <tr v-for="(e) in invoicingDetail" :key="e.value" style="width: 100%;">
                            <td><v-icon class="handle" style="width: 30px; text-align: center; cursor: -webkit-grab;" small>drag_indicator</v-icon></td>
                            <td>{{e.value}}</td>
                            <td><input type="text" v-model="e.name" /></td>
                            <td><v-checkbox hide-details v-model="e.visible"></v-checkbox></td>
                          </tr>
                      </draggable>
                    </table>
                  </v-flex>
                </v-flex>
                <v-flex column>
                  <v-btn flat icon @click="setNetDetailsInfo"><v-icon>save</v-icon></v-btn>
                  <v-layout row wrap pr-3>
                    <v-flex column shrink>
                      <upload-btn :uniqueId="true" :fileChangedCallback="setPath1301" title="Choose OB daily file path 1301" outline />
                    </v-flex>
                    <v-flex column grow>
                      <v-text-field :value="obDailyPath1301" :readonly="true" placeholder="Path to OB Daily file - 1301" label="Path to OB Daily file - 1301" />
                    </v-flex>
                  </v-layout>

                  <v-layout row wrap pr-3>
                    <v-flex shrink column wrap>
                      <upload-btn :uniqueId="true" :fileChangedCallback="setPath1601" readonly title="Choose OB daily file path 1601" outline />
                    </v-flex>
                    <v-flex grow column wrap>
                      <v-text-field :value="obDailyPath1601" :readonly="true" placeholder="Path to OB Daily file - 1601" label="Path to OB Daily file - 1601" />
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-layout>
          </v-expansion-panel-content>

        </v-expansion-panel>
      </v-layout>
    </v-container>

  </v-layout>
</template>

<style>
.draggableItem {
  border: 1px dashed lightgray;
  border-radius: 2px;
  cursor: -webkit-grabbing;
}

.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
table.draggableTable input {
  border-radius: 2px;
  border: 1px solid lightgrey;
  padding: 0 2px;
}
table.draggableTable input:focus {
  border-color: #1976D2;
  outline: none;
}
table.draggableTable .v-input--selection-controls {
  margin-top: 0px;
  padding-top: 0px;
}
table.draggableTable .v-input--selection-controls__input {
  margin: 0px;
}
table.draggableTable .v-input__control {
  margin: auto;
}
</style>



<script>
  import {readFile} from '../main/scripts/misc'
  import draggable from 'vuedraggable'
  const fs = require('fs')
  const path = require('path')
  const localStorage = require('localStorage')
  import DataFrame from "dataframe-js"
  import { mapGetters, mapActions, mapState } from "vuex";

  export default {
    name: 'settings',
    created: async function () {
      this.sapUsername = this.$store.getters.userInfo.sapUsername || null
      this.sapUsernumber = this.$store.getters.userInfo.sapUsernumber || null
      this.userEmail = this.$store.getters.userInfo.email || null
      this.userPhone = this.$store.getters.userInfo.phone || null

      this.projectsDetail = JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'projectDetails.json'), 'utf-8'))

      const allOptions = JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json'), 'utf-8'))
      const detailSettings = JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json'), 'utf-8'))
      allOptions.push({dataType: 'special', editable: false, name: 'Invoice date', value: 'Invoice Date', visible: false})

      const x = allOptions.map(e => {
        const y = detailSettings.filter(u => e['value'] === u['value'])

        if (y.length > 0) {
          return y[0]
        } else {
          e['visible'] = false
          return e
        }
        return y.length > 0 ? y[0] : e
      })
      this.invoicingDetail =  x
    },
    computed: {
      ...mapGetters(['obDailyPath1301', 'obDailyPath1601', 'validPassword']),
      dragOptions() {
        return {
          animation: 200,
          group: "description",
          disabled: false,
          ghostClass: "ghost"
        };
      }
    },
    data: function () {
      return {
        invoicingDetail: [],
        userEmail: '',
        userPhone: '',
        drag: false,
        sapUsername: null,
        sapUsernumber: null,
        projectsDetail: [],
        expansionOpen: null,
        oldPassword: null,
        newPassword: '',
        newPasswordAgain: '',
        pwdLengthRule: v => (v && v.length >= 5) || 'Not long enough.',
        pwdSameRule: v => v === this.newPassword || 'Not the same password.',
        changePasswordForm: false,
        contactInfoForm: false
      }
    },
    methods: {
      ...mapActions(['editProjectsDetail', 'changeUserSapName', 'changeFileLocation', 'changeInvoicingDetail', 'checkPassword', 'changePassword', 'notify', 'changeUserContactInfo']),
      triggerEdit(fileName) {
        this.editProjectsDetail({fileName, projectsDetailObj: this.projectsDetail})
      },
      removeFromList (val) {
        const idx = this.netDetailSettings.findIndex(item => item.value === val)
        this.netDetailSettings.splice(idx, 1)
      },
      setNetDetailsInfo() {
        const invoicingDetail = this.invoicingDetail.filter(e => e.visible)
        this.changeInvoicingDetail({fileName: 'invoicingDetails', invoicingDetail})


        // fs.writeFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json'), toBeSaved, 'utf8', (err, res) => {
        //   if (err) throw err;
        // })
      },
      setPath1301(file) {
        this.changeFileLocation({plant: '1301', path: file.path})
      },
      setPath1601(file) {
        this.changeFileLocation({plant: '1601', path: file.path})
      },
      changeUser(sapUsername, sapUsernumber) {
        this.changeUserSapName({sapUsername, sapUsernumber})
      },
      checkPwd(v) {
        this.checkPassword(v)
        return this.validPassword || 'Netusim'
      },
      changePwd() {
        if (this.changePasswordForm) {
          this.changePassword(this.newPassword)
          this.$refs.changePasswordForm.reset()
        } else {
          this.notify({
            text: 'Passwords don\'t match',
            color: 'error',
            state: true,
            timeout: 3000
          })
        }
      },
      changeContactInfo(userEmail, userPhone) {
        if (this.contactInfoForm) {
          this.changeUserContactInfo({userEmail, userPhone})
          this.$refs.contactInfoForm.reset()
        } else {
          this.notify({
            text: 'There are some missing values',
            color: 'error',
            state: true,
            timeout: 3000
          })
        }
      }
    },
    components: {draggable}
    
  }
</script>
