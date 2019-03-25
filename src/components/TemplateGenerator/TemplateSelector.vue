<template>
  <v-flex class="row wrap">
      <!-- <multiselect ref="tmplS" id="tmplS" v-model="TMPL" :options="tmpls"
      placeholder="Select template" label="id" track-by="id" group-values="tmpls" group-label="name" @input="setTemplInParent"></multiselect> -->
      <!-- <select-box></select-box> -->


      <multiselect @input="templateChange($event)" track-by="_id" label="_id" :value="chosenTemplates" :options="allTemplatesBasic" :multiple="true" group-values="options" group-label="label" :group-select="true" placeholder="Select template"><span slot="noResult">No template found.</span></multiselect>
    </v-flex>
</template>


<script>
import db from '../../main/scripts/database'
import { mapGetters, mapActions } from "vuex";

export default {
  created() {
    this.fetchAllTemplates(true)
  },
  data: () => ({
    TMPL: null,
  }),
  computed: {
    ...mapGetters(['allTemplatesBasic', 'chosenTemplates'])
  },
  methods: {
    ...mapActions(['fetchAllTemplates', 'chooseTemplate']),
    async templateChange (tmpl) {
      this.chooseTemplate(tmpl)
    },
  }
}
</script>
