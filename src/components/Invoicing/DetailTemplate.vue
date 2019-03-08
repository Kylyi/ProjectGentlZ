<template>
  <v-layout row wrap style="margin:10px;">

    <v-flex column xs12 wrap>
      <v-flex row wrap xs1><h4 class="subtit2">Detailed info</h4></v-flex>
      <v-flex row wrapx>You can modify detailed info in settings.</v-flex>
    </v-flex>

    <v-divider></v-divider>
    
    <v-layout row wrap>
      <!-- LEFT SIDE -->
      <v-flex column xs6 mt-2 style="border-right: 1px solid darkgray;" id="netDetail">

        <v-layout align-end row>
          <v-flex wrap column offset-xs3 xs4><b>Current version</b></v-flex>
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
          <!-- INV DATE -->
          <v-flex column xs3 style="display: grid;" v-if="v.value === 'inv_date'">
            <v-layout row align-center @contextmenu="contextM($event, `inv_date[${lastUpdate}]`)">
              <v-flex column xs2>
                  <v-icon small v-for="(values,key) in templateData.data['sign'][`inv_date[${lastUpdate}]`]" :key="key" @click="signInfo($event, values, key, `inv_date[${lastUpdate}]`)"
                  :color="key === 'check' ? 'success' : key === 'info' ? 'info' : 'error'" v-html="key"></v-icon>
              </v-flex>
              <v-flex column xs10 text-xs-right style="padding-right: 8px;">{{v.name}}:</v-flex>
            </v-layout>
          </v-flex>

          <!-- NOT INV DATE -->
          <v-flex column xs3 style="display: grid;" v-else>
            <v-layout row align-center @contextmenu="contextM($event, v.value)">
              <v-flex column xs2>
                  <v-icon small v-for="(values, key) in templateData.data['sign'][v.value]" :key="key" @click="signInfo($event, values, key, v.value)"
                  :color="key === 'check' ? 'success' : key === 'info' ? 'info' : 'error'" v-html="key"></v-icon>
              </v-flex>
              <v-flex column xs10 text-xs-right style="padding-right: 8px;">{{v.name}}:</v-flex>
            </v-layout>
          </v-flex>

          <!-- CURRENT VERSION VALUES -->
          <v-flex column xs4 v-if="!Array.isArray(templateData.data[v.value])">

            <!-- DATE FIELDS -->
            <v-layout v-if="v.dataType === 'date'">
              <v-flex style="width:100%;">
                <el-date-picker
                  size="mini"
                  v-model="templateData.data[v.value]"
                  type="date"
                  :disabled="!v.editable"
                  placeholder="Pick a day"
                  format="dd.MM.yyyy"
                  :firstDayOfWeek="1">
                </el-date-picker>
              </v-flex>
              <v-flex>
                <v-icon :disabled="!v.editable" @click="changeData(v.value)">{{templateData.data.fixedFields.includes(v.value) ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
              </v-flex>
            </v-layout>

            <!-- SPECIAL FIELDS (INVOICE DATE) -->
            <v-layout v-else-if="v.dataType === 'special'">
              <v-flex style="width:100%;">
                <el-date-picker
                  size="mini"
                  v-model="templateData.data[v.value][lastUpdate]"
                  type="date"
                  :disabled="!v.editable"
                  placeholder="Pick a day"
                  format="dd.MM.yyyy"
                  :firstDayOfWeek="1">
                </el-date-picker>
              </v-flex>
              <v-flex>
                <v-icon :disabled="!v.editable" @click="changeData(v.value)">{{templateData.data.fixedFields.includes(v.value) ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
              </v-flex>
            </v-layout>

            <!-- NON-DATE FIELDS -->
            <v-layout v-else>
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
                <v-icon :disabled="!v.editable" @click="changeData(v.value)">{{templateData.data.fixedFields.includes(v.value) ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
              </v-flex>
            </v-layout>
          </v-flex>

          <!-- REVISION VALUES -->
          <v-flex column xs4 v-if="oldDoc">

            <!-- DATE FIELDS -->
            <v-layout v-if="v.dataType === 'date'">
              <v-flex style="width:100%;">
                <el-date-picker
                  size="mini"
                  v-model="oldDoc[v.value]"
                  type="date"
                  :disabled="!v.editable"
                  placeholder="Pick a day"
                  format="dd.MM.yyyy">
                </el-date-picker>
              </v-flex>
            </v-layout>

            <!-- SPECIAL FIELDS (INVOICE DATE) -->
            <v-layout v-else-if="v.dataType === 'special'">
              <v-flex style="width:100%;">
                <el-date-picker
                  size="mini"
                  v-model="oldDoc[v.value][selectedDate]"
                  type="date"
                  :disabled="!v.editable"
                  placeholder="Pick a day"
                  format="dd.MM.yyyy">
                </el-date-picker>
              </v-flex>
            </v-layout>

            <!-- NON-DATE FIELDS -->
            <v-layout v-else>
              <v-flex style="width:100%;">
                <el-input
                  :type="v.dataType"
                  size="mini"
                  prefix-icon="el-icon-edit"
                  :disabled="!v.editable"
                  v-model="oldDoc[v.value]">
                </el-input>
              </v-flex>
            </v-layout>

          </v-flex>
        </v-layout>        
      </v-flex>


      <!-- RIGHT SIDE -->
      <v-flex column xs6 mt-2>
        <v-layout row wrap><v-btn icon flat @click="saveData"><v-icon>save</v-icon></v-btn></v-layout>
        <v-layout row wrap pl-2 pr-2>

          <v-expansion-panel>
            <v-expansion-panel-content :disabled="hiddenFieldsCount === 0">
              <div slot="header">Hidden fields with attention</div>
              <v-icon slot="actions" :color="hiddenFieldsCount > 0 ? 'error' : 'success'">{{hiddenFieldsCount > 0 ? 'error' : 'check'}}</v-icon>

              <v-card>
                <v-card-text>
                  <tr>
                    <template v-for="v in hiddenColumns">
                      <td :key="v.value" style="padding-right:4px;">{{v.name}}</td>
                    </template>
                  </tr>
                </v-card-text>
              </v-card> 

            </v-expansion-panel-content>
          </v-expansion-panel>

        </v-layout>
      </v-flex>
    </v-layout>

    <!-- MENU FOR ASSIGNING SIGNS -->
    <v-menu
      v-model="showMenu"
      :position-x="currentPosition.left"
      :position-y="currentPosition.top"
      absolute
      offset-y
      transition="slide-y-transition"
      :close-on-content-click="false"
      >
      <v-list style="padding: 0;" id="signsMenuList">
        <v-list-tile style="height: fit-content;">
          <v-list-tile-action>
            <v-select
              solo
              hide-details
              style="width: 60px; padding-right:5px;"
              v-model="selectedSign"
              :items="signOptions"
            >
              <template slot="item" slot-scope="data"><v-icon>{{data.item}}</v-icon></template>
              <template slot="selection" slot-scope="data"><v-icon>{{data.item}}</v-icon></template>
            </v-select>
          </v-list-tile-action>
          <v-list-tile-action style="width: 250px;">
            <v-textarea v-model="signComment" rows="1" placeholder="Comment" solo single-line hide-details @click:append="changeSign" />
          </v-list-tile-action>
          <v-list-tile-action style="margin-left:1em; min-width: 0px;">
            <v-icon @click="changeSign">send</v-icon>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-menu>

    <!-- CHECK SIGN COMMENTS -->
    <v-menu
      v-model="showSignInfo"
      :position-x="currentPosition.left"
      :position-y="currentPosition.top"
      absolute
      offset-y
      transition="slide-y-transition"
    >
      <v-list style="padding: 0;" id="checkSignsList">
        <v-list-tile v-for="comment in signComments" :key="comment.comment">
          <v-list-tile-action>
            <tr style="vertical-align: middle;">
              <td style="width: 250px; word-break: break-word;"><span style="color: gray;">{{comment.owner}}: </span>{{comment.comment}}</td>
              <td><v-icon style="vertical-align: middle;" @click="removeSignComment(comment)" color="error">close</v-icon></td>
            </tr>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-menu>

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

  #signsMenuList .v-input__control {
    min-height: 0px;
  }

  #signsMenuList input {
    padding: 0px;
  }

  #signsMenuList .v-input__slot{
    box-shadow: none;
    padding: 0;
  }

  #signsMenuList textarea {
    margin-top: 0;
  }

  #signsMenuList .v-input__append-outer {
    margin-top: 4px;
  }

  #signsMenuList > div > div {
    height: fit-content;
    padding-right: 0;
  }

  #checkSignsList > div > div {
    height: fit-content;
  }
