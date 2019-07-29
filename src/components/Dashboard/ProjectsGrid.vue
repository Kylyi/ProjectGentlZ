<template>
  <v-layout column id="projectsGrid" style="max-height: 100%; background-color: white;">
    <!-- Title -->
    <h5 class="headline" style="position: absolute; top: 8px; left: 16px; z-index: 3;"><b>My projects overview</b></h5>
    <div style="display: inline-block; position:absolute; right: 172px; top: 16px; z-index:3;">  
      <div style="display: flex; align-items: center;">
        <span><b>Mode:</b> &nbsp;</span>
        <v-btn-toggle mandatory
          @change="changeGeneratorSelectionMode(false)"
          :value="generatorSelectionMode"
          style="box-shadow: none;"
        >
          <v-btn small flat value="net" :color="generatorSelectionMode === 'net' ? selectColor : ''">Network</v-btn>
          <v-btn small flat value="project" :color="generatorSelectionMode === 'net' ? '' : selectColor">Project</v-btn>
        </v-btn-toggle>
      </div>
    </div>

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
  computed: {
    ...mapGetters(['generatorSelectionMode', 'dbConnectivity', 'loading', 'foreignProjectsBasic']),
    selectColor(arg) {
      if (this.generatorSelectionMode === 'project') {
        return 'primary'
      } else {
        return 'info'
      }
    }
  },
  methods: {
    ...mapActions(['addActiveProjects', 'fetchAllTemplates', 'changeGeneratorSelectionMode', 'fetchForeignProjectsBasic', 'removeForeignNets'])
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
#projectsGrid .dx-datagrid-header-panel {
  padding-right: 4px;
}
</style>
