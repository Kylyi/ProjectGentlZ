<template>
  <v-flex class="row wrap">
      <multiselect v-if="forceMode === 'project' || generatorSelectionMode==='project'" @input="projChange($event)"  :value="chosenProjects" 
      :options="pmProjectsUniqueProjects" placeholder="Select project"
      :custom-label="projNetNo" track-by="Project Definition"><span slot="noResult">No projects found.</span></multiselect>

      <multiselect v-else @input="projChange($event)"  :value="chosenProjects" :options="pmProjectsBasic" :multiple="true" placeholder="Select network" :searchable="true"
      track-by="_id" label="_id"><span slot="noResult">No networks found.</span></multiselect>

    </v-flex>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  created: async function () {
    if (this.generatorSelectionMode === 'project' && !this.chosenProjects.hasOwnProperty('netsKeys')) {
       this.chooseProjects([])
    }
  },
  props: {
    forceMode: {
      type: String,
      default: () => {}
    }
  },
  computed: {
    ...mapGetters(['pmProjectsBasic', 'generatorSelectionMode', 'chosenProjects', 'pmProjectsUniqueProjects'])
  } ,
  methods: {
    ...mapActions(['chooseProjects']),
    projNetNo (proj) {
      return proj ?  `${proj['Project Definition']}: ${proj['Project Name'] || ''} (${proj.netsKeys.length} networks)` : ''
    },
    async projChange (proj) {
      proj ? this.chooseProjects(proj) : this.chooseProjects([])
    }
  }
}
</script>
