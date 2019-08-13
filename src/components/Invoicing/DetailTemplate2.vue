<template>
  <v-layout row class="detailTemplate2" style="padding: 4px 0px;">
    <v-flex column xs5 pr-2 style="max-height: 171px; overflow: auto;">
      <v-layout row wrap style="background: white; display: inline-flex; width: 100%;">
        <v-flex column grow><span class="subheading primary--text" style="margin-bottom: 0; height: 48px; display: flex; align-items: center; padding-left: 4px;"><b>Detailed info</b> </span></v-flex>
        <v-flex column shrink>
          <v-btn title="Saves changes." icon flat @click="saveData(true)" :disabled="invoicingReadOnly" style="margin-right: 0px;"><v-icon>save</v-icon></v-btn>
        </v-flex>
      </v-layout>

      <v-layout row wrap v-for="(field, idx) in invoicingDetailVisible" :key="idx" class="highlightRow">
        <v-flex column shrink style="min-width: 120px; padding-left: 4px;" class="fieldName2"> <span>{{ field.name }}</span> </v-flex>

        <v-flex column grow>
          <v-layout row wrap>
            <v-flex column grow>
              <template v-if="field.dataType === 'date'">
                <v-menu
                  offset-y
                  min-width="290px"
                  max-width="290px"
                  v-if="field.editable === true"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="netData[field.value]"
                      @blur="netData[field.value] = setDate($event, netData[field.value])"
                      @keydown.enter="netData[field.value] = setDate($event, netData[field.value])"
                      v-on="on"
                      hide-details
                      mask="####-##-##"
                      placeholder="YYYY-MM-DD"
                      :return-masked-value="true"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="netData[field.value]" first-day-of-week="1"></v-date-picker>
                </v-menu>
                <template v-else>
                  <v-text-field
                    v-model="netData[field.value]"
                    :type="field.dataType"
                    :readonly="(!field.editable || invoicingReadOnly)"
                    style="width: 100%;"
                    hide-details
                  ></v-text-field>
                </template>
              </template>

              <template v-else-if="field.dataType === 'number'">
                <vue-numeric
                  v-model="netData[field.value]"
                  class="myNumeric"
                  read-only-class="myNumeric notAllowed"
                  thousand-separator=" "
                  decimal-separator=","
                  :precision="0"
                  :read-only="(!field.editable || invoicingReadOnly)"
                ></vue-numeric>
              </template>

              <template v-else>
                <v-text-field
                  v-model="netData[field.value]"
                  :type="field.dataType"
                  :readonly="(!field.editable || invoicingReadOnly)"
                  style="width: 100%;"
                  hide-details
                ></v-text-field>
              </template>

            </v-flex>
            <v-flex column shrink style="display: flex; align-items: center;">
              <v-icon v-if="field.hasOwnProperty('couchFieldIfFixed')" @click="fixField(field)" :disabled="(!field.editable || invoicingReadOnly)">{{netData[[field.couchFieldIfFixed]] ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>

              <v-icon v-else @click="fixField(field.value)" :disabled="(!field.editable || invoicingReadOnly)">{{netData.fixedFields.includes(field.value) ? 'radio_button_checked' : 'radio_button_unchecked'}}</v-icon>
            </v-flex>
          </v-layout>
        </v-flex>

      </v-layout>
    </v-flex>

    <v-divider vertical></v-divider>

    <v-flex id="detailTemplateRightSide" column xs7 pl-2 class="rightSideDetail" style="max-height: 171px; overflow: auto;">
      <v-layout row wrap>
        <v-tabs style="width: 100%;">
          <v-tab>
            <v-badge right color="accent">
              <span style="font-size: 11px;" slot="badge">{{ppesComments.length}}</span>
              <span><b>SAP</b></span>
            </v-badge>
          </v-tab>

          <v-tab
            v-for="sign in ['warning', 'info', 'arrow_upward', 'arrow_downward']"
            :key="sign"
          >
            <div class="text-xs-center" style="padding: 0 4px;">
              <v-badge right color="accent">
                <span slot="badge" style="font-size: 11px;" >{{ netData['sign'].hasOwnProperty('Network Num') && netData.sign['Network Num'].hasOwnProperty(sign) ? netData.sign['Network Num'][sign].length : '0' }}</span>
                <v-icon :color="sign === 'warning' ? 'error' : sign === 'info' ? 'info' : sign === 'arrow_upward' ? 'success' : 'warning'">{{sign}}</v-icon>
              </v-badge>
            </div>
          </v-tab>

          <v-tabs-items>
            <v-tab-item>
              <v-layout column wrap
                style="display: block; overflow: auto; max-height: 110px; padding-top: 4px;"
              >
                <v-flex row><v-btn small @click="$refs.sapComment.sapCommentDialog = true" block color="primary" outline>New comment</v-btn></v-flex>
                <v-flex row wrap v-for="(comment, index) in ppesComments" :key="index">
                  {{ comment }}
                </v-flex>
              </v-layout>
            </v-tab-item>

            <v-tab-item
              v-for="sign in ['warning', 'info', 'arrow_upward', 'arrow_downward']"
              :key="sign"
            >
              <v-layout column wrap v-if="netData['sign'].hasOwnProperty('Network Num') && netData.sign['Network Num'].hasOwnProperty(sign)" 
                style="display: block; overflow: auto; padding-top: 4px;">
                
                <v-layout row wrap
                  v-for="(comment, i) in netData.sign['Network Num'][sign]" :key="i"
                >
                  <v-flex column style="width: 40px; max-width: 40px; min-width: 40px;">
                    <v-menu offset-y style="margin-top: -3px;">
                      <v-icon small slot="activator" v-if="comment.owner === userInfo._id || userInfo.roles.includes('invoicingAdmin')">{{sign}}</v-icon>
                      <v-list>
                        <v-list-tile class="iconMenu" v-for="sign2 in signOptions" :key="sign2">
                          <v-list-tile-title><v-icon @click="swapSigns(sign, sign2, comment, i)">{{sign2}}</v-icon></v-list-tile-title>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                    <v-icon v-if="comment.owner === userInfo._id || userInfo.roles.includes('invoicingAdmin')" small @click="removeSignComment(comment, i, sign)">delete</v-icon>
                  </v-flex>
                  <v-flex column style="width: 64px; max-width: 64px; min-width: 64px;">
                    {{comment.owner}}
                  </v-flex>
                  <v-flex column style="width: 160px; max-width: 160px; min-width: 160x;">
                    [{{comment.time}}]:
                  </v-flex>
                  <v-flex column shrink v-if="sign === 'warning'">
                    <v-select
                      v-model="comment.faultOrigin"
                      @change="saveIfChanged($event, comment, i)"
                      hide-details
                      :items="['Ready & Waiting', 'ABB fault', 'Customer fault']"
                      style="max-width: 144px;"
                    ></v-select>
                  </v-flex>
                  <v-flex column pl-1>                    
                    <v-textarea
                      rows="1" hide-details
                      :value="comment.comment"
                      style="font-size: 12px;"
                      :disabled="userInfo.roles.includes('invoicingAdmin') ? false : (comment.owner === userInfo._id) ? false : true"
                      @blur="saveIfChanged($event, comment, i)"
                    ></v-textarea>
                  </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-btn block color="primary" outline @click="addSignComment(sign)">New comment</v-btn>
                  </v-layout>
              </v-layout>
              <v-layout column wrap v-else style="padding-top: 4px;">
                <v-flex row>No comments available for selected category on this network.</v-flex>
                <v-flex row><v-btn small @click="addSignComment(sign)" block color="primary" outline>New comment</v-btn></v-flex>
              </v-layout>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>

      </v-layout>
    </v-flex>
    
    <sap-comment ref="sapComment" :netNum="netData._id" />

  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import moment from 'moment'
import SapComment from './DetailTemplate/SapComment'
export default {
  name: 'DetailTemplate2',
  components: {
    SapComment
  },
  props: ['netData'],
  created() {
    this.signOptions = this.userInfo.roles.includes('invoicingAdmin') ? ['warning', 'info', 'arrow_upward', 'arrow_downward'] : ['info', 'arrow_upward', 'arrow_downward']
  },
  computed: {
    ...mapGetters(['invoicingDetailVisible', 'invoicingReadOnly', 'userInfo']),
    ppesComments() {
      return this.netData['Network Note'].split('|')
    },
  },
  methods: {
    ...mapActions(['notify', 'changeProjectData', 'modifyPccNetsData', 'fetchSapNetsData']),
    fixField(e) {
      if (typeof(e) === 'object') {
        this.netData[e.couchFieldIfFixed] = !this.netData[e.couchFieldIfFixed]
        return
      }

      const fixedFields = this.netData.fixedFields
      if (fixedFields.includes(e)) {
        const ix = fixedFields.indexOf(e)
        fixedFields.splice(ix, 1)
      } else {
        fixedFields.push(e)
      }
    },
    removeSignComment (comment, idx, sign, cnf, save = true) {
      cnf = cnf || confirm('Do you really want to delete this comment?')

      if (cnf) {
        let remainingSignComments = this.netData.sign['Network Num'][sign]
        if (remainingSignComments.length !== 1) {
          this.netData.sign['Network Num'][sign].splice(idx, 1)
        } else {
          this.$delete(this.netData.sign['Network Num'], sign)
        }
        if (save) {
          this.saveData()
        }
      }    
    },
    addSignComment(s, comment = null, save = false) {
      const newComment = {
        comment: comment ? comment.comment : '',
        faultOrigin: 'ABB fault',
        owner: this.userInfo._id,
        time: moment().format('ddd DD.MM.YYYY HH:mm')
      }

      if (this.netData.sign.hasOwnProperty('Network Num') && this.netData.sign['Network Num'].hasOwnProperty(s)) {
        this.netData.sign['Network Num'][s].push(newComment)
      } else if (this.netData.sign.hasOwnProperty('Network Num')) {
        this.netData.sign['Network Num'] = Object.assign({}, this.netData.sign['Network Num'], {
          [s]: [newComment]
        })
      } else {
        this.netData.sign = {
          'Network Num': {
            [s]: [newComment]
          }
        }
      }
      if (save) this.saveData()
    },
    saveIfChanged(e, c, idx) {
      if (typeof(e) === 'string' || e.target.value !== c.comment) {
        if (this.userInfo['roles'].includes('invoicingAdmin') || c.owner === this.userInfo._id) {
          c.time = moment().format('ddd DD.MM.YYYY HH:mm')
          c.comment = typeof(e) === 'string' ? c.comment : e.target.value
          c.owner = this.userInfo._id
          this.saveData()
        } else {
          this.notify({
            text: 'You cannot modify someone else\'s comment',
            state: true,
            color: 'error',
            timeout: 3000
          })
        }
      }
      },
    async saveData(saveSap = false) {
      // this.$root.$emit('refresh-formatting')

      this.changeProjectData(this.netData)
      if (saveSap) {
        let dataToSap = this.invoicingDetailVisible.filter(field => field.hasOwnProperty('sourceField'))
        dataToSap = dataToSap.reduce((agg, e) => {
          if (e.dataType === 'date') {
            if (e.hasOwnProperty('sapFixingField')) {
              agg = {...agg, [e.sapFixingField]: this.netData[e.couchFieldIfFixed]}
            }
            return {...agg, [e.sourceField]: moment(this.netData[e.value]).format().substr(0,19)}
          } else {
            if (e.hasOwnProperty('sapFixingField')) {
              agg = {...agg, [e.sapFixingField]: this.netData[e.couchFieldIfFixed]}
            }
            return {...agg, [e.sourceField]: this.netData[e.field]}
          }
        }, {})

        await this.modifyPccNetsData({
          netNums: [this.netData._id],
          data: [dataToSap]
        })
        // this.fetchSapNetsData({
        //   netNums: [this.netData._id],
        //   query: '$select=InvoiceDate,FixationInvoice,FATPlanDate,ContractDeliveryDate,FixationExpedition,RPDispatchDate',
        //   notify: false
        // })
      }
    },
    setDate(t, currentVal) {
      const regexp = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g
      if (t.target.value.match(regexp)) {
        return t.target.value
      } else {
        return null
      }
    },
    swapSigns(currentSign, newSign, comment, i) {
      if (currentSign === newSign) return

      this.removeSignComment(comment, i, currentSign, true, false)
      this.addSignComment(newSign, comment, true)
    }
  }
}
</script>

<style lang="scss">
  .rightSideDetail .v-tabs__bar {
    width: 100%!important;
  }

  .detailTemplate2 input:read-only {
    cursor: not-allowed;
  }

  .detailTemplate2 .v-text-field {
    margin: 0;
    padding: 0;
    font-size: 14px;
    textarea {
      font-size: 14px;
      line-height: 24px;
      padding: 0 2px;
      min-height: 0;
      resize: vertical!important;
    }
    .v-input__append-inner {
      margin-top: 0;
    }
    input {
      height: 27px;
      padding: 10px 0 0 0;
      text-align: center;
    }
    .v-text-field__slot {
      align-items: flex-end;
    }
  }
  .fieldName2 {
    min-width: 200px;
    max-width: 200px;
    font-weight: bolder;
    padding-top: 7px;
  }
  #detailTemplateRightSide .v-select__selections {
    height: 24px!important;
    .v-select__selection {
      margin: 0!important;
    }
  }
</style>
