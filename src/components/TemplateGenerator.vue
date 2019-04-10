<template>
  <v-layout column xs12 wrap>
    <v-layout row wrap align-center style="padding: 18.5px 24px; background-color: #424242;" >
      <!-- Title -->
      <v-flex column shrink>
        <h3 class="display-2 white--text">Template generator</h3>
      </v-flex>

      <!-- MENU -->
      <v-flex column grow text-xs-right>
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
            <v-list>
              <!-- Generator mode -->
              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-flex row wrap>Mode</v-flex>
                      <v-flex row wrap>
                        <v-btn-toggle v-model="generatorSelectionMode" @change="changeGeneratorSelectionMode" :mandatory="true">
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
                        <v-btn-toggle v-model="openAfterGenerate" @change="changeOpenAfterGenerate" :mandatory="true">
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
    </v-layout>

    <v-container fluid>
      <v-flex column xs6>
        <v-flex row wrap mt-4>
          <h5 class="headline"><b>Generate template</b></h5>
        </v-flex>

        <v-flex row wrap mt-4>
          <project-selector ref="projS" />
        </v-flex>

        <v-flex row wrap mt-3>
          <template-selector ref="tmplS" />
        </v-flex>

        <v-flex row wrap text-xs-right mt-1>
          <v-btn outline color="primary" style="margin: 0;" @click="generateTemplate" :disabled="!(chosenTemplates.length > 0 && chosenProjects.length > 0)">Generate</v-btn>
        </v-flex>
        <v-flex row wrap>
          <el-collapse v-model="selectedTab">
            <el-collapse-item title="Projects" name="projects">
              <v-carousel
                v-if="chosenProjects.length > 0"
                hide-controls
                :cycle="false"
                height="300"
                style="box-shadow: none;"
              >
                <v-carousel-item
                  v-for="(item,i) in chosenProjects"
                  :key="i"
                >
                  <v-layout row wrap>
                    <v-flex column xs4 v-for="field in Object.keys(item)" :key="field" style="border: 1px solid black;">
                      <div>
                        {{field}}
                      </div>
                      <div>
                        {{item[field]}}
                      </div>
                    </v-flex>
                  </v-layout>
                </v-carousel-item>
              </v-carousel>
            </el-collapse-item>

            <el-collapse-item title="Templates" name="templates">
              <v-carousel
                v-if="chosenTemplates.length > 0"
                hide-controls
                :cycle="false"
                height="300"
                style="box-shadow: none;"
              >
                <v-carousel-item
                  v-for="(item,i) in chosenTemplates"
                  :key="i"
                >
                  <v-layout row wrap>
                    <v-flex column xs4 v-for="field in Object.keys(item)" :key="field" style="border: 1px solid black;">
                      <div>
                        {{field}}
                      </div>
                      <div>
                        {{item[field]}}
                      </div>
                    </v-flex>
                  </v-layout>
                </v-carousel-item>
              </v-carousel>
            </el-collapse-item>
          </el-collapse>
        </v-flex>

      </v-flex>
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

  export default {
    name: 'TemplateGenerator',
    data: () => ({
      devMode: false,
      projectAddValid: false,
      projectToAdd: '',
      optionsMenu: false,
      selectedTab: []
    }),
    created: async function () {
      this.openAfterGenerate = this.$store.state.templates.openAfterGenerate
      this.generatorSelectionMode = this.$store.state.templates.generatorSelectionMode
    },
    computed: {
      ...mapGetters(['chosenTemplates', 'chosenProjects', 'visibleProjectsDetail', 'loading']),
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
      ...mapActions(['changeOpenAfterGenerate', 'changeGeneratorSelectionMode', 'generateTemplate', 'addForeignNets', 'fetchNetTasksInfo', 'clearLocalStorage',
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
