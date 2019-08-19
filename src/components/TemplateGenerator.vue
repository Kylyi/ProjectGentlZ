<template>
  <v-layout column xs12 wrap id="templateGenerator">
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Template generator</h3>
      </v-flex>

      <!-- MENU -->
      <v-flex column grow text-xs-right style="padding: 0px 24px;">
        <v-menu
          v-model="optionsMenu"
          :close-on-content-click="false"
          :nudge-width="300"
          nudge-left="335"
         >
          <v-btn fab  slot="activator">
            <v-icon color="primary" >
              fas fa-cogs
            </v-icon>
          </v-btn>

          <v-card id="optionsMenu">
            <v-list style="padding-top: 16px;">
              <!-- Generator mode -->
              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-flex row wrap>Mode</v-flex>
                      <v-flex row wrap>
                        <v-btn-toggle :value="generatorSelectionMode" @change="changeGeneratorSelectionMode" :mandatory="true">
                          <v-btn color="primary" flat value="project">
                            Project
                          </v-btn>
                          <v-btn color="primary" flat value="net">
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
                        <v-btn-toggle v-model="openAfterGenerate" @change="changeOpenAfterGenerate" :mandatory="true">
                          <v-btn flat color="primary" value="yes">
                            Yes
                          </v-btn>
                          <v-btn flat color="primary" value="no">
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
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>

        <!-- LEFT SIDE -->
        <v-flex column xs6>
          <v-flex row wrap>
            <h5 class="headline"><b>Generate template</b></h5>
          </v-flex>

          <v-flex row wrap mt-2>
            <project-selector ref="projS" />
          </v-flex>

          <v-flex row wrap mt-3>
            <template-selector ref="tmplS" />
          </v-flex>

          <v-flex row wrap mt-2 mb-1>
            <v-layout row wrap>
              <v-flex column grow style="display: flex; align-items: center;">
                <span style="font-size: smaller;"><i>You can generate empty template by <b>not</b> selecting project/network.</i></span>
              </v-flex>
              <v-flex column shrink>
                <v-btn color="primary" style="margin: 0;" @click="generateTemplate" :disabled="!(chosenTemplates.length > 0)">Generate</v-btn>
              </v-flex>
            </v-layout>
          </v-flex>

          <v-divider></v-divider>

          <v-flex row wrap mt-3>
            <el-collapse v-model="selectedTab">
              <el-collapse-item name="projects">
                <span slot="title" style="padding-left:5px;"> Projects </span>
                <v-tabs v-if="chosenProjects.length > 0">
                  <v-tab
                    v-for="(item,i) in chosenProjects"
                    :key="i"
                  >
                    <v-layout column wrap>
                      <v-flex row wrap class="primary--text"><span style="font-weight: bolder;">{{generatorSelectionMode === 'net' ? item._id : item['Project Definition']}}</span></v-flex>
                      <v-flex row wrap style="font-size: 10px;">{{generatorSelectionMode === 'net' ? item['Network Description'] : (item['Project Name'] || '')}}</v-flex>
                    </v-layout>
                  </v-tab>

                  <v-tabs-items>
                    <v-tab-item
                      v-for="(item,i) in chosenProjects"
                      :key="i"
                    >
                      <v-container fluid style="padding: 8px 24px;">
                        <v-layout row wrap mt-2>
                          <v-flex column xs4 v-for="field in visibleProjectsDetail" :key="field.value">
                            <v-flex row wrap text-xs-center>
                              <b>{{field.name}}</b>
                            </v-flex>

                            <v-flex row wrap text-xs-center>
                              {{ generatorSelectionMode === 'net' ? getValue(item[field.value]) : getValue(item.nets[0][field.value]) }}
                            </v-flex>
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-tab-item>
                  </v-tabs-items>
                </v-tabs>
                <v-flex row wrap v-else text-xs-center>No project chosen.</v-flex>
              </el-collapse-item>

              <el-collapse-item name="templates">
                <span slot="title" style="padding-left:5px;"> Templates </span>
                <v-tabs  v-if="chosenTemplates.length > 0">
                  <v-tab
                    v-for="(item,i) in chosenTemplates"
                    :key="i"
                  >
                    <span class="primary--text" style="font-weight: bolder;">{{item._id}}</span>
                  </v-tab>

                  <v-tabs-items>
                    <v-tab-item
                      v-for="(item,i) in chosenTemplates"
                      :key="i"
                    >
                      <v-container fluid style="padding: 0 20px 20px 20px">
                        <v-layout column wrap mt-2>
                          <v-flex row wrap v-html="item.hasOwnProperty('templateDescription') ? item['templateDescription'] : 'This template has no description...'">
                          </v-flex>
                        </v-layout>
                      </v-container>
                    </v-tab-item>
                  </v-tabs-items>
                </v-tabs>
                <v-flex row wrap v-else text-xs-center>No template chosen.</v-flex>
              </el-collapse-item>
            </el-collapse>
          </v-flex>

        </v-flex>

        <!-- TEMPLATE PREVIEW -->
        <v-flex column xs6 pl-5 style="max-height: calc(100vh - 150px); overflow: auto;">
          <!-- <v-img v-if="templatePreview" style="border: 1px solid black" :contain="true" :src="templatePreview"></v-img> -->
          <img v-if="templatePreview" style="border: 1px solid black; width: 100%;" :src="templatePreview" alt="">
        </v-flex>
      </v-layout>
      
    </v-container>
  </v-layout>

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
  import moment from 'moment'

  export default {
    name: 'TemplateGenerator',
    components: {ProjectSelector, TemplateSelector},
    data: () => ({
      devMode: false,
      projectAddValid: false,
      projectToAdd: '',
      optionsMenu: false,
      selectedTab: [],
      templatePreview: null
    }),
    created: async function () {
      this.chooseProjects([])
      this.openAfterGenerate = this.$store.state.templates.openAfterGenerate
    },
    computed: {
      ...mapGetters(['chosenTemplates', 'chosenProjects', 'visibleProjectsDetail', 'loading', 'visibleProjectsDetail', 'generatorSelectionMode']),
      accordionData: {
        get: function() {
          return [
            { name: 'projects', values: this.chosenProjects },
            { name: 'templates', values: this.chosenTemplates }
          ]
        }
      }
    },
    methods: {
      ...mapActions(['changeOpenAfterGenerate', 'changeGeneratorSelectionMode', 'generateTemplate', 'addForeignNets', 'getTemplatePreview', 'chooseProjects']),
      addProject() {
        if (this.projectAddValid) {
          this.addForeignNets(this.projectToAdd)
        }
      },
      getValue(val) {
        if (typeof(val) !== 'number' && moment(val).isValid()) {
          // return val
          return val.substr(0,10)
        }
        return val
      }
    },
    watch: {
      async chosenTemplates() {
        if (this.chosenTemplates.length === 0) {
          this.templatePreview = null
          return
        }

        const resTmpl = await this.getTemplatePreview()
        this.templatePreview = resTmpl
      }
    }
    
  }
</script>
