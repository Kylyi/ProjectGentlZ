<template>
  <v-layout id="detailTemplate" column wrap style="margin: 10px;">
    <v-layout row wrap>
      <p class="subheading primary--text" style="margin-bottom: 0;">Detailed info <v-btn icon flat @click="saveData"><v-icon>save</v-icon></v-btn></p>
    </v-layout>

    <v-divider></v-divider>
    
    <v-layout row wrap pt-2>
      <v-flex column grow>
        <v-layout row wrap>
          <v-flex column xs5>
            <v-layout row wrap v-for="v in invoicingDetail" :key="v.value">
              <!-- ICONS -->
              <v-flex column style="width: 70px; max-width: 70px; min-width: 70px;">
                <v-layout row wrap justify-center align-center fill-height>
                  <v-icon small v-for="(values, key) in templateData.data['sign'][v.value]" :key="key" @click="signInfo($event, values, key, v.value)"
                    :color="getColor(key)" v-html="key">
                  </v-icon>
                </v-layout>
              </v-flex>

              <!-- FIELDS -->
              <v-flex column xs6 md8 lg3 xs3 @contextmenu="contextM($event, v.value)" style="padding-right: 4px;">
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
                    :disabled="!v.editable"
                    placeholder="Pick a day"
                    format="dd.MM.yyyy"
                    :firstDayOfWeek="1"
                    style="width: 100%;"
                    >
                  </el-date-picker>
                </template>

                <!-- NUMBER TYPE -->
                <template v-else-if="v.dataType === 'number'">
                  <div :class="`el-input el-input--mini ${!v.editable ? 'is-disabled' : ''}`">
                    <vue-numeric
                    v-model="templateData.data[v.value]"
                    style="width: 100%; height: 28px; text-align: center;"
                    class="el-input__inner"
                    thousand-separator=" "
                    decimal-separator=","
                    :precision="0"
                    :disabled="!v.editable"
                  ></vue-numeric>
                  </div>
                </template>

                <!-- INVOICE DATE -->
                <template v-else-if="v.dataType == 'special'">
                  <el-date-picker
                    size="mini"
                    v-model="templateData.data[v.value][invoicingLastUpdate]"
                    type="date"
                    :disabled="!v.editable"
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
                    :disabled="!v.editable"
                    v-model="templateData.data[v.value]"
                    style="width: 100%;"  
                  >
                  </el-input>
                </template>
              </v-flex>

              <!-- FIXING -->
              <v-flex column xs2 md2 lg1 xl1>
                <v-layout row wrap justify-center align-center fill-height>
                  <v-icon :disabled="!v.editable" @click="changeData(v.value)">{{templateData.data.fixedFields.includes(v.value) ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
                </v-layout>
              </v-flex>
            </v-layout>
            
          </v-flex>

          <v-flex column xs7>
            <table :style="`display: block; max-height: ${invoicingDetail.length * 28}px; overflow: auto;`">
              <tbody>
                <tr v-for="(comment, index) in ppesComments" :key="index">
                  <td>{{comment}}</td>
                </tr>
              </tbody>
            </table>
          </v-flex>
        </v-layout>
      </v-flex>

      <!-- RIGHT SIDE -->
      <!-- <v-flex column shrink pl-3>
        <v-layout row wrap><v-btn icon flat @click="saveData"><v-icon>save</v-icon></v-btn></v-layout>
        <v-layout row wrap pl-2 pr-2>

        </v-layout>
      </v-flex> -->
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
        <v-list-tile v-for="(comment, i) in reversedSignComments" :key="comment.comment">
          <v-list-tile-action>
            <tr style="vertical-align: middle;">
              <td style="width: 400px; word-break: break-word; border-bottom: 1px dashed gray;"><span style="color: black;">{{comment.owner}} - {{comment.time}}</span></td>
              <td><v-icon style="vertical-align: middle;" @click="removeSignComment(comment, i)" color="error">delete</v-icon></td>
            </tr>
            <tr>
              <td style="width: 400px; word-break: break-word;">
                {{comment.comment}}
              </td>
              <td width="24px;">

              </td>
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
  }
</style>

<script>
  import {readFile} from '../../main/scripts/misc'
  import { mapGetters, mapActions } from 'vuex'
  import username from 'username'
  import { DxNumberBox } from 'devextreme-vue';

  export default {
    async created() {
      // this.revisionsAvailable = await this.fetchProjectRevisions(this.templateData.key)
      this.signOptions = this.userInfo.roles.includes('invoicingAdmin') ? ['warning', 'info', 'arrow_upward', 'arrow_downward'] : ['info', 'arrow_upward', 'arrow_downward']
    },
    components: {
      DxNumberBox
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
        signOptions: []
      }
    },
    props: ['templateData'],
    computed: {
      ...mapGetters(['invoicingLastUpdate', 'invoicingCompareDate', 'userInfo', 'invoicingDetail']),
      reversedSignComments() {
        const reversed = this.signComments.reverse()
        return reversed
      },
      ppesComments() {
        return this.templateData.data['Network Note'].split('|')
      }
    },
    methods: {
      ...mapActions(['fetchProjectRevisions', 'getRevisionInfo', 'changeProjectData']),
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
        this.changeProjectData(this.$props.templateData.data)
      },
      contextM (e, field) {
        e.preventDefault()
        if (field !== 'Network Num') {
          return
        }
        this.showMenu = false
        this.currentPosition['left'] = e.clientX
        this.currentPosition['top'] = e.clientY
        this.currentField = field
        this.signComment = ''

        this.showMenu = true
      },
      changeSign () {
        const sign = this.selectedSign
        const time = new Date()

        if (this.$props.templateData.data.sign.hasOwnProperty(this.currentField)) {
          // let iconExists = this.$props.templateData.data.sign[this.currentField].find(e => e.startsWith(sign))
          
          let iconExists = Object.keys(this.$props.templateData.data.sign[this.currentField]).includes(sign)
          if (iconExists) {
            this.$props.templateData.data.sign[this.currentField][sign].push({
              comment: this.signComment,
              owner: username.sync().toLowerCase(),
              time: time.toUTCString()
            })
            // const ix = this.$props.templateData.data.sign[this.currentField].indexOf(iconExists)
            // iconExists = iconExists + ' - ' + this.signComment
            // this.$props.templateData.data.sign[this.currentField][ix] = iconExists
            // this.$props.templateData.data.sign[this.currentField].sort()
          } else {
            this.$props.templateData.data.sign[this.currentField] = Object.assign({}, this.$props.templateData.data.sign[[this.currentField]], {
              [sign]: [{
                comment: this.signComment,
                owner: username.sync().toLowerCase(),
                time: time.toUTCString()
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
                owner: username.sync().toLowerCase(),
                time: time.toUTCString()
              }
            ]
          }})


          // this.$props.templateData.data.sign = Object.assign({}, this.$props.templateData.data.sign, {[this.currentField]: [sign+' - ' + this.signComment]})
        }

        this.showMenu = false
      },
      signInfo (e, values, key, field) {
        e.preventDefault()
        this.showSignInfo = false
        this.currentPosition['left'] = e.clientX
        this.currentPosition['top'] = e.clientY
        this.currentField = field

        this.currentSign = key
        this.signComments = JSON.parse(JSON.stringify(values))

        this.showSignInfo = true
      },
      removeSignComment (comment, idx) {
        if ((comment.owner !== username.sync().toLowerCase()) && (!this.userInfo['roles'].includes('invoicingAdmin'))) {
          return 
        }

        let remainingSignComments = this.$props.templateData.data.sign[this.currentField][this.currentSign]
        
        if (remainingSignComments.length !== 1) {
          this.$props.templateData.data.sign[this.currentField][this.currentSign].splice(remainingSignComments.length - 1 - idx, 1)
        } else {
          this.$delete(this.$props.templateData.data.sign[this.currentField], [this.currentSign])
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
      }
    }
  }
</script>
