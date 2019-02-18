<template>
  <v-flex class="row wrap">
      <multiselect v-if="mode==='project'" @input="setProjInParent"  v-model="PROJ" :options="projs" :multiple="true" placeholder="Select project"
      @search-change="customSearch" label="_id" track-by="_id"><span slot="noResult">No projects found.</span></multiselect>

      <multiselect v-if="mode==='net'" @input="setProjInParent"  v-model="PROJ" :options="projsFiltered" :multiple="true" placeholder="Select project" :searchable="true" :internal-search="false"
      group-label="_id" :group-select="true" group-values="nets_keys" @search-change="customSearch"><span slot="noResult">No projects found.</span></multiselect>
      <!-- :custom-label="projIdName" -->

    </v-flex>
</template>

<script>
import db from '../../main/scripts/database'

var fs = require('fs');
const path = require('path')

export default {
  beforeCreate: async function () {
    console.time('Project selector')

    async function getProjs () {
      const projs = await db.projects.find({
          selector: {_id: {$gt: null}},
          limit: null,
          fields: ['_id', 'nets_keys', 'project_pm']
        })
        return projs.docs
    }

    db.projects.changes({
      since: 'now',
      live: true
      }).on('change', (change) => {
      getProjs().then(e => {
        this.projs = e
        sessionStorage.setItem('projectsBasic', JSON.stringify(e))
      })
    })

    this.mode = this.$parent.mode

    console.timeEnd('Project selector')
  },
  created: async function () {
    console.time('Project selector created')
    async function getProjs () {
      const projs = await db.projects.find({
          selector: {_id: {$gt: null}},
          limit: null,
          fields: ['_id', 'nets_keys', 'project_pm']
        })
        return projs.docs
    }

    if (!sessionStorage.getItem('projectsBasic')) {
      const projects = await getProjs()

      sessionStorage.setItem('projectsBasic', JSON.stringify(projects))

      this.projs = projects
      this.projsFiltered = JSON.parse(JSON.stringify(this.projs))
    } else {
      this.projs = JSON.parse(sessionStorage.getItem('projectsBasic'))
      this.projsFiltered = JSON.parse(JSON.stringify(this.projs))
    }
    console.timeEnd('Project selector created')
  },
  data: () => ({
    PROJ: null,
    projs: [],
    projsFiltered: [],
  }),
  methods: {
    projIdName (proj) {
      return `${proj._id} — ${proj.project_name}`
    },
    async setProjInParent (proj) {
      this.$parent.PROJ = proj.length > 0 ? proj : null
    },
    customSearch (text) {
      const filtered = this.projs.filter(e => {
        const projMatch = e._id.includes(text)
        const netMatch =  e.nets_keys.filter(n => String(n).includes(text))
        return projMatch | netMatch.length > 0 | false
      })
      this.projsFiltered = filtered.length > 0 ? filtered : this.projs
    }
  },
  computed: {
    mode: {
      set: function () {
        this.PROJ = ''
      },
      get: function () {
        return this.$parent.mode
      }
    }
  } 
}
</script>
