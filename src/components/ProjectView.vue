<template>
  <v-layout id="projectView" column wrap>
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 70px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Project view</h3>
      </v-flex>
      <v-flex column grow text-xs-right style="display: flex; justify-content: flex-end; align-items: center; padding: 0 24px;">
        <v-btn v-if="nets.length > 0" icon @click="revertChanges" color="white"><v-icon>history</v-icon></v-btn>
      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout column wrap>
        <v-flex row wrap>
          <v-layout row>
            <v-flex column shrink style="display: flex; align-items: center;"><v-btn @click="save" color="primary" style="margin: 0;" :loading="pccLoading" :disabled="pccLoading || chosenProjects.length === 0">Save</v-btn></v-flex>
            <v-flex columnn grow pl-3>
              <multiselect @input="projChange" :value="chosenProjects" :options="pmProjects" placeholder="Select project"
                :custom-label="projNetNo" track-by="Project Definition"><span slot="noResult">No projects found.</span></multiselect>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex row wrap mt-1 v-if="nets.length > 0">
          <Split ref="splitPane" style="height: calc(100vh - 206px);">
            <SplitArea :size="33" :minSize="275" >
              <v-layout column wrap style="padding: 8px;" class="paneArea">
                <v-flex row style="height: 49px; display: flex; font-size: larger; align-items: flex-end; color: #ff5252; border-bottom: 1px solid rgba(0, 0, 0, 0.42);"><b>Basic project info</b></v-flex>

                <!-- EDITABLE FIELDS -->
                <v-flex row style="margin-top: 19px;"><b style="color: #ff5252;">Editable</b></v-flex>
                <v-divider></v-divider>
                <v-layout row wrap
                  v-for="row in projectEditableFields"
                  :key="row.field"
                  style="padding: 2px; border-bottom: 1px dashed darkgray;"
                  class="highlightRow"
                  >
                  <v-flex column wrap class="fieldName"> {{ row.displayValue }} </v-flex>

                  <v-flex v-if="row.type === 'autocomplete'" column wrap style="min-width: 200px;">
                    <v-autocomplete v-model="panes['first'][row.field]" :items="row.items" hide-details></v-autocomplete>
                  </v-flex>

                  <v-flex v-if="row.type === 'combobox'" column wrap style="min-width: 200px;">
                    <v-combobox v-model="panes['first'][row.field]" :items="row.items" hide-details></v-combobox>
                  </v-flex>

                  <v-flex v-else-if="row.type === 'text'" column wrap style="min-width: 200px;">
                    <v-text-field v-model="panes['first'][row.field]" hide-details></v-text-field>
                  </v-flex>

                </v-layout>

                <!-- STATIC FIELDS -->
                <v-flex row mt-3><b style="color: #ff5252;">Static</b></v-flex>
                <v-divider></v-divider>
                <v-layout row wrap
                  v-for="row in projectStaticFields"
                  :key="row.field"
                  style="padding: 2px; border-bottom: 1px dashed darkgray;"
                  class="highlightRow"
                  >
                  <v-flex column wrap class="fieldName"> {{ row.displayValue }} </v-flex>
                  <v-flex column wrap style="min-width: 200px;">
                    <v-text-field v-model="panes['first'][row.field]" readonly hide-details></v-text-field>
                  </v-flex>
                </v-layout>

                <v-flex row mt-4>
                  <el-collapse style="width: 100%; background-color: transparent;">
                    <el-collapse-item name="batchEditNetworks">
                      <template slot="title">
                        <v-layout row>
                          <v-flex column shrink ><span style="font-size: larger; color: #ff5252;">Batch edit network data</span></v-flex>
                          <v-flex column grow text-xs-right>
                            <!-- <v-btn v-show="collapseModel.includes('settingsUser')" icon @click.stop="$refs['settingsUser'].setUserSettings()"><v-icon>save</v-icon></v-btn> -->
                          </v-flex>
                        </v-layout>        
                      </template>
                      <v-layout row wrap
                          v-for="(row, idx) in netEditableFields"
                          :key="row.field"
                          style="padding: 2px; border-bottom: 1px dashed darkgray;"
                          class="highlightRow"
                          >
                          <v-flex column wrap class="fieldName"> {{ row.displayValue }} </v-flex>
                          <v-flex v-if="row.type === 'date'" column wrap style="min-width: 150px;">
                            <v-layout row wrap>
                              <v-flex column grow>
                                <v-menu
                                  offset-y
                                  min-width="290px"
                                  max-width="290px"
                                >
                                  <template v-slot:activator="{ on }">
                                    <v-text-field
                                      :value="row.valueForBatch"
                                      :disabled="row.hasOwnProperty('fixingField') && !row.fixingFieldForBatch"
                                      @blur="row.valueForBatch = batchEditNetworks($event, row.field, row.type)"
                                      @keydown.enter="row.valueForBatch = batchEditNetworks($event, row.field, row.type)"
                                      v-on="on"
                                      hide-details
                                      mask="####-##-##"
                                      placeholder="YYYY-MM-DD"
                                      :return-masked-value="true"
                                    ></v-text-field>
                                  </template>
                                  <v-date-picker v-model="row.valueForBatch" @change="batchEditNetworks($event, row.field, row.type)" first-day-of-week="1"></v-date-picker>
                                </v-menu>
                              </v-flex>
                              <v-flex v-if="row.fixingField" column shrink>
                                <v-icon @click="triggerFixingField(null, row.fixingField, true, idx)" style="font-size: 20px;">{{ row.fixingFieldForBatch  ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
                              </v-flex>
                            </v-layout>
                          </v-flex>

                          <v-flex v-else-if="row.type === 'text'" column wrap style="min-width: 200px;">
                            <v-text-field @change="batchEditNetworks($event, row.field, row.type)" hide-details></v-text-field>
                          </v-flex>
                          <v-flex v-else-if="row.type === 'number'" column wrap style="min-width: 200px;">
                            <v-text-field @change="batchEditNetworks($event, row.field, row.type)" hide-details></v-text-field>
                          </v-flex>
                        </v-layout>
                    </el-collapse-item>
                  </el-collapse>
                </v-flex>
              </v-layout>
            </SplitArea>

            <SplitArea
              v-for="net in ['second', 'third']"
              :key="net"
              :size="33"
              :minSize="275"
              >
              <v-layout column wrap style="padding: 8px;">
                <v-flex row wrap>
                  <v-autocomplete
                    v-model="paneNet[net]"
                    label="Select network"
                    :items="nets"
                    :item-text="getText"
                    item-value="_id"
                  >
                  </v-autocomplete>
                </v-flex>

                <v-flex class="paneArea" row wrap v-if="panes[net]">
                  <v-flex row><b style="color: #ff5252;">Editable</b></v-flex>
                  <v-divider></v-divider>

                  <v-layout row wrap
                    v-for="row in netEditableFields"
                    :key="row.field"
                    style="padding: 2px; border-bottom: 1px dashed darkgray;"
                    class="highlightRow"
                    >
                    <v-flex column wrap class="fieldName"> {{ row.displayValue }} </v-flex>
                    <v-flex v-if="row.type === 'date'" column wrap style="min-width: 150px;">
                      <v-layout row wrap>
                        <v-flex column grow>
                          <v-menu
                            offset-y
                            min-width="290px"
                            max-width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                :value="panes[net][row.field]"
                                :disabled="row.hasOwnProperty('fixingField') && !panes[net][row.fixingField]"
                                @blur="panes[net][row.field] = setDate($event, panes[net][row.field])"
                                @keydown.enter="panes[net][row.field] = setDate($event, panes[net][row.field])"
                                v-on="on"
                                hide-details
                                mask="####-##-##"
                                placeholder="YYYY-MM-DD"
                                :return-masked-value="true"
                              ></v-text-field>
                            </template>
                            <v-date-picker v-model="panes[net][row.field]" first-day-of-week="1"></v-date-picker>
                          </v-menu>
                        </v-flex>
                        <v-flex v-if="row.fixingField" column shrink>
                          <v-icon style="font-size: 20px;" @click="triggerFixingField(panes[net], row.fixingField)">{{ panes[net][row.fixingField]  ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
                        </v-flex>
                      </v-layout>
                    </v-flex>

                    <v-flex v-else-if="row.type === 'text'" column wrap style="min-width: 200px;">
                      <v-text-field v-model="panes[net][row.field]" hide-details></v-text-field>
                    </v-flex>
                    <v-flex v-else-if="row.type === 'number'" column wrap style="min-width: 200px;">
                      <v-text-field v-model.number="panes[net][row.field]" hide-details></v-text-field>
                    </v-flex>
                  </v-layout>

                  <v-flex row mt-3><b style="color: #ff5252;">Static</b></v-flex>
                  <v-divider></v-divider>

                  <v-layout row wrap
                    v-for="row in netStaticFields"
                    :key="row.field"
                    style="padding: 2px; border-bottom: 1px dashed darkgray;"
                    class="highlightRow"
                  >
                    <v-flex column wrap class="fieldName"> {{ row.displayValue }}: </v-flex>
                    <v-flex column wrap style="min-width: 200px;">
                      <v-text-field v-model="panes[net][row.field]" hide-details readonly></v-text-field>
                    </v-flex>
                  </v-layout>

                </v-flex>

                <!-- TASKS -->
                <v-flex row wrap mt-2 v-show="panes[net]">
                  <tasks :pane-net="paneNet" :net="net" />
                </v-flex>
              </v-layout>
            </SplitArea>
          </Split>
        </v-flex>
      </v-layout>
    </v-container> 

    <v-snackbar
      v-model="projChangedSnack"
      :bottom="true"
      :timeout="0"
      color="info"

    >
      Selected project was just changed. Data will be reloaded.
      <a @click="reloadData" style="padding-left: 4px; color: white;">Click here to reload data.</a>
    </v-snackbar>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Tasks from './ProjectView/Tasks'
import { ipcRenderer } from 'electron';
import moment from 'moment';

export default {
  name: 'ProjectsView',
  components: {
    Tasks
  },
  created() {
    ipcRenderer.on('selProjectChanged', (e, proj) => {
      this.projChangedSnack = true
      this.newData = proj
    })
    if (this.chosenProjects.length > 0 && !this.chosenProjects[0].hasOwnProperty('nets')) this.projChange()
  },
  beforeDestroy() {
    ipcRenderer.removeAllListeners('selProjectChanged')
  },
  data: function() {
    return {
      paneNet: {
        second: null,
        third: null
      },
      projChangedSnack: false,
      newData: null,
      projectEditableFields: [
        { field: 'PackagingType', displayValue: 'Packaging', type: 'autocomplete', items: ['PAL', 'OSB', 'DRB'], source: 'sap' },
        { field: 'DeliveryCondition', displayValue: 'INCO type', type: 'autocomplete', items: ['FCA', 'DAP', 'NVM'], source: 'sap' },
        { field: 'Electrical Engineer', displayValue: 'Electrical Engineer', type: 'combobox', items: ['Jmeno 1', 'Jmeno 2', 'Jmeno 3'], source: 'couch' },
        { field: 'Mechanical Engineer', displayValue: 'Mechanical Engineer', type: 'combobox', items: ['Jmeno 1', 'Jmeno 2', 'Jmeno 3'], source: 'couch' },
        // { field: 'Foreman.Surname', displayValue: 'Foreman', type: 'combobox', items: ['Jmeno 1', 'Jmeno 2', 'Jmeno 3'], source: 'sap' }, // ???
        // { field: 'TestEngineer.Surname', displayValue: 'Testing', type: 'combobox', items: ['Jmeno 1', 'Jmeno 2', 'Jmeno 3'], source: 'sap' }, // ???
        { field: 'IED Programmer', displayValue: 'IED Programmer', type: 'combobox', items: ['Jmeno 1', 'Jmeno 2', 'Jmeno 3'], source: 'couch' },
      ],
      projectStaticFields: [
        { field: 'Customer Name', displayValue: 'Customer name', type: 'input', source: 'couch' },
        { field: 'Customer Country', displayValue: 'Customer country', type: 'input', source: 'couch' },
        // { field: 'Project Revenues', displayValue: 'Revenues', type: 'input' },
        // { field: 'Project OB', displayValue: 'OB', type: 'input' },
        // { field: 'Panels', displayValue: 'Panels', type: 'input' },
        { field: 'Project Progress - Overal Project', displayValue: 'Progress', type: 'input', source: 'couch' },
        { field: 'Project Progress - Engineering Phase', displayValue: 'Progress - ENG', type: 'input', source: 'couch' },
      ],
      netEditableFields: [
        // { field: 'Current Invoice Date', displayValue: 'Invoice date', type: 'date', fixingField: 'Invoice Date Fixed' },
        { field: 'FATPlanDate', displayValue: 'FAT', type: 'date', fixingField: 'FixationFAT', source: 'sap', valueForBatch: '', fixingFieldForBatch: false },
        { field: 'PackagingDate', displayValue: 'Packaging date', type: 'date', fixingField: 'FixationPackaging', source: 'sap', valueForBatch: '', fixingFieldForBatch: false },
        { field: 'RPDispatchDate', displayValue: 'Expedition Date', type: 'date', fixingField: 'FixationExpedition', source: 'sap', valueForBatch: '', fixingFieldForBatch: false },
        { field: 'InvoiceDate', displayValue: 'Invoice date', type: 'date', fixingField: 'FixationInvoice', source: 'sap', valueForBatch: '', fixingFieldForBatch: false },
        { field: 'FATRealDate', displayValue: 'FAT actual date', type: 'date', source: 'sap', valueForBatch: '' },
        // { field: 'Tolerated Delay', displayValue: 'Escalated', type: 'boolean' },
        { field: 'ExpeditionPlanDate', displayValue: 'Contract. expedition date', type: 'date', source: 'sap', valueForBatch: '' },
        { field: 'ContractDeliveryDate', displayValue: 'Contract. delivery date', type: 'date', source: 'sap', valueForBatch: '' },
        { field: 'AnnouncedDeliveryDate', displayValue: 'Announced delivery date', type: 'date', source: 'sap', valueForBatch: '' },
        { field: 'Protections', displayValue: 'Protections', type: 'text', source: 'couch', valueForBatch: '' },
        { field: 'Interlocking', displayValue: 'Interlocking', type: 'text', source: 'couch', valueForBatch: '' },
        { field: 'Communication', displayValue: 'Communication', type: 'text', source: 'couch', valueForBatch: '' },
      ],
      netStaticFields: [
        { field: 'PanelType1', displayValue: 'Switchgear type', type: 'text', source: 'sap', valueForBatch: '' },
        { field: 'PanelType1Number', displayValue: 'Net panels', type: 'number', source: 'sap', valueForBatch: 0 },
        { field: 'Number of Modules', displayValue: 'Net modules', type: 'number', source: 'couch', valueForBatch: 0 },
        { field: 'Net Statuts - Engineering Phase', displayValue: 'ENG phase', type: 'input', source: 'couch' }, // ???
        { field: 'NetStatus', displayValue: 'Status', type: 'input', source: 'sap' },
        { field: 'BPO', displayValue: 'BPO', type: 'input', source: 'sap' },
        { field: 'BPE', displayValue: 'BPO - ENG', type: 'input', source: 'sap' }
        // { field: 'NetStatus', displayValue: 'SSO', type: 'input', source: 'sap' }, // ???
      ],
      netFixingFields: [
        { field: 'FixationPackaging', displayValue: 'FixationPackaging', type: 'boolean', source: 'sap' },
        { field: 'FixationExpedition', displayValue: 'FixationExpedition', type: 'boolean', source: 'sap' },
        { field: 'FixationInvoice', displayValue: 'FixationInvoice', type: 'boolean', source: 'sap' },
        { field: 'FixationFAT', displayValue: 'FixationFAT', type: 'boolean', source: 'sap' }
      ],
      netsKeys: []
    }
  },
  computed: {
    ...mapGetters(['pmProjects', 'chosenProjects', 'sapNetInfo', 'sapSimilarNetsInfo', 'pccLoading']),
    nets() {
      if (this.chosenProjects.length === 0) return []
      let couchData = JSON.parse(JSON.stringify(this.chosenProjects[0].nets))
      
      if (couchData.length === this.pccData.length) {
        for (let idx = 0; idx < couchData.length; idx++) {
          Object.assign(couchData[idx], this.pccData[idx])
        }
      }
      return couchData
    },
    pccData() {
      return [this.sapNetInfo].concat(this.sapSimilarNetsInfo)
    },
    panes() {
      let panes = {}
      panes.first = this.nets[0] || null
      for (let [key, value] of Object.entries(this.paneNet)) {
        if (value) {
          panes[key] = this.nets.filter(e => e._id === value)[0]
        } else {
          panes[key] = null
        }
      }
      return panes
    }
  },
  methods: {
    ...mapActions(['chooseProjects', 'fetchSapSimilarNets', 'fetchSapNetData', 'fetchMultipleNetsTasksInfo', 'modifyPccNetsData', 'changeProjectsData']),
    projNetNo (proj) {
      return `${proj['Project Definition']}: ${proj['Project Name'] || ''}`
    },
    async projChange (proj) {
      this.netEditableFields = [
        { field: 'FATPlanDate', displayValue: 'FAT', type: 'date', fixingField: 'FixationFAT', source: 'sap', valueForBatch: '', fixingFieldForBatch: false },
        { field: 'PackagingDate', displayValue: 'Packaging date', type: 'date', fixingField: 'FixationPackaging', source: 'sap', valueForBatch: '', fixingFieldForBatch: false },
        { field: 'RPDispatchDate', displayValue: 'Expedition Date', type: 'date', fixingField: 'FixationExpedition', source: 'sap', valueForBatch: '', fixingFieldForBatch: false },
        { field: 'InvoiceDate', displayValue: 'Invoice date', type: 'date', fixingField: 'FixationInvoice', source: 'sap', valueForBatch: '', fixingFieldForBatch: false },
        { field: 'FATRealDate', displayValue: 'FAT actual date', type: 'date', source: 'sap', valueForBatch: '' },
        { field: 'ExpeditionPlanDate', displayValue: 'Contract. expedition date', type: 'date', source: 'sap', valueForBatch: '' },
        { field: 'ContractDeliveryDate', displayValue: 'Contract. delivery date', type: 'date', source: 'sap', valueForBatch: '' },
        { field: 'AnnouncedDeliveryDate', displayValue: 'Announced delivery date', type: 'date', source: 'sap', valueForBatch: '' },
        { field: 'Protections', displayValue: 'Protections', type: 'text', source: 'couch', valueForBatch: '' },
        { field: 'Interlocking', displayValue: 'Interlocking', type: 'text', source: 'couch', valueForBatch: '' },
        { field: 'Communication', displayValue: 'Communication', type: 'text', source: 'couch', valueForBatch: '' },
      ]
      if (proj) {
        this.chooseProjects([])
        this.fetchSapNetData(proj._id)
        this.fetchSapSimilarNets(proj._id)
        this.fetchMultipleNetsTasksInfo(proj.nets_keys)
        this.netsKeys = proj.nets_keys
        this.$nextTick(() => this.chooseProjects(proj))
      } else {
        this.netsKeys = []
        this.chooseProjects([])
      }
    },
    getLastInvoiceDate(invoiceDateObj) {
      if (!invoiceDateObj) return 
      const date = Object.values(invoiceDateObj).pop().substr(0, 10)
      return date
    },
    reloadData() {
      const isIn = this.pmProjects.filter(e => e['Project Definition'] === this.newData['Project Definition'])
      console.log(isIn[0])
      this.projChange(isIn[0])
      this.projChangedSnack = false
    },
    getText(e) {
      return `${e._id} - ${e['Network Description']}`
    },
    setDate(t, currentVal) {
      const regexp = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g
      if (t.target.value.match(regexp)) {
        return t.target.value
      } else {
        this.$forceUpdate()
      }
    },
    revertChanges() {
      const cnf = confirm('Do you really want to revert all changes?')
      if (cnf) this.projChange(this.chosenProjects[0])
    },
    save() {
      if (this.chosenProjects.length === 0) return

      // UPDATE SAP
      const projSapEditableFields = this.projectEditableFields.filter(e => e.source === 'sap')
      const netSapEditableFields = this.netEditableFields.filter(e => e.source === 'sap')

      let sapToUpdate = []
      for (let i = 0; i < this.nets.length; i++) {
        sapToUpdate.push({})
      }
      this.nets.forEach((e, idx) => {
        projSapEditableFields.forEach(x => {
          if (this.panes['first'][x.field] && x.type === 'date') {
            sapToUpdate[idx][x.field] = moment(this.panes['first'][x.field]).format().substr(0, 19)
          } else {
            sapToUpdate[idx][x.field] = this.panes['first'][x.field]
          }
        })
        this.netFixingFields.concat(netSapEditableFields).forEach(x => {
          if (this.nets[idx][x.field] && x.type === 'date' && this.nets[idx][x.field] !== this.pccData[idx][x.field]) {
            sapToUpdate[idx][x.field] = moment(this.nets[idx][x.field]).format().substr(0, 19)
          } else {
            sapToUpdate[idx][x.field] = this.nets[idx][x.field]
          }
        })
      })

      // UPDATE COUCH
      const projCouchEditableFields = this.projectEditableFields.filter(e => e.source === 'couch')
      const netCouchEditableFields = this.netEditableFields.filter(e => e.source === 'couch')

      let couchToUpdate = []
      for (let i = 0; i < this.nets.length; i++) {
        couchToUpdate.push({})
      }
      this.nets.forEach((e, idx) => {
        projCouchEditableFields.forEach(x => {
          couchToUpdate[idx][x.field] = this.panes['first'][x.field]
        })
        netCouchEditableFields.forEach(x => {
          couchToUpdate[idx][x.field] = this.nets[idx][x.field]
        })
      })
      console.log('To be sent to CouchDB: ', couchToUpdate)
      
      sapToUpdate.forEach((e, idx) => {
        netSapEditableFields.concat(projSapEditableFields).forEach(x => {
          if (!e[x.fixingField]) {
             delete e[x.field]
             delete e[x.fixingField]
          }
          if (this.pccData[idx][x.fixingField] === e[x.fixingField]) {
            delete e[x.fixingField]
            if (this.pccData[idx][x.field] === e[x.field]) {
              delete e[x.field]
            }
          }

          // if (e.hasOwnProperty('fixingField') && !e.fixingField) {
          //   delete e[x.fixingField]
          //   if (this.pccData[idx][x.field] === e[x.field]) delete e[x.field]
          //   else if (!e[x.field]) delete e[x.field]
          // } else {
          //   if (this.pccData[idx][x.field] === e[x.field]) delete e[x.field]
          //   else if (!e[x.field]) delete e[x.field]
          // }
        })
      })
      console.log('To be sent to PCC: ', sapToUpdate)
      this.changeProjectsData({
        netNums: this.netsKeys,
        data: couchToUpdate
      })
      this.modifyPccNetsData({
        netNums: this.netsKeys,
        data: sapToUpdate
      })
    },
    triggerFixingField(pane, field, batch, idx) {
      if (batch) {
        this.netEditableFields[idx].fixingFieldForBatch = !this.netEditableFields[idx].fixingFieldForBatch
        for (const net of this.nets) {
          net[field] = this.netEditableFields[idx].fixingFieldForBatch
        }
        this.$forceUpdate()
      } else {
        pane[field] = !pane[field]
        this.$forceUpdate()
      }
    },
    batchEditNetworks(t, field, fieldType) {
      if (fieldType === 'date' && typeof(t) === 'string') {
        for (const net of this.nets) {
          net[field] = t
        }
        return t
      } else if (fieldType === 'date') {
        const regexp = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g
        if (t.target.value.match(regexp)) {
          for (const net of this.nets) {
            net[field] = t.target.value
          }
          return t.target.value
        } else {
          this.$forceUpdate()
        }
      } else {
        for (const net of this.nets) {
          net[field] = fieldType === 'number' ? Number(t) : t
        }
        this.$forceUpdate()
      }
    }
  }
}
</script>

<style lang="scss">
  .paneArea .flex {
    display: flex;
    align-items: center;
  }

  .paneArea .v-text-field {
    margin: 0;
    padding: 0;
    .v-input__append-inner {
      margin-top: 0;
      .v-input__icon--append {
        height: 20px;
        i {
          font-size: 20px;
        }
      }
    }
    input {
      padding: 0;
    }
  }
  .fieldName {
    min-width: 200px;
    max-width: 200px!important;
    font-weight: bolder;
    padding-right: 8px;
    display: flex;
    align-items: center;
  }
  .highlightRow:hover {
    background-color: lightgrey;
  }
  #projectView div[role=tab] > div[role=button] {
    background-color: transparent;
  }
  #projectView div[role=tabpanel] {
    background-color: transparent;
  }
  #projectView .el-collapse-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.42);
    .el-collapse-item__content {
      padding-bottom: 0;
    }
  }
</style>