</style>

<script>
  import {readFile} from '../../main/scripts/misc'
  import db from '../../main/scripts/database'
  const path = require('path')
  const isDev = require('electron-is-dev')
  const {remote} = require('electron')

  export default {
    data: function () {
      return {
        detailInfo: isDev ? JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'invoicingDetails.json'), 'utf-8')) : JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingDetails.json'), 'utf-8')),
        allColumns: isDev ? JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'invoicingColumns.json'), 'utf-8')) : JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'invoicingColumns.json'), 'utf-8')),
        revisionsAvailable: [],
        selectedRevision: null,
        oldDoc: null,
        currentPosition: {left: 0, top: 0},
        currentField: null,
        showMenu: false,
        showSignInfo: false,
        signComments: [],
        currentSign: '',
        selectedSign: 'info',
        signComment: '',
        hiddenFieldsCount: 0,
        signOptions: remote.getGlobal('user')['roles'].includes('invoicingAdmin') ? ['warning', 'info', 'check'] : ['info', 'check']
      }
    },
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
    computed: {
      lastUpdate: {
        get: function () {
          return this.$parent.$parent.$parent.lastUpdate
        }
      },
      selectedDate: {
        get: function () {
          return this.$parent.$parent.$parent.SELECTEDDATE
        }
      },
      hiddenColumns: {
        get: function () {
          this.allColumns.push({dataType: 'date', editable: false, name: 'Invoice date', value: `inv_date`, visible: true})
          const hiddenC = this.allColumns.filter(e => {
            const isInDetail = this.detailInfo.filter(x => e.value === x.value)

            return isInDetail.length < 1
          })
          const hiddenCols =  hiddenC.filter(e => {
            return (this.$props.templateData.data.sign.hasOwnProperty(e.value) && this.$props.templateData.data.sign[e.value].length > 0)
          })

          this.hiddenFieldsCount = hiddenCols.length
          return hiddenCols
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
      },
      contextM (e, field) {
        e.preventDefault()
        this.showMenu = false
        this.currentPosition['left'] = e.clientX
        this.currentPosition['top'] = e.clientY
        this.currentField = field
        this.signComment = ''

        this.$nextTick(() => {
          this.showMenu = true
        })
      },
      changeSign () {
        const sign = this.selectedSign
        if (this.$props.templateData.data.sign.hasOwnProperty(this.currentField)) {
          // let iconExists = this.$props.templateData.data.sign[this.currentField].find(e => e.startsWith(sign))
          
          let iconExists = Object.keys(this.$props.templateData.data.sign[this.currentField]).includes(sign)
          if (iconExists) {
            this.$props.templateData.data.sign[this.currentField][sign].push({
              comment: this.signComment,
              owner: remote.getGlobal('user')['_id']
            })
            // const ix = this.$props.templateData.data.sign[this.currentField].indexOf(iconExists)
            // iconExists = iconExists + ' - ' + this.signComment
            // this.$props.templateData.data.sign[this.currentField][ix] = iconExists
            // this.$props.templateData.data.sign[this.currentField].sort()
          } else {
            this.$props.templateData.data.sign[this.currentField] = Object.assign({}, this.$props.templateData.data.sign[[this.currentField]], {
              [sign]: [{
                comment: this.signComment,
                owner: remote.getGlobal('user')['_id']
              }]
            })
            // this.$props.templateData.data.sign[this.currentField].push(sign+' - ' + this.signComment)
            // this.$props.templateData.data.sign[this.currentField].sort()
          }
        } else {
          this.$props.templateData.data.sign = Object.assign({}, this.$props.templateData.data.sign, {[this.currentField]: {
            [sign]: [
              {
                comment: this.signComment,
                owner: remote.getGlobal('user')['_id']
              }
            ]
          }})


          // this.$props.templateData.data.sign = Object.assign({}, this.$props.templateData.data.sign, {[this.currentField]: [sign+' - ' + this.signComment]})
        }

        this.$nextTick(() => {
          this.showMenu = false
        })
      },
      signInfo (e, values, key, field) {
        e.preventDefault()
        this.showSignInfo = false
        this.currentPosition['left'] = e.clientX
        this.currentPosition['top'] = e.clientY
        this.currentField = field
        // let signComments = values

        this.currentSign = key
        this.signComments = values

        this.$nextTick(() => {
          this.showSignInfo = true
        })
      },
      removeSignComment (comment) {
        if ((comment.owner !== remote.getGlobal('user')['_id']) && (!remote.getGlobal('user')['roles'].includes('invoicingAdmin'))) {
          return 
        }

        let remainingSignComments = this.$props.templateData.data.sign[this.currentField][this.currentSign]
        remainingSignComments = remainingSignComments.filter(e => e !== comment)

        if (remainingSignComments.length > 0) {
          this.$props.templateData.data.sign[this.currentField][this.currentSign] = remainingSignComments
        } else {
          delete this.$props.templateData.data.sign[this.currentField][this.currentSign]

        }

        // const iconExists = this.$props.templateData.data.sign[this.currentField].find(e => e.startsWith(this.currentSign))
        // const ix = this.$props.templateData.data.sign[this.currentField].indexOf(iconExists)

        // if (this.signComments.length === 1) {
        //   this.$props.templateData.data.sign[this.currentField].splice(ix, 1)
        // } else {
        //   const x = this.$props.templateData.data.sign[this.currentField][ix].replace(' -'+comment, '')
        //   this.$props.templateData.data.sign[this.currentField][ix] = x
        // }
      }
    }
  }
</script>
