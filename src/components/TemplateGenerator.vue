<template>
  <v-container>
    <v-flex :class="devMode? 'd-flex': 'd-none'">
      <v-btn v-shortkey="['ctrl', 'alt', 'o']" @shortkey="devMode = !devMode" class="d-none">Add projects</v-btn>

    </v-flex>

    <v-layout align-start class="wrap row">

      <v-flex xs10 row wrap mb-4>
        <h3 class="display-2 primary--text"><span class="tit">Template generator</span></h3>
      </v-flex>

      <v-flex xs2 row wrap text-xs-right>
        <v-menu
          v-model="optionsMenu"
          :close-on-content-click="false"
          :nudge-width="300"
          nudge-left="335"
        >
          <v-btn
            slot="activator"
            outline
            color="primary"
          >
            Options
            <v-icon right>keyboard_arrow_down</v-icon>
          </v-btn>

          <v-card id="optionsMenu">
            <v-list>
              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-flex row wrap>Mode</v-flex>
                      <v-flex row wrap>
                        <v-btn-toggle v-model="mode" @change="setGeneratorMode">
                          <v-btn flat value="project">
                            Project
                          </v-btn>
                          <v-btn flat value="net">
                            Network
                          </v-btn>
                        </v-btn-toggle>
                      </v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>
                    <v-list-tile-action-text>
                      <v-flex row wrap>Open document after generating</v-flex>
                      <v-flex row wrap>
                        <v-btn-toggle v-model="docOpen" @change="setDocOpen">
                          <v-btn flat value="yes">
                            Yes
                          </v-btn>
                          <v-btn flat value="no">
                            No
                          </v-btn>
                        </v-btn-toggle>
                      </v-flex>

                    </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>Import projects</v-list-tile-title>
                  <v-list-tile-action-text>
                    <v-btn flat depressed outline color="primary" @click="yikes">Active projects</v-btn>
                  </v-list-tile-action-text>

                </v-list-tile-content>
              </v-list-tile>


            </v-list>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn flat @click="optionsMenu = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-flex>


      
      <v-layout row wrap align-start fill-height>
        <!-- Left side -->
        <v-flex column xs5 style="max-width:600px">
          
          <!-- Project selector -->
          <project-selector ref="projS" mt-5></project-selector>

          <!-- Template selector -->
          <template-selector ref="tmplS" style="margin-top:2em"></template-selector>

          <!-- Button -->
          <v-layout row wrap justify-end>
            <v-btn  outline depressed color="primary" @click="generateTemplateTrigger" :disabled="!(TMPL && PROJ)" class="elevation-7 mt-4">Generate</v-btn>
          </v-layout>

          <!-- Project info -->
          <v-flex row wrap mt-4>
            <v-tabs
              v-model="activeTab"
            >
              <v-tab ripple>Project info</v-tab>
              <v-tab-item>
                <transition name="fade" mode="out-in">
                  <v-card flat v-if="PROJ">
                    <transition name="fade" mode="out-in">
                      <v-card :key="PROJ[0]._id">
                        <v-card-text class="projectInfo">
                          <table style="width:100%">
                            <tr>
                              <td>Project ID</td>
                              <td>{{PROJ[0]._id}}</td>
                            </tr>
                            <tr>
                              <td>Project name</td>
                              <td>{{PROJ[0].project_name}}</td>
                            </tr>
                            <tr>
                              <td>Project PM</td>
                              <td>{{PROJ[0].project_pm}}</td>
                            </tr>
                            <tr>
                              <td>Customer</td>
                              <td>
                                <v-layout row wrap>
                                  <v-flex column>
                                    {{PROJ[0].customer}}
                                  </v-flex>

                                  <v-spacer></v-spacer>

                                  <v-flex column xs1>
                                      <v-btn @click="showCustomerInfo = !showCustomerInfo" icon style="margin:-10px">
                                        <v-icon small color="grey lighten-1">info</v-icon>
                                      </v-btn>

                                      <v-card v-show="showCustomerInfo" style="position:fixed; left:615px; top:498px; width:500px;">
                                        <v-flex row style="position: absolute; right: 0px;">
                                          <v-btn @click="showCustomerInfo = !showCustomerInfo" icon style="margin:-10px">
                                            <v-icon small color="red lighten-1" outlined>close</v-icon>
                                          </v-btn>
                                        </v-flex>
                                        <table style="width:100%" class="customerInfo">
                                          <tr>
                                            <td>Customer address</td>
                                            <td>{{PROJ[0].customer_address}}</td>
                                          </tr>
                                          <tr>
                                            <td rowspan="3">Customer contact person</td>
                                            <td style="text-align: left; padding-left: 1em;">Name: {{PROJ[0].customer_contact_person}}</td>
                                          </tr>
                                          <tr>
                                            <td style="text-align: left; padding-left: 1em;">@: {{PROJ[0].customer_contact_person_email}}</td>
                                          </tr>
                                          <tr>
                                            <td style="text-align: left; padding-left: 1em;">#:{{PROJ[0].customer_contact_person_phone}}</td>
                                          </tr>
                                        </table>
                                      </v-card>
                                  </v-flex>
                                  
                                </v-layout>
                              </td>
                            </tr>
                            <tr>
                              <td>Quotation number</td>
                              <td>{{PROJ[0].quotation_number}}</td>
                            </tr>
                          </table>
                        </v-card-text>
                      </v-card>
                    </transition>
                  </v-card>
                    
                  <v-card v-else>
                    <transition name="fade" mode="out-in">
                      <v-card key="notChosen">
                        <v-card-text>
                          Project not chosen.
                        </v-card-text>
                      </v-card>
                    </transition>
                  </v-card>
                </transition>
              </v-tab-item>

              <v-tab ripple>Progress</v-tab>
              <v-tab-item style="text-align:center">

                <!-- <transition name="fade" mode="out-in"> -->
                  <v-card flat v-if="PROJ">
                    <!-- <transition name="fade" mode="out-in"> -->
                      <v-card :key="PROJ[0]._id" class="projectInfo">
                        <v-progress-circular
                          :rotate="-90"
                          :size="100"
                          :width="15"
                          :value="PROJ[0].progress"
                          color="primary"
                          style="padding: 20px 0px;"
                        >
                          {{ PROJ[0].progress }}
                        </v-progress-circular>
                      </v-card>
                    <!-- </transition> -->
                  </v-card>
                <!-- </transition> -->
                

            </v-tab-item>
              
            </v-tabs>

          </v-flex>
        </v-flex>

        <!-- Right side -->
        <v-flex xs4 offset-xs3>
          <v-layout row wrap>
            <v-flex column xs12 pr-4>
              <v-form
                ref="projectAddForm"
                v-model="projectAddValid"
                @submit.prevent="addProject"
                @input="addProject"
              >
                <v-text-field
                  v-model="projectToAdd"
                  :rules="[v => !!v || 'Project ID is required', v => (v && v.length === 6) || 'Projects are 6 characters long.']"
                  label="Add project (ID)"
                  required
                >
                </v-text-field>
              </v-form>
            </v-flex>

            <!-- <v-flex column xs6>
              <v-select
                v-model="divisionSelect"
                :items="['[PPES].[dbo].[lvmv_networks]', '[Ppes-export_1601_AB1]']"
                label="Division"
              ></v-select>
            </v-flex> -->
          </v-layout>

          <v-divider></v-divider>

          <v-layout row wrap v-if="projectAddInfo">
            <v-flex column xs11>
              <v-flex row wrap><h3 class="subtit2">Project #: {{projectAddInfo[0].project_id}}</h3></v-flex>
              <v-flex row wrap v-for="(net, i) in projectAddInfo[0].nets" :key="net.net_num">Net #{{i+1}}: {{net.net_num}}</v-flex>
            </v-flex>
            <v-flex column xs1>
              <v-btn icon @click="confirmAdd"><v-icon>add</v-icon></v-btn>
            </v-flex>
            
          </v-layout>
        </v-flex>



        <!-- <v-layout column xs7 flex v-if="tmplHTML" ml-4 style="border: 1px solid black;">
          <v-flex row wrap >
            <v-responsive v-html="tmplHTML" :aspect-ratio="1.4142/1">
              
            </v-responsive>
          </v-flex>
        </v-layout> -->
      </v-layout>

    </v-layout>

    <v-snackbar v-model="snackbar" :top="true" :right="true" :color="color" :timeout=4000>
      {{snackText}}
      <v-btn dark flat @click="snackbar = false" ><v-icon>close</v-icon></v-btn>
      <!-- <v-btn dark flat @click="xxx" > Open </v-btn> -->
    </v-snackbar>

    

  </v-container>

