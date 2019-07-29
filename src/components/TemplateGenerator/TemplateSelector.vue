<template>
  <v-flex class="row wrap">
    <multiselect @input="chooseTemplate" track-by="_id" label="_id" :value="chosenTemplates" :options="allTemplatesByType" :multiple="true" group-values="options" group-label="label" :group-select="true" placeholder="Select template"><span slot="noResult">No template found.</span></multiselect>
  </v-flex>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  created() {
    // this.fetchAllTemplates(true)
  },
  data: () => ({
    TMPL: null,
  }),
  computed: {
    ...mapGetters(['allTemplatesByType', 'chosenTemplates'])
  },
  methods: {
    ...mapActions(['fetchAllTemplates', 'chooseTemplate']),
    async templateChange (tmpl) {
      this.chooseTemplate(tmpl)
    },
  }
}
</script>

