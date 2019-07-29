<template>
  <v-layout row wrap id="detailTemplate" style="margin: 8px 36px 8px 8px;">
    <v-flex column xs5>
      <v-layout row wrap>
        <span class="subheading primary--text" style="margin-bottom: 0;">Detailed info 
          <v-btn title="Saves changes." icon flat @click="saveData" :disabled="invoicingReadOnly" style="margin-right: 0px;"><v-icon>save</v-icon></v-btn>
          <v-btn title="Adds new comment." icon flat @click="contextM($event, 'Network Num')" :disabled="invoicingReadOnly" style="margin: 6px 0px;"><v-icon>add</v-icon></v-btn>
          

          <v-dialog
            v-model="sapDataDialog"
            scrollable 
            :overlay="false"
            max-width="800px"
            transition="dialog-transition"
          >
            <template v-slot:activator="{ on }">
              <v-btn title="Gets current SAP data." v-on="on" @click="fetchSapNetData(templateData.data._id)" icon flat style="margin: 6px 0px;"><v-icon>data_usage</v-icon></v-btn>
            </template>

            <v-card>
              <v-card-title primary-title>
                SAP data
              </v-card-title>

              <v-card-text>
                <pre>
                  {{sapNetInfo}}
                </pre>
              </v-card-text>
            </v-card>
          </v-dialog>



        </span>
      </v-layout>

      <v-layout row wrap pt-2 :style="`display: block; max-height: ${detailHeight}px; overflow: auto;`">
        <v-layout row wrap v-for="v in invoicingDetailVisible" :key="v.value">
          <!-- ICONS -->
          <!-- <v-flex column style="width: 70px; max-width: 70px; min-width: 70px;">
            <v-layout row wrap justify-center align-center fill-height>
              <v-icon small v-for="(values, key) in templateData.data['sign'][v.value]" :key="key" @click="signInfo($event, values, key, v.value)"
                :color="getColor(key)" v-html="key">
              </v-icon>
            </v-layout>
          </v-flex> -->

          <!-- FIELDS -->
          <v-flex column xs6 md8 lg3 xs3 style="padding-right: 4px;"> <!-- @contextmenu="contextM($event, v.value)" -->
            <v-layout row wrap justify-end align-center fill-height>
              {{v.name}}
            </v-layout>
          </v-flex>

          <!-- VALUES -->
          <v-flex column grow>
            <!-- DATE TYPE -->
            <template v-if="v.dataType === 'date'">
              <el-date-picker
                size="mini"
                v-model="templateData.data[v.value]"
                type="date"
                :disabled="(!v.editable || invoicingReadOnly)"
                placeholder="Pick a day"
                format="dd.MM.yyyy"
                :firstDayOfWeek="1"
                style="width: 100%;"
                >
              </el-date-picker>
            </template>

            <!-- NUMBER TYPE -->
            <template v-else-if="v.dataType === 'number'">
              <div :class="`el-input el-input--mini ${(!v.editable || invoicingReadOnly) ? 'is-disabled' : ''}`">
                <vue-numeric
                v-model="templateData.data[v.value]"
                style="width: 100%; height: 28px; text-align: center;"
                class="el-input__inner"
                thousand-separator=" "
                decimal-separator=","
                :precision="0"
                :disabled="(!v.editable || invoicingReadOnly)"
              ></vue-numeric>
              </div>
            </template>

            <!-- INVOICE DATE -->
            <template v-else-if="v.dataType == 'special'">
              <el-date-picker
                size="mini"
                v-model="templateData.data[v.value][invoicingLastUpdate]"
                type="date"
                :disabled="(!v.editable || invoicingReadOnly)"
                placeholder="Pick a day"
                format="dd.MM.yyyy"
                :firstDayOfWeek="1"
                style="width: 100%;"
              >
              </el-date-picker>
            </template>

    
            <template v-else>
              <el-input
                :type="v.dataType"
                size="mini"
                prefix-icon="el-icon-edit"
                :disabled="(!v.editable || invoicingReadOnly)"
                v-model="templateData.data[v.value]"
                style="width: 100%;"  
              >
              </el-input>
            </template>
          </v-flex>

          <!-- FIXING -->
          <v-flex column xs2 md2 lg1 xl1>
            <v-layout row wrap justify-center align-center fill-height>
              <v-icon :disabled="(!v.editable || invoicingReadOnly)" @click="changeData(v.value)">{{templateData.data.fixedFields.includes(v.value) ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-layout>
    </v-flex>

    <v-flex column xs7>
      <v-layout row wrap>

        <v-tabs style="width: 100%;" v-model="activeTab">
          <v-tab>
            <v-badge right color="accent">
              <span slot="badge">{{ppesComments.length}}</span>
              <span><b>SAP</b></span>
            </v-badge>
          </v-tab>

          <v-tab
            v-for="sign in ['warning', 'info', 'arrow_upward', 'arrow_downward']"
            :key="sign"
          >
            <v-badge right color="accent">
              <span slot="badge">{{ templateData.data['sign'].hasOwnProperty('Network Num') && templateData.data.sign['Network Num'].hasOwnProperty(sign) ? templateData.data.sign['Network Num'][sign].length : '0' }}</span>
              <v-icon :color="sign === 'warning' ? 'error' : sign === 'info' ? 'info' : sign === 'arrow_upward' ? 'success' : 'warning'">{{sign}}</v-icon>
            </v-badge>
          </v-tab>

          <v-tabs-items>
            <v-tab-item>
              <v-layout column wrap
                :style="`display: block; max-height: ${detailHeight - 4}px; height: ${detailHeight - 4}px; overflow: auto; padding-top: 12px;`"
              >
                <v-flex row wrap v-for="(comment, index) in ppesComments" :key="index">
                  {{ comment }}
                </v-flex>
              </v-layout>
            </v-tab-item>

            <v-tab-item
              v-for="sign in ['warning', 'info', 'arrow_upward', 'arrow_downward']"
              :key="sign"
            >
              <v-layout column wrap v-if="templateData.data['sign'].hasOwnProperty('Network Num') && templateData.data.sign['Network Num'].hasOwnProperty(sign)" 
                :style="`display: block; max-height: ${detailHeight - 4}px; height: ${detailHeight - 4}px; overflow: auto; padding-top: 12px;`">
                
                <v-layout row wrap
                  v-for="(comment, i) in templateData.data.sign['Network Num'][sign]" :key="i"
                >
                  <v-flex column style="width: 40px; max-width: 40px; min-width: 40px;">
                    <v-menu offset-y style="margin-top: -3px;">
                      <v-icon small slot="activator" v-if="comment.owner === currentUserInfo.username || currentUserInfo.admin">edit</v-icon>
                      <v-list>
                        <v-list-tile class="iconMenu" v-for="sign2 in signOptions" :key="sign2">
                          <v-list-tile-title><v-icon @click="swapSigns(sign, sign2, comment, i)">{{sign2}}</v-icon></v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                    <v-icon small @click="removeSignComment(comment, i, sign)">delete</v-icon>
                  </v-flex>
                  <v-flex column style="width: 48px; max-width: 48px; min-width: 48px;">
                    {{comment.owner}}
                  </v-flex>
                  <v-flex column style="width: 148px; max-width: 148px; min-width: 148px;">
                    [{{comment.time}}]:
                  </v-flex>
                  <v-flex column style="width: calc(100% - 236px);">
                    <textarea rows="1" :value="comment.comment" 
                    style="font-size: 12px; height: 100%; width: 100%;  padding: 0px 2px;"
                    :disabled="comment.owner !== currentUserInfo.username && !currentUserInfo.admin"
                    @blur="saveIfChanged($event, comment, i)"
                    >
                    </textarea>
                  </v-flex>
                  </v-layout>
              </v-layout>
              <span v-else>No comments available for selected category on this network.</span>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>

      </v-layout>
    </v-flex>

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
            <v-textarea v-model="signComment" rows="1" placeholder="Comment" solo single-line hide-details @click:append="changeSign(false)" />
          </v-list-tile-action>
          <v-list-tile-action style="margin-left:1em; min-width: 0px;">
            <v-icon @click="changeSign(false)">send</v-icon>
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
      :close-on-content-click="false"
      transition="slide-y-transition"
      >
      <v-list style="padding: 0;" id="checkSignsList">
        <v-list-tile v-for="(comment, i) in signComments" :key="i" style="padding-right: 0px; padding-bottom: 4px;">
          <v-layout row wrap>
            <v-flex column style="width: 400px; min-width: 400px; max-width: 400px;">
              <v-flex row wrap style="border-bottom: 1px dashed gray;">{{comment.owner}} - {{comment.time}}</v-flex>
              <v-flex row wrap>
                <v-textarea rows="2" v-model="comment.comment" placeholder="Comment" solo single-line hide-details />
              </v-flex>
            </v-flex>
            <v-flex column style="width: 60px; min-width: 60px; max-width: 60px;">
              <v-flex row wrap>
                <v-icon>edit</v-icon>
                <v-icon @click="removeSignComment(comment, i)" color="error">delete</v-icon>
              </v-flex>
            </v-flex>
          </v-layout>
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

  #detailTemplate .el-input > input {
    color: black;
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
    padding-right: 2px;
  }
</style>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import username from 'username'
  import moment from 'moment'

  export default {
    async created() {
      // this.revisionsAvailable = await this.fetchProjectRevisions(this.templateData.key)
      if (this.userInfo.roles.includes('invoicingAdmin')) {
        this.currentUserInfo.admin = true
      }
      this.signOptions = this.userInfo.roles.includes('invoicingAdmin') ? ['warning', 'info', 'arrow_upward', 'arrow_downward'] : ['info', 'arrow_upward', 'arrow_downward']
    },
    data: function () {
      return {
        currentPosition: {left: 0, top: 0},
        currentField: null,
        showMenu: false,
        showSignInfo: false,
        signComments: [],
        currentSign: '',
        selectedSign: 'info',
        signComment: '',
        signOptions: [],
        currentUserInfo: {
          admin: false,
          username: username.sync().toLowerCase()
        },
        activeTab: null,
        sapDataDialog: false
      }
    },
    props: ['templateData'],
    computed: {
      ...mapGetters(['invoicingLastUpdate', 'invoicingCompareDate', 'userInfo', 'invoicingDetail', 'invoicingReadOnly', 'sapNetInfo', 'invoicingDetailVisible']),
      ppesComments() {
        return this.templateData.data['Network Note'].split('|')
      },
      detailHeight() {
        return this.invoicingDetail.filter(e => e.visible).length * 32
      }
    },
    methods: {
      ...mapActions(['fetchProjectRevisions', 'getRevisionInfo', 'changeProjectData', 'notify', 'fetchSapNetData']),
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
        // this.$root.$emit('refresh-formatting')
        this.changeProjectData(this.$props.templateData.data)
      },
      contextM (e, field) {
        e.preventDefault()
        if (field !== 'Network Num' || this.invoicingReadOnly) {
          return
        }
        this.showMenu = false
        this.currentPosition['left'] = e.clientX
        this.currentPosition['top'] = e.clientY
        this.currentField = field
        this.signComment = ''

        this.showMenu = true
      },
      changeSign (preTime, preOwner) {
        const sign = this.selectedSign
        let time = preTime || moment().format('ddd DD.MM.YYYY HH:mm')
        const owner = preOwner || username.sync().toLowerCase()

        if (this.$props.templateData.data.sign.hasOwnProperty(this.currentField)) {
          // let iconExists = this.$props.templateData.data.sign[this.currentField].find(e => e.startsWith(sign))
          
          let iconExists = Object.keys(this.$props.templateData.data.sign[this.currentField]).includes(sign)
          if (iconExists) {
            this.$props.templateData.data.sign[this.currentField][sign].push({
              comment: this.signComment,
              owner: owner,
              time: time
            })
            // const ix = this.$props.templateData.data.sign[this.currentField].indexOf(iconExists)
            // iconExists = iconExists + ' - ' + this.signComment
            // this.$props.templateData.data.sign[this.currentField][ix] = iconExists
            // this.$props.templateData.data.sign[this.currentField].sort()
          } else {
            this.$props.templateData.data.sign[this.currentField] = Object.assign({}, this.$props.templateData.data.sign[[this.currentField]], {
              [sign]: [{
                comment: this.signComment,
                owner: owner,
                time: time
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
                owner: owner,
                time: time
              }
            ]
          }})


          // this.$props.templateData.data.sign = Object.assign({}, this.$props.templateData.data.sign, {[this.currentField]: [sign+' - ' + this.signComment]})
        }

        this.saveData()
        this.showMenu = false
      },
      signInfo (e, values, key, field) {
        e.preventDefault()
        this.showSignInfo = false
        this.currentPosition['left'] = e.clientX
        this.currentPosition['top'] = e.clientY
        this.currentField = field

        this.currentSign = key
        this.signComments = values.sort((c1, c2) => (c1.time > c2.time) ? -1 : 1)
        this.showSignInfo = true
      },
      removeSignComment (comment, idx, sign) {
        if (((comment.owner !== username.sync().toLowerCase()) && (!this.userInfo['roles'].includes('invoicingAdmin'))) || this.invoicingReadOnly) {
          return 
        }
        
        // let remainingSignComments = this.$props.templateData.data.sign[this.currentField][this.currentSign]
        let remainingSignComments = this.$props.templateData.data.sign['Network Num'][sign]
        
        if (remainingSignComments.length !== 1) {
          // this.$props.templateData.data.sign['Network Num'][sign].splice(remainingSignComments.length - 1 - idx, 1)
          this.$props.templateData.data.sign['Network Num'][sign].splice(idx, 1)
        } else {
          this.$delete(this.$props.templateData.data.sign['Network Num'], sign)
        }
      },
      getColor(icon) {
        if (icon === 'arrow_upward') {
          return 'success'
        } else if (icon === 'arrow_downward') {
          return 'warning'
        } else if (icon === 'warning') {
          return 'error'
        } else {
          return 'info'
        }
      },
      swapSigns(currentSign, newSign, comment, i) {
        if (currentSign === newSign) return

        this.selectedSign = newSign
        this.currentField = 'Network Num'
        this.signComment = comment.comment

        this.removeSignComment(comment, i, currentSign)
        this.changeSign(comment.time, comment.owner)
      },
      saveIfChanged(e, c, idx) {
        if (e.target.value !== c.comment) {
          if ((c.owner !== username.sync().toLowerCase()) &&  (!this.userInfo['roles'].includes('invoicingAdmin'))) {
            e.target.value = c.comment
            this.notify({
              text: 'You cannot modify someone else\'s comment',
              state: true,
              color: 'error',
              timeout: 3000
            })
          }

          c.time = moment().format('ddd DD.MM.YYYY HH:mm')
          c.comment = e.target.value
          c.owner = username.sync().toLowerCase()
          this.saveData()
        }
      }
    }
  }
</script>
