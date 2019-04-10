<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12>
        <h3  class="display-2 primary--text"><span class="tit">Import billings data</span></h3>
      </v-flex>
    </v-layout>

    <v-layout row wrap mt-3>

        <!-- // Left side -->
        <v-flex column xs5>
          
          <!-- // Input for template name -->
          <v-flex row xs7>
            <v-form v-model="valid" ref="addTemplateForm" v-on:submit.prevent>
                <v-text-field
                  v-model="cheatDate"
                  label="Cheat date"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="dataSeparator"
                  label="Data separator"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="fileName"
                  :rules="fileNameRules"
                  required
                  style="display:none"
                ></v-text-field>

              </v-form>
          </v-flex>

          <!-- // Dropzone -->
          <v-layout row>
            <v-flex column xs4 @click="getDoc" style="cursor:pointer">
              <table style=" width: 100%; border: 1px dashed darkgrey" @dragover.prevent @drop="onDrop">
                

                <tr v-if="fileName" style="height: 45px; vertical-align:middle; text-align:center;">
                  <td><img :src="thumbnail"></td>
                </tr>
                <tr v-if="fileName" style="height: 15px; vertical-align:middle; text-align:center">
                  <td><span>{{fileName}}</span></td>
                </tr>

                <tr v-else style="height: 60px; vertical-align:middle; text-align:center;">
                  <td>Click me or drop a file to import data</td>
                </tr>
              </table>
            </v-flex>

            <v-flex xs8 column ml-3>
              <table style="height:100%; width: 100%">
                <tr v-if="filePath" style="vertical-align:middle; text-align:left">
                  <td><span>Filepath: {{filePath}}</span></td>
                </tr>
                <tr v-if="fileType" style="vertical-align:middle; text-align:left">
                  <td><span>Filetype: {{fileType}}</span></td>
                </tr>
              </table>
            </v-flex>
          </v-layout>

          <!-- // Button -->
          <v-flex row mt-2>
            <v-btn style="width:100%; margin:0; padding:0" :disabled="!valid" @click="fileType === 'xlsx' ? submitExcel() : submit()" depressed color="primary"> Import datafile </v-btn>
          </v-flex>

        </v-flex>

        <!-- Right side -->
        <v-layout column wrap xs7 ml-4>
          <v-layout row wrap>
            <v-flex shrink column wrap>
              <upload-btn :fileChangedCallback="filePathChanged" title="Choose OB daily file path" outline />
            </v-flex>
            <v-flex grow column wrap>
              <v-text-field v-model="obDailyFilePath" :readonly="true" placeholder="Select path" />
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex shrink column wrap>
              <v-btn @click="getOBDaily(obDailyFilePath)" outline>Get OB Daily</v-btn>
            </v-flex>
          </v-layout>
        </v-layout>

      <v-snackbar v-model="snackbar" :top="true" :right="true" :color="color" :timeout=2000>
        {{snackText}}
        <v-btn dark flat @click="snackbar = false" > Close </v-btn>
      </v-snackbar>

    </v-layout>
  </v-container>
</template>

<style>
.container.grid-list-sm .layout:not(:only-child) {
  margin: 0
}
</style>


<script>
import vueDropzone from "vue2-dropzone"
import db from '../../main/scripts/database'
import { mapActions } from 'vuex';

const {app, dialog} = require('electron').remote
const fs = require('fs');
const path = require('path')
// const settings = require('electron-settings')
const moment = require('moment')
const iconvlite = require('iconv-lite')
const csvjson = require('csvjson')
// moment.locale('cs-cz')

