<template>
  <v-container fluid>
    <v-layout align-start class="wrap row">
        <!-- Title -->
      <v-flex xs10 row wrap mb-4>
        <h3 class="display-2 primary--text"><span class="tit">Template generator</span></h3>
      </v-flex>
      
      <!-- Menu -->
      <v-flex xs2 row wrap text-xs-right>
        <v-menu
          v-model="optionsMenu"
          :close-on-content-click="false"
          :nudge-width="300"
          nudge-left="335"
        >
          <v-icon
            slot="activator"
            color="primary"
          >
            settings
          </v-icon>

          <v-card id="optionsMenu">
            <v-list>
              <!-- Generator mode -->
              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-flex row wrap>Mode</v-flex>
                      <v-flex row wrap>
                        <v-btn-toggle v-model="generatorSelectionMode" @change="changeGeneratorSelectionMode">
                          <v-btn flat value="project">
                            Project
                          </v-btn>
                          <v-btn flat value="net">
                            Network
                          </v-btn>
                        </v-btn-toggle>
                      </v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>

              <!-- Open document after generate -->
              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-flex row wrap>Open document after generating</v-flex>
                      <v-flex row wrap>
                        <v-btn-toggle v-model="openAfterGenerate" @change="changeOpenAfterGenerate">
                          <v-btn flat value="yes">
                            Yes
                          </v-btn>
                          <v-btn flat value="no">
                            No
                          </v-btn>
                        </v-btn-toggle>
                      </v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>

            </v-list>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn flat @click="optionsMenu = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-flex>

      <v-layout row wrap align-start fill-height>

        <!-- Left side -->
        <v-flex column xs5 style="max-width:600px">
          
          <!-- Project selector -->
          <project-selector ref="projS" mt-5></project-selector>

          <!-- Template selector -->
          <template-selector ref="tmplS" style="margin-top:2em"></template-selector>

          <!-- Button -->
          <v-layout row wrap justify-end mb-1> 
            <v-btn  outline depressed color="primary" @click="generateTemplate(`${generatorSelectionMode === 'project'}`)" :disabled="!(chosenTemplates.length > 0 && chosenProjects.length > 0)" class="elevation-7 mt-4">Generate</v-btn>
            <!-- @click="generateTemplateTrigger" -->
          </v-layout>

          <!-- INFOPANEL -->
          <v-expansion-panel v-if="chosenProjects.length > 0">
            <!-- NETWORK INFO -->
            <v-expansion-panel-content>
              <template v-slot:header><b>Network info</b></template>
              <v-layout column wrap>
                <v-flex row wrap mb-2><b>TBD - IF MORE NETS ARE SELECTED SHOW CHOOSE BAR</b></v-flex>
                <v-flex row wrap>
                  <table class="detailTable" style="width: 100%;" v-show="chosenProjects.length > 0">
                    <tbody>
                      <tr v-for="field in visibleProjectsDetail" :key="field.value">
                        <td style="width:150px; text-align: right; padding-right:1em;">{{field.name}}</td>
                        <td>
                          {{((field.dataType === 'date') && (chosenProjects[0][field.value])) ?  chosenProjects[0][field.value].substr(0, 10) : chosenProjects[0][field.value]}}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </v-flex>
              </v-layout>
            </v-expansion-panel-content>

            <!-- TEMPLATE INFO -->
            <v-expansion-panel-content>
              <template v-slot:header><b>Template info</b></template>
              <v-layout>
                Template info - TBD
              </v-layout>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <!-- ADD NETWORK FORM -->
          <v-layout column wrap mt-3>
            <v-flex row wrap>
              <v-form
                ref="projectAddForm"
                v-model="projectAddValid"
                @submit.prevent="addProject()"
              >
                <v-text-field
                  v-model="projectToAdd"
                  :rules="[v => !!v || 'Net # is required', v => (v && v.length === 10) || 'Net # are 10 characters long.']"
                  label="Add network (Net #) manually"
                  required
                  :loading="loading"
                >
                </v-text-field>
              </v-form>
            </v-flex>
          </v-layout>

          <!-- GET NET TASKS INFO -->
          <v-layout column wrap v-shortkey="['ctrl', 'alt', 'o']" @shortkey="devMode = !devMode" :class="devMode? 'd-flex': 'd-none'">
            <v-flex row wrap>
              <v-form
                @submit.prevent="getNetTasksInfo()"
              >
                <v-text-field
                  v-model="netPlaceholder"
                  :rules="[v => !!v || 'Net # is required', v => (v && v.length === 10) || 'Net # are 10 characters long.']"
                  label="Get tasks info for network"
                  required
                >
                </v-text-field>
              </v-form>
            </v-flex>
            <v-flex row wrap>
              <v-btn outline @click="stopProjectsReplication">Stop project replication</v-btn>
              <v-btn outline @click="startProjectsReplication">Start project replication</v-btn>
            </v-flex>
          </v-layout>
        </v-flex>

        <!-- Right side -->
        <v-flex column pl-3 text-xs-center>
          <img :src="templatePreview">
        </v-flex>
      </v-layout>
    </v-layout>
  </v-container>

</template>

<style lang="scss" scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .projectInfo {
    padding: 0.5em 0px;

    table tr > td:first-child {
      text-align: right;
      width: 9em;
    }

    table tr > td:nth-child(2) {
      padding-left: 1em;
      text-align: left;
    }
  }

  .projectInfo {
    min-height: 10em;
  }

  tr:hover {
    background-color: #E8E8E8
  }
</style>


<script>
  import TemplateSelector from './TemplateGenerator/TemplateSelector'
  import ProjectSelector from './TemplateGenerator/ProjectSelector'
  import { mapGetters, mapActions } from "vuex";

  export default {
    name: 'TemplateGenerator',
    data: () => ({
      activeTab: null,
      showCustomerInfo: false,
      devMode: false,
      openAfterGenerate: 'yes',
      generatorSelectionMode: 'net',
      projectAddValid: false,
      projectToAdd: '',
      projectAddInfo: null,
      optionsMenu: false,
      divisionSelect: '[lvmv_networks]',
      templatePreview: require('./../renderer/assets/template_preview.png'),
      netPlaceholder: ''
    }),
    created: async function () {
      this.openAfterGenerate = this.$store.state.templates.openAfterGenerate
      this.generatorSelectionMode = this.$store.state.templates.generatorSelectionMode
    },
    computed: {
      ...mapGetters(['chosenTemplates', 'chosenProjects', 'visibleProjectsDetail', 'loading'])
    },
    methods: {
      ...mapActions(['changeOpenAfterGenerate', 'changeGeneratorSelectionMode', 'generateTemplate', 'addForeignNets', 'fetchNetTasksInfo', 'deleteLocalStorage',
                    'stopProjectsReplication', 'startProjectsReplication', 'addAllBillings']),
      addProject() {
        if (this.projectAddValid) {
          this.addForeignNets(this.projectToAdd)
        }
      }
    },
    components: {ProjectSelector, TemplateSelector}
  }
</script>
