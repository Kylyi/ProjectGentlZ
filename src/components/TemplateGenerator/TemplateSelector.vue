<template>
  <v-flex class="row wrap">
      <!-- <multiselect ref="tmplS" id="tmplS" v-model="TMPL" :options="tmpls"
      placeholder="Select template" label="id" track-by="id" group-values="tmpls" group-label="name" @input="setTemplInParent"></multiselect> -->
      <!-- <select-box></select-box> -->
      <multiselect @input="setTemplInParent" track-by="_id" label="_id" v-model="TMPL" :options="tmpls" :multiple="true" group-values="options" group-label="label" :group-select="true" placeholder="Select template"><span slot="noResult">No template found.</span></multiselect>
    </v-flex>
</template>


<script>
import db from '../../main/scripts/database'

export default {
  beforeCreate: async function () {
    db.templates.changes({
      since: 'now',
      live: true
      }).on('change', (change) => {
      getTmpls().then(e => {
        this.tmpls = e
      })
    })
    async function getTmpls () {
      const tmpls = await db.templates.find({
          selector: {},
          limit: null
        })

        const z = tmpls.docs.reduce((agg, e) => {
          const x = agg.map(a => a.label === e.template_type)
          const y = x.indexOf(true)
          if (y === -1) agg = [...agg, {label: e.template_type, options: [e]}]
            else agg[y]['options'].push(e) 
          return agg
        }, [])


        return z
    }

    this.tmpls = await getTmpls()
  },
  data: () => ({
    TMPL: null,
    tmpls: [],
  }),
  methods: {
    async setTemplInParent (tmpl) {
      this.$parent.TMPL = tmpl.length > 0 ? tmpl : null

    },
  },
  // components: {ElSelect, ElOption}
}
</script>
