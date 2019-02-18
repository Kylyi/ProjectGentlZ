<template>
  <v-layout row wrap style="margin:10px;">

    <v-flex column xs12 wrap>
      <v-flex row wrap xs1><h4 class="subtit2">Detailed info</h4></v-flex>
      <v-flex row wrapx>You can modify detailed info in settings.</v-flex>
    </v-flex>

    <v-divider></v-divider>
    
    <v-layout row wrap>
      <v-flex column xs6 mt-2 style="border-right: 1px solid darkgray;" id="netDetail">

        <v-layout align-end row>
          <v-flex wrap column offset-xs3 offset-lg2 xs4><b>Current version</b></v-flex>
          <v-flex wrap column xs3 id="revPick">

            <v-autocomplete
              v-model="selectedRevision"
              :items="revisionsAvailable"
              placeholder="Select older revision of this document"
              no-data-text="There are no other revisions than the current one."
              item-text="rev"
              @change="getRevData"
            ></v-autocomplete>
          </v-flex>
        </v-layout>

        <v-layout row wrap v-for="v in detailInfo" :key="v.value">
          <!-- FIELD NAMES -->
          <v-flex column xs3 lg2>
            <v-layout row align-center>
              <v-flex column text-xs-right>{{v.name}}:</v-flex>
            </v-layout>
            
            
          </v-flex>

          <!-- CURRENT VERSION VALUES -->
          <v-flex column xs4 v-if="!Array.isArray(templateData.data[v.value])">

            <!-- NON-DATE FIELDS -->
            <v-layout v-if="v.dataType !== 'date'">
              <v-flex style="width:100%;">
                <el-input
                  :type="v.dataType"
                  size="mini"
                  prefix-icon="el-icon-edit"
                  :disabled="!v.editable"
                  v-model="templateData.data[v.value]">
                </el-input>
              </v-flex>
              <v-flex>
                <v-icon @click="changeData(v.value)">{{templateData.data.fixedFields.includes(v.value) ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
              </v-flex>
            </v-layout>

            <!-- DATE FIELDS -->
            <v-layout v-else>
              <v-flex style="width:100%;">
                <el-date-picker
                  size="mini"
                  v-model="templateData.data[v.value]"
                  type="date"
                  placeholder="Pick a day"
                  format="dd.MM.yyyy">
                </el-date-picker>
              </v-flex>
              <v-flex>
                <v-icon @click="changeData(v.value)">{{templateData.data.fixedFields.includes(v.value) ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
              </v-flex>
            </v-layout>
          </v-flex>

          <!-- REVISION VALUES -->
          <v-flex column xs4 v-if="oldDoc">

            <!-- NON-DATE FIELDS -->
            <v-flex v-if="v.dataType !== 'date'">
              <el-input
                readonly
                :type="v.dataType"
                size="mini"
                prefix-icon="el-icon-edit"
                :disabled="!v.editable"
                v-model="oldDoc[v.value]">
              </el-input>
            </v-flex>

            <!-- DATE FIELDS -->
            <v-flex v-else>
              <el-date-picker
                readonly
                size="mini"
                v-model="oldDoc[v.value]"
                type="date"
                placeholder="Pick a day"
                format="dd.MM.yyyy">
              </el-date-picker>
            </v-flex>

          </v-flex>
        </v-layout>        

      </v-flex>
      <v-flex column xs6 mt-2>
        <v-btn icon flat @click="saveData"><v-icon>save</v-icon></v-btn>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<style>
  #revPick > div > div > div.v-input__slot > div.v-select__slot > input[type="text"] {
    font-size: 12px;
    font-weight: bolder;
    padding: 0
  }

  #revPick > div {
    padding-top: 0;
    margin-top: 0;
  }

  #revPick > div > div > div.v-text-field__details {
    display: none;
  }

  #revPick > div > div > div.v-input__slot {
    margin-bottom: 0;
  }
  #netDetail .v-text-field input {
    padding: 0
  }
  #netDetail .v-messages {
    display: none;
  }
  #netDetail .v-text-field {
    margin: 0;
    padding: 0;
  }
  #netDetail .v-input__slot {
    margin: 0;
  }

  #netDetail .v-input__append-outer {
    margin-top: 0;
    margin-bottom: 0;
  }

  #netDetail .v-input__append-inner {
    margin-top: 0;
  }

  #netDetail .el-date-editor {
    width: 100%;
  }
</style>

<script>
  import {readFile} from '../../main/scripts/misc'
  import db from '../../main/scripts/database'
  const path = require('path')
  const isDev = require('electron-is-dev')

  export default {
    data: () => ({
      detailInfo: isDev ? JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'invoicingDetails.json'), 'utf-8')) : JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json'), 'utf-8')),
      revisionsAvailable: [],
      selectedRevision: null,
      oldDoc: null,
    }),
    props: {
      templateData: {
        type: Object,
        default: () => {}
      }
    },
    watch: {
      templateData: {
        immediate: true, 
        async handler (val, oldVal) {
          const doc = await db.billings.get(val.data['_id'], {revs_info: true})
          doc['_revs_info'].shift()

          this.revisionsAvailable = doc['_revs_info']

        }
      }
    },
    methods: {
      async getRevData (e) {
        // console.log(await db.billings.get(this['_props'].templateData.data._id, {rev: e}))
        this.oldDoc = await db.billings.get(this['_props'].templateData.data._id, {rev: e})
      },
      async changeData(e) {
        const fixedFields = this.$props.templateData.data.fixedFields

        if (fixedFields.includes(e)) {
          const ix = fixedFields.indexOf(e)
          fixedFields.splice(ix, 1)
        } else {
          fixedFields.push(e)
        }

        this.$props.templateData.data.fixedFields = fixedFields
      },
      async saveData() {
        const docId = await db.billings.get(this.$props.templateData.data['_id'])
        db.billings.upsert(this.$props.templateData.data['_id'], (doc) => {
          return this.$props.templateData.data
        })
      }
    }
  }
</script>
