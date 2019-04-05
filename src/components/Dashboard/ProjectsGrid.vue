<template>
  <v-layout column wrap id="projectsGrid">
    <!-- Title -->
    <v-layout row wrap>
        <v-flex grow>
          <v-layout column wrap justify-center fill-height>
            <h1 display-3 class="myHeading">My projects</h1>
          </v-layout>
        </v-flex>

        <v-flex shrink>
          <v-container fluid grid-list-md style="padding: 0;">
            <v-layout row wrap>
              <v-flex d-flex>
                <v-layout row wrap>
                  <v-flex d-flex xs12>
                    <b>Mode</b>
                  </v-flex>
                  <v-flex d-flex xs12>
                    <span :style="`color: ${generatorSelectionMode === 'net' ? '#2196f3' : ''}`">Network</span>
                    <el-switch
                      :value="generatorSelectionMode"
                      active-color="#ff5252"
                      inactive-color="#2196f3"
                      active-value="project"
                      inactive-value="net"
                      @change="changeGeneratorSelectionMode(false)"
                    >
                    </el-switch>
                    <span :style="`color: ${generatorSelectionMode === 'project' ? '#ff5252' : ''}`">Project</span>
                  </v-flex>
                </v-layout>
              </v-flex>
              <v-flex d-flex>
                <v-btn
                  title="Removes all projects that don't belong to me."
                  :color="foreignProjectsBasic.length > 0 ? 'error' : ''"
                  @click="removeForeignNets"
                  icon
                >
                  <v-icon>supervisor_account</v-icon>
                </v-btn>
              </v-flex>
              <v-flex d-flex>
                <v-btn
                  v-if="dbConnectivity"
                  icon
                  @click="addActiveProjects"
                  title="Refresh all projects"
                  :disabled="loading"
                >
                  <v-icon>refresh</v-icon
                ></v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
    </v-layout>

    <!-- Table -->
    <template v-if="generatorSelectionMode === 'net'">
      <net-mode />
    </template>

    <!-- Table -->
    <template v-else>
      <projects-mode />
    </template>

    <generate-template-dialog />
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import GenerateTemplateDialog from '../TemplateGenerator/GenerateTemplateDialog'
import NetMode from './ProjectsGrid/NetMode'
import ProjectsMode from './ProjectsGrid/ProjectsMode'

export default {
  components: { GenerateTemplateDialog, NetMode, ProjectsMode },
  computed: mapGetters(['generatorSelectionMode', 'dbConnectivity', 'loading', 'foreignProjectsBasic']),
  methods: {
    ...mapActions(['addActiveProjects', 'fetchProjectsDetail', 'fetchAllTemplates', 'changeGeneratorSelectionMode', 'fetchForeignProjectsBasic', 'removeForeignNets'])
  }
}
</script>

<style>
tr.expanded {
  color: cornflowerblue;
}
table.detailTable td {
  padding: 0;
}
table.detailTable {
  padding: 0 1em;
}
div#myProjectsTable td {
  padding: 0;
}
#generateTemplate:hover {
  background-color: #F3E5F5;
}

</style>
