<template>
  <v-flex class="row wrap">
      <multiselect v-if="generatorSelectionMode==='project'" @input="projChange($event)"  :value="chosenProjects" :options="pmProjectsProjectMode" placeholder="Select project"
      @search-change="customSearch" label="Project Definition" track-by="_id"><span slot="noResult">No projects found.</span></multiselect>

      <multiselect v-if="generatorSelectionMode==='net'" @input="projChange($event)"  :value="chosenProjects" :options="pmProjectsNetMode" :multiple="true" placeholder="Select network" :searchable="true" :internal-search="false"
      group-label="project_id" :group-select="true" track-by="_id" group-values="nets_keys" @search-change="customSearch"><span slot="noResult">No projects found.</span></multiselect>

    </v-flex>
</template>

<script>
import db from '../../main/scripts/database';
import { mapGetters, mapActions } from "vuex";

export default {
  created: async function () {
    if (this.$store.state.projects.chosenProjects.length > 0 && this.$store.state.templates.generatorSelectionMode === 'net') {
      this.chooseProjects([])
    }
  },
  data: () => ({

  }),
  computed: {
    ...mapGetters(['pmProjectsBasic', 'generatorSelectionMode', 'chosenProjects', 'pmProjectsNetMode', 'pmProjectsProjectMode'])
  } ,
  methods: {
    ...mapActions(['fetchPmProjectsBasic', 'chooseProjects', 'prepareProjectsNetMode', 'prepareProjectsProjectMode']),
    netIdDescr (proj) {
      return `${proj._id} — ${proj['Network Description']}`
    },
    customSearch (text) {
      const filtered = this.projs.filter(e => {
        const projMatch = e._id.includes(text)
        const netMatch =  e.nets_keys.filter(n => String(n).includes(text))
        return projMatch | netMatch.length > 0 | false
      })
      this.projsFiltered = filtered.length > 0 ? filtered : this.projs
    },
    async projChange (proj) {
      proj ? this.chooseProjects(proj) : this.chooseProjects([])
    }
  }
}
</script>
