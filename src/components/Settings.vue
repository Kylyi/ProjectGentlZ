<template>
  <v-layout column wrap>
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Settings</h3>
      </v-flex>
      <v-flex column grow>
        
      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <el-collapse v-model="collapseModel" style="width: 100%;">
          <el-collapse-item name="settingsUser">
            <template slot="title">
              <v-layout row>
                <v-flex column shrink ><span style="padding-left: 1em;">User settings</span></v-flex>
                <v-flex column grow text-xs-right>
                  <v-btn v-show="collapseModel.includes('settingsUser')" icon @click.stop="$refs['settingsUser'].setUserSettings()"><v-icon>save</v-icon></v-btn>
                </v-flex>
              </v-layout>        
            </template>
            
            <v-container fluid style="padding-top: 0px;">
              <user-settings ref="settingsUser" />
            </v-container>
            
          </el-collapse-item>

          <el-collapse-item name="settingsDashboard">
            <template slot="title">
              <v-layout row>
                <v-flex column shrink ><span style="padding-left: 1em;">Dashboard & Template generator</span></v-flex>
                <v-flex column grow text-xs-right>
                  <v-btn v-show="collapseModel.includes('settingsDashboard')" icon @click.stop="$refs['settingsDashboard'].setProjectDetails('projectDetails')"><v-icon>save</v-icon></v-btn>
                </v-flex>
              </v-layout>        
            </template>

            <v-container fluid style="padding-top: 0px;">
              <dashboard ref="settingsDashboard" />
            </v-container>

          </el-collapse-item>

          <el-collapse-item name="settingsInvoicing">
            <template slot="title">
              <v-layout row>
                <v-flex column shrink ><span style="padding-left: 1em;">Revenues</span></v-flex>
                <v-flex column grow text-xs-right>
                  <v-btn v-show="collapseModel.includes('settingsInvoicing')" icon @click.stop="$refs['settingsInvoicing'].setInvoicingDetails('projectDetails')"><v-icon>save</v-icon></v-btn>
                </v-flex>
              </v-layout>        
            </template>

            <v-container fluid style="padding-top: 0px;">
              <invoicing ref="settingsInvoicing" />
            </v-container>

          </el-collapse-item>

        </el-collapse>

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
  import { mapGetters, mapActions, mapState } from "vuex";
  import Dashboard from './Settings/Dashboard'
  import Invoicing from './Settings/Invoicing'
  import UserSettings from './Settings/UserSettings'  

  export default {
    name: 'Settings',
    data() {
      return {
        collapseModel: []
      }
    },
    components: {
      Dashboard,
      Invoicing,
      UserSettings
    }
    
  }
</script>