</template>

<style lang="scss" scoped>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .projectInfo {
    padding: 0.5em 0px;

    table tr > td:first-child {
      text-align: right;
      width: 9em;
    }

    table tr > td:nth-child(2) {
      padding-left: 1em;
      text-align: left;
    }
  }

  .projectInfo {
    min-height: 10em;
  }

  tr:hover {
    background-color: #E8E8E8
  }
</style>


<script>
  console.time('someFunction');

  const {ipcRenderer} = require('electron')
  const {dialog} = require('electron').remote
  const shell = require('electron').shell
  const mammoth = require('mammoth')

  import TemplateSelector from './TemplateGenerator/TemplateSelector'
  import ProjectSelector from './TemplateGenerator/ProjectSelector'
  import db from '../main/scripts/database'
  import {projectsImport} from '../main/scripts/addProjects'
  import fs from 'fs'
  import {readFile} from '../main/scripts/misc'
  import {getAllProjects} from '../main/scripts/getProjects'
  const path = require('path')


  console.timeEnd('someFunction');

  export default {
    name: 'TemplateGenerator',
    data: () => ({
      PROJ: null,
      TMPL: null,
      color: '',
      snackbar: false,
      snackText: '',
      activeTab: null,
      docType: "office",
      showCustomerInfo: false,
      devMode: false,
      projectAddValid: false,
      projectToAdd: '',
      projectAddInfo: null,
      mode: localStorage.getItem('generatorMode') ? localStorage.getItem('generatorMode') : 'project',
      optionsMenu: false,
      docOpen: localStorage.getItem('docOpen') ? localStorage.getItem('docOpen') : 'yes',
      divisionSelect: '[lvmv_networks]'
    }),
    beforeCreate: function () {
      ipcRenderer.on('generated', (e, p, docOpen) => {
        this.snackbar = true
        this.color = 'success'
        this.snackText = 'Template was successfuly generated.'

        if (docOpen === 'yes') shell.openItem(p)
      })
    },
    methods: {
      async generateTemplateTrigger () {
        const tmplDataObj = this.TMPL? this.TMPL: null
        const projData = this.PROJ ? this.PROJ : null
        // const tmplData = tmplDataObj ? await db.templates.getAttachment(tmplDataObj._id, tmplDataObj.template_name) : null

        if (tmplDataObj && projData) {
          projData.forEach(p => {
            tmplDataObj.forEach(t => {
              if (this.mode === 'project') {
                async function generate(docOpen) {
                  try {
                    let pData =  await db.projects.get(p['_id'])
                    pData = pData.nets[0].net_info[0].task_info
                    const tData = await db.templates.getAttachment(t._id, t.template_name)

                    dialog.showSaveDialog(null, {
                      title: 'Save template',
                      defaultPath: t['template_name'],
                      buttonLabel: 'Save',
                      filters: t['template_type'] === 'xlsx' ? [{name: 'Excel', extensions: ['xlsx']}] : [{name: 'Microsoft word', extensions: ['docx']}]},
                      (path) => {
                      if (path) {
                        ipcRenderer.send('tmpl-gen', {savePath: path, projData: pData, tmplData: tData, tmplType: t['template_type'], docOpen: docOpen})
                      }
                    })
                  } catch (err) {
                    this.snackbar = true
                    this.color = 'error'
                    this.snackText = err
                  }
                }
                generate(this.docOpen)
              } else if (this.mode === 'net') {
                async function generate(docOpen) {
                  try {
                    let pData = await db.projects.find({
                      selector: {
                        _id: {$gt: null},
                        nets_keys: {
                          $elemMatch: {
                            $in: [p]
                          }
                        }
                      }
                    })
                    pData = pData.docs[0].nets.reduce((agg, e) => {
                      if (e.net_num === p) {
                        Object.assign(agg, e.net_info[0].task_info)
                      }

                      return agg
                    }, {})

                    const tData = await db.templates.getAttachment(t._id, t.template_name)

                    dialog.showSaveDialog(null, {
                      title: 'Save template',
                      defaultPath: t['template_name'],
                      buttonLabel: 'Save',
                      filters: t['template_type'] === 'xlsx' ? [{name: 'Excel', extensions: ['xlsx']}] : [{name: 'Microsoft word', extensions: ['docx']}]},
                      (path) => {
                      if (path) {
                        ipcRenderer.send('tmpl-gen', {savePath: path, projData: pData, tmplData: tData, tmplType: t['template_type'], docOpen: docOpen})
                      }
                    })
                  } catch (err) {
                    this.snackbar = true
                    this.color = 'error'
                    this.snackText = err
                  }
                }
                generate(this.docOpen)
              }
            })
          })
        }
        
      },
      async dumpDb () {
        const ws = fs.createWriteStream('output.txt')
        
        db.billings.dump(ws)
          .then(res => console.log(res))
      },
      addProject() {
        if (!this.projectAddValid || this.projectToAdd.length === 0) return
        const sql = require("mssql/msnodesqlv8");
        const conn = new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json'), 'utf-8')))
        conn.connect()
          .then(() => {
            async function getSingleProjectData(projectId, div) {
              try {
                const sapData = await conn.request().query(`select * from ${div} where [Project Definition] = '${projectId}'`)
                const x = sapData['recordset']

                const y = x.reduce((agg, e) => {
                  const f = agg.map(a => a.project_id === e['Project Definition']).indexOf(true)
                  
                  if (f === -1) {
                    // Project ID not in aggregator
                    return [...agg, {
                      project_id: e['Project Definition'],
                      nets: [{
                        net_num: e['Network Num'],
                        net_info: [{
                          task_num: e['Task Num'],
                          task_info: e
                        }]
                      }]
                    }]

                  } else {
                    // Project ID in aggregator
                    const f2 = agg[f]['nets'].map(a => a.net_num === e['Network Num']).indexOf(true)

                    if (f2 === -1) {
                      // Network num not in aggregator
                      agg[f]['nets'].push({
                        net_num: e['Network Num'],
                        net_info: [{
                          task_num: e['Task Num'],
                          task_info: e
                        }]
                      })

                      return agg

                    } else {
                      // Network num in aggregator
                      agg[f]['nets'][f2]['net_info'].push({
                        task_num: e['Task Num'],
                        task_info: e 
                        })
                      return agg
                    }

                  }
                }, [])

                return y

              } catch (error) {
                console.log(error)
              }
            }

            async function getAllProjectsData(div) {
              try {
                const sapData = await conn.request().query(`select top 10 * from ${div}`)
                const x = sapData['recordset']

                const y = x.reduce((agg, e) => {
                  const f = agg.map(a => a.project_id === e['Project Definition']).indexOf(true)
                  
                  if (f === -1) {
                    // Project ID not in aggregator
                    return [...agg, {
                      project_id: e['Project Definition'],
                      nets: [{
                        net_num: e['Network Num'],
                        net_info: [{
                          task_num: e['Task Num'],
                          task_info: e
                        }]
                      }]
                    }]

                  } else {
                    // Project ID in aggregator
                    const f2 = agg[f]['nets'].map(a => a.net_num === e['Network Num']).indexOf(true)

                    if (f2 === -1) {
                      // Network num not in aggregator
                      agg[f]['nets'].push({
                        net_num: e['Network Num'],
                        net_info: [{
                          task_num: e['Task Num'],
                          task_info: e
                        }]
                      })

                      return agg

                    } else {
                      // Network num in aggregator
                      agg[f]['nets'][f2]['net_info'].push({
                        task_num: e['Task Num'],
                        task_info: e 
                        })
                      return agg
                    }

                  }
                }, [])

                return y

              } catch (error) {
                console.log(error)
              }
            }
            
            // return getAllProjectsData(this.divisionSelect)
            return getSingleProjectData(this.projectToAdd, this.divisionSelect)
          })
          .then(projectInfo => this.projectAddInfo = projectInfo.length > 0 ? projectInfo : null)
          .then(() => conn.close())
          .catch(e => console.error(e))
      },
      async confirmAdd () {
        this.projectAddInfo.forEach(p => {
          const nets_keys = p.nets.reduce((agg ,e) => [...agg, e.net_num], [])

          db.projects.upsert(p.project_id, (doc) => {
            doc['_id'] = p.project_id,
            doc['nets'] = p.nets
            doc['nets_keys'] = nets_keys
            doc['project_pm'] = p.nets[0].net_info[0].task_info['Project Manager']

            return doc
          }).then(e => console.log(e))

        })
      },
      async setGeneratorMode(e) {
        this.$refs.projS.PROJ = ''
        localStorage.setItem('generatorMode', e)
      },
      setDocOpen(e) {
        localStorage.setItem('docOpen', e)
      },
      async yikes() {
        getAllProjects()
          .then(() => {
            this.snackbar = true
            this.color = 'success'
            this.snackText = 'Projects were successfuly imported.'
          })
          .catch(err => {
            this.snackbar = true
            this.color = 'error'
            this.snackText = err
          })
      }
    },
    components: {ProjectSelector, TemplateSelector}
  }
</script>