export default {
  name: 'importInvoicing',
  data: () => ({
    valid: false,
    obDailyFilePath: '',
    thumbnail: '',
    fileName: null,
    filePath: null,
    fileType:null,
    fileLastModified:null,
    snackText: null,
    color: null,
    snackbar: false,
    cheatDate: null,
    dataSeparator: null,
    loadingData: false,
    fileNameRules: [
      v => !!v || 'Datafile is required'
    ],
  }),
  methods: {
    ...mapActions(['getOBDaily']),
    clear () {
      this.$refs.addTemplateForm.reset()
    },
    filePathChanged (file) {
      this.obDailyFilePath = file.path
    },
    // async submit() {
    //   if (this.$refs.addTemplateForm.validate()) {
    //     try {
    //       function readFileSync_encoding(filename, encoding) {
    //         var content = fs.readFileSync(filename);
    //         return iconvlite.decode(content, encoding);
    //       }

    //       const data = readFileSync_encoding(this.filePath, 'utf-8')
    //       const dataObj = csvjson.toObject(data, {delimiter: this.dataSeparator})

    //       const dateFields = ['inv_date', 'net_orig_delivery', 'net_contract_delivery', 'contract_dispatch', 'net_package_date', 'actual_dispatch_date']
    //       const currentDate = this.cheatDate? this.cheatDate : this.fileLastModified  // moment(Date.now()).format('DD_MM_YYYY')

    //       const objMapped = dataObj.map(e => {
    //         e['_id'] = e['net_num']
    //         e['net_revenues'] = Number(e['net_revenues'])
    //         e['net_bpo'] = Number(e['net_bpo'])
    //         e['project_ob'] = Number(e['project_ob'])
    //         e['net_panels_no'] = Number(e['net_panels_no'])
    //         e['change_date'] = currentDate
    //         e['sign'] = {}
    //         e['ppes_comments'] = e['ppes_comments'].trim().split('|').filter(e => e.trim() !== "")

    //         dateFields.forEach(dateField => {

    //           const date = moment(e[dateField], 'DD.MM.YYYY', false).add(1, 'day').toISOString()

    //           if (dateField === 'inv_date') {
    //             e['inv_date'] = {[currentDate]: date.substr(0, 10)}
                
    //             // date ? date.substr(0, 10) : null
    //           } else {
    //             e[dateField] = date ? date.substr(0, 10) : null 
    //           }

    //         });

    //         // delete e['delay_type']

    //         return e
    //       })


    //       objMapped.forEach(e => {
    //         db.billings.upsert(e['_id'],  (doc) => {
    //           if (doc.hasOwnProperty('fixedFields')) {
    //             doc['fixedFields'].forEach(u => {
    //               e[u] = doc[u]
    //             })

    //             e['fixedFields'] = doc['fixedFields']
    //           }

    //           if (doc['_rev']) {
    //             Object.assign(e['inv_date'], doc['inv_date'])

    //             return e
    //           } else {
    //             return Object.assign(e, {fixedFields: ['sign']})
    //           }

    //         })
    //       });

    //       // // db.billings.upsertBulk(objMapped)
    //       // // .then(() => {
    //       // //   this.snackbar = true
    //       // //   this.color = 'success'
    //       // //   this.snackText = 'Data were successfuly imported'
    //       // // })

    //       db.settings.get('billings')
    //       .then(res => {
    //           const newChangeDateAdded = res.dates_modified.concat(currentDate)

    //         if (!res.dates_modified.includes(currentDate)) {  
    //           // settings.set('billings.lastUpdate', currentDate)
              
    //           db.settings.put({
    //             _id: 'billings',
    //             _rev: res._rev,
    //             dates_modified: newChangeDateAdded
    //           })
    //             .then(() => {
    //               this.snackbar = true
    //               this.color = 'success'
    //               this.snackText = 'Data were successfuly imported'
    //             })
    //         }
    //       })

    //     } catch (err) {
    //        this.snackbar = true
    //       this.color = 'error'
    //       this.snackText = err
    //     }
    //   }
    // },
    async onDrop (e) {
      e.stopPropagation()
      e.preventDefault()
      const files = e.dataTransfer.files

      const icon = app.getFileIcon(files[0].path, (err, res) => {
        this.thumbnail = res.toDataURL()
        this.fileName = files[0].name
        this.filePath = files[0].path
        this.fileType = files[0].path.split('.')[1]
        this.fileLastModified = moment(files[0].lastModified).toISOString().substr(0, 10)
      })
    },
    getDoc () {
      dialog.showOpenDialog(null, {
          title: 'Get template',
          defaultPath: 'desktop',
          filters: [
            {name: 'File', extensions: ['txt', 'csv', 'xlsx']},
          ],
          buttonLabel: 'Import data'
        }, (p) => {
          if (p) {
            const icon = app.getFileIcon(p[0], (err, res) => {
              this.thumbnail = res.toDataURL()
              const len = p[0].split('\\').length
              this.fileName =  p[0].split('\\')[len-1]
              this.filePath = p[0]
              this.fileType = p[0].split('.')[1]
              this.fileLastModified = moment(p[0].lastModified).toISOString().substr(0, 10)
            })
          }
        })
    },
    // async submitExcel () {
    //   if (this.$refs.addTemplateForm.validate()) {
    //     try {
    //       const dataObj = await invoicingImport(this.filePath)

    //       const dateFields = ['inv_date', 'net_orig_delivery', 'net_contract_delivery', 'contract_dispatch', 'net_package_date', 'actual_dispatch_date']
    //       const currentDate = this.cheatDate? this.cheatDate : this.fileLastModified  // moment(Date.now()).format('DD_MM_YYYY')

    //       const objMapped = dataObj.map(e => {
    //         e['_id'] = String(e['net_num'])
    //         e['net_revenues'] = Number(e['net_revenues'])
    //         e['net_bpo'] = Number(e['net_bpo'])
    //         e['project_ob'] = Number(e['project_ob'])
    //         e['net_panels_no'] = Number(e['net_panels_no'])
    //         e['change_date'] = currentDate
    //         e['sign'] = {}
    //         e['ppes_comments'] = e['ppes_comments'].trim().split('|').filter(e => e.trim() !== "")

    //         dateFields.forEach(dateField => {

    //           const date = moment(e[dateField]).add(1, 'day').toISOString()

    //           if (dateField === 'inv_date') {
    //             e['inv_date'] = {[currentDate]: date.substr(0, 10)}
                
    //             // date ? date.substr(0, 10) : null
    //           } else {
    //             e[dateField] = date ? date.substr(0, 10) : null 
    //           }

    //         });

    //         // delete e['delay_type']

    //         return e
    //       })


    //       objMapped.forEach(e => {
    //         db.billings.upsert(e['_id'],  (doc) => {
    //           if (doc.hasOwnProperty('fixedFields')) {
    //             doc['fixedFields'].forEach(u => {
    //               e[u] = doc[u]
    //             })

    //             e['fixedFields'] = doc['fixedFields']
    //           }

    //           if (doc['_rev']) {
    //             Object.assign(e['inv_date'], doc['inv_date'])

    //             return e
    //           } else {
    //             return Object.assign(e, {fixedFields: ['sign']})
    //           }

    //         })
    //       });

    //       db.settings.get('billings')
    //       .then(res => {
    //           const newChangeDateAdded = res.dates_modified.concat(currentDate)

    //         if (!res.dates_modified.includes(currentDate)) {  
    //           // settings.set('billings.lastUpdate', currentDate)
              
    //           db.settings.put({
    //             _id: 'billings',
    //             _rev: res._rev,
    //             dates_modified: newChangeDateAdded
    //           })
    //             .then(() => {
    //               this.snackbar = true
    //               this.color = 'success'
    //               this.snackText = 'Data were successfuly imported'
    //             })
    //         }
    //       })

    //     } catch (err) {
    //       this.snackbar = true
    //       this.color = 'error'
    //       this.snackText = err
    //     }
    //   }
    // }
    
  },
  components: { vueDropzone }
}
</script>

