<template>
  <v-layout row wrap style="max-height: 200px; position: relative;" pt-2>
    <v-dialog
      v-model="batchUpdateDialog"
      scrollable
      persistent
      max-width="1360px"
      transition="dialog-transition"
    >
      <template v-slot:activator="{ on }">
        <v-btn @click="getSapNetsData" icon color="accent" style="position:absolute; right: 46px; z-index: 5;" title="Refresh data from SAP."><v-icon>trip_origin</v-icon></v-btn>
        <v-btn v-on="on" icon color="primary" style="position:absolute; right: 4px; z-index: 5;" title="Batch update."><v-icon>edit</v-icon></v-btn>
      </template>
      
      <v-layout column style="background: white; padding: 8px; min-height: 500px;">
        <v-flex row wrap> <b>Batch update</b> </v-flex>
        <v-divider></v-divider>
        <v-flex row wrap style="height: 54px;">
          <v-select
            v-model="netsToModify"
            :items="selectedNetsParsed"
            label="Networks to modify"
            multiple
            chips deletable-chips
            item-text="_id"
            return-object
            hide-details clearable
          >
            <template slot="prepend-item">
              <v-list-tile
                ripple
                @click="selectAllNetsToModify"
              >
                <v-list-tile-content>
                  <v-list-tile-title>Select All</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider class="mt-2"></v-divider>
            </template>
          </v-select>
        </v-flex>

        <v-layout v-if="netsToModify.length > 0" row pt-2 style="height: 100%;">
          <v-flex column xs5 pr-2 style="overflow: auto;">
            <v-layout row pt-2><span class="subtit2">Editable fields</span></v-layout>
            <v-divider></v-divider>
            <v-layout row wrap v-for="(field, idx) in fieldsToModify" :key="idx">
              <v-flex column shrink>
                <v-icon @click="removeFieldToModify(idx)" style="padding-top: 21px;">delete</v-icon>
              </v-flex>
              <v-flex column shrink style="min-width: 200px; padding-left: 4px;" pr-2>
                <v-autocomplete v-model="field[idx]" item-text="name" :items="editableFields" return-object label="Select field to modify" hide-details></v-autocomplete>
              </v-flex>
              <v-flex column grow>
                <v-layout row wrap fill-height>
                  <v-flex column grow>
                    <template v-if="field[idx] && field[idx].hasOwnProperty('dataType') && field[idx].dataType === 'date'">
                      <v-menu
                        offset-y
                        min-width="290px"
                        max-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            :value="field[idx].newVal"
                            @blur="field[idx].newVal = setDate($event, field[idx].newVal)"
                            @keydown.enter="field[idx].newVal = setDate($event, field[idx].newVal)"
                            v-on="on"
                            hide-details
                            mask="####-##-##"
                            placeholder="YYYY-MM-DD"
                            :return-masked-value="true"
                            :disabled="!field[idx]['newFixingVal']"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="field[idx].newVal" first-day-of-week="1"></v-date-picker>
                      </v-menu>
                    </template>

                    <template v-else-if="field[idx] && field[idx].hasOwnProperty('dataType') && field[idx].dataType === 'number'">
                      <vue-numeric
                        v-model="field[idx].newVal"
                        class="myNumeric numericBatch"
                        read-only-class="myNumeric notAllowed numericBatch"
                        thousand-separator=" "
                        decimal-separator=","
                        :precision="0"
                        :read-only="!field[idx]['newFixingVal']"
                      ></vue-numeric>
                    </template>

                    <template v-else-if="field[idx] && field[idx].hasOwnProperty('dataType')">
                      <v-text-field
                        v-model="field[idx].newVal"
                        :type="field.dataType"
                        style="width: 100%;"
                        hide-details
                        :disabled="!field[idx]['newFixingVal']"
                      ></v-text-field>
                    </template>

                  </v-flex>
                  <v-flex column shrink style="display: flex; align-items: center;">
                    <v-icon @click="fixField(field, idx)" style="margin-top: 20px;">
                      {{field[idx] && field[idx].hasOwnProperty('newFixingVal') && field[idx]['newFixingVal'] ? 'radio_button_checked' : 'radio_button_unchecked'}}
                    </v-icon>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
            <v-layout row><v-btn block color="primary" @click="addFieldToModify">Add field</v-btn></v-layout>
          </v-flex>

          <v-divider vertical></v-divider>

          <v-flex column xs7 pl-2>
            <v-layout row pt-2><span class="subtit2">Identic comments</span></v-layout>
            <v-divider></v-divider>
            <v-layout row
              v-for="(comment, idx) in identicAndNewComments"
              :key="idx"
            >
              <v-flex column shrink>
                <v-select
                  hide-details
                  style="width: 60px; padding-right:5px;"
                  :value="comment.sign"
                  :items="signOptions"
                  @change="swapSignOnIdenticComment($event, comment)"
                >
                  <template slot="item" slot-scope="data"><v-icon>{{data.item}}</v-icon></template>
                  <template slot="selection" slot-scope="data"><v-icon>{{data.item}}</v-icon></template>
                </v-select>
              </v-flex>
              <v-flex column shrink pr-1>
                <v-select
                  v-if="comment.sign === 'warning'"
                  v-model="comment.faultOrigin"
                  hide-details
                  :items="['Ready & Waiting', 'ABB fault', 'Customer fault']"
                  style="max-width: 144px;"
                ></v-select>
              </v-flex>
              <v-flex column grow>
                <v-text-field v-model="comment.comment" @change="updateIdenticComment(comment)" style="width: 100%;" hide-details></v-text-field>
              </v-flex>
              <v-flex column shrink>
                <v-icon @click="removeIdenticComment($event ,comment)" style="padding-top: 21px;">delete</v-icon>
              </v-flex>
            </v-layout>
            <v-layout row><v-btn block color="primary" @click="addIdenticComment">Add comment</v-btn></v-layout>
          </v-flex>

        </v-layout>
        <v-layout v-else style="height: 100%;" pt-2>
          Select networks you want to modify.
        </v-layout>

        <v-flex row wrap>
          <v-layout row>
            <v-flex column xs6><v-btn color="accent" @click="batchUpdateDialog = false; setEditableFields()" >cancel</v-btn></v-flex>
            <v-flex column xs6 text-xs-right><v-btn color="primary" @click="submitCommentsChanges" >save</v-btn></v-flex>
          </v-layout>
        </v-flex>
      </v-layout>

    </v-dialog>

  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import _ from 'underscore'
import moment from 'moment'
export default {
  name: 'BatchUpdateInvoicing',
  props: ['selectedNets'],
  created() {
    this.signOptions = this.userInfo.roles.includes('invoicingAdmin') ? ['warning', 'info', 'arrow_upward', 'arrow_downward'] : ['info', 'arrow_upward', 'arrow_downward']
    this.setEditableFields()
  },
  data() {
    return {
      batchUpdateDialog: false,
      netsToModify: [],
      fieldsToModify: [],
      signOptions: [],
      commentsToUpdate: {
        delete: [],
        insert: [],
        update: [],
        updateSigns: []
      },
      editableFields: []
    }
  },
  computed: {
    ...mapGetters(['invoicingDetailVisible', 'userInfo']),
    selectedNetsParsed() {
      return JSON.parse(JSON.stringify(this.selectedNets))
    },
    identicComments() {
      const netsToModify = this.netsToModify
      if (netsToModify.length === 0) return []

      const a = _.flatten(netsToModify.reduce((agg, e) => {
        if (e.sign.hasOwnProperty('Network Num')) {
          let signs = []
          for (let [key, value] of Object.entries(e.sign['Network Num'])) {
            value = value.map((x, idx) => {
              x.sign = key
              x.signIdx = idx
              return x
            })
            signs.push(value)
          }
          return [...agg, signs]
        }
        return agg
      }, []))

      const allComments = a.map(e => e.comment)
      const allSigns = a.map(e => e.sign)

      const identicComments = a.reduce((agg, e) => {
        const firstIndexComment = allComments.indexOf(e.comment)
        const lastIndexComment = allComments.lastIndexOf(e.comment)

        if (firstIndexComment !== lastIndexComment) {
          const isInIdx = agg.map(x => x.comment === e.comment).indexOf(true)
          if (isInIdx !== -1) {
            agg[isInIdx].netId.push(e.netId)
            agg[isInIdx].signIdx.push(e.signIdx)
            return agg
          } else {
            return [...agg, {
              comment: e.comment,
              owner: e.owner,
              time: e.time,
              sign: e.sign,
              netId: [e.netId],
              signIdx: [e.signIdx]
            }]
          }
        }
        return agg
      }, [])

      return identicComments.filter(e => e.netId.length === netsToModify.length)
    },
    identicAndNewComments() {
      return this.identicComments.concat(this.commentsToUpdate.insert)
    }
  },
  watch: {
    batchUpdateDialog: function(newVal) {
      if (newVal) {
        this.netsToModify = []
        this.selectAllNetsToModify()
        this.fieldsToModify = []
        this.commentsToUpdate = {
          delete: [],
          insert: [],
          update: [],
          updateSigns: []
        }
      }
    }
  },
  methods: {
    ...mapActions(['changeProjectsData', 'fetchSapNetsData', 'modifyPccNetsData']),
    selectAllNetsToModify() {
      if (this.netsToModify.length === this.selectedNetsParsed.length) {
        this.netsToModify = []
        this.fieldsToModify = []
      } else {
        this.netsToModify = this.selectedNetsParsed
      }
    },
    addFieldToModify() {
      this.fieldsToModify.push({ name: '' })
    },
    removeFieldToModify(idx) {
      this.fieldsToModify.splice(idx, 1)
    },
    removeIdenticComment(e, comment, cnf = false) {
      cnf = cnf || confirm('Do you really want to remove this comment for all selected networks?')
      if (cnf) {
        if (comment.hasOwnProperty('insertIdx')) {
          this.commentsToUpdate['insert'].splice(comment.insertIdx, 1)
        } else {
          this.commentsToUpdate.delete.push(comment)
          if (e) {
            e.target.parentElement.parentElement.style = 'display: none;'
          } 
          if (comment.hasOwnProperty('updateIdx')) {
            this.commentsToUpdate['update'].splice(comment.updateIdx, 1)
          }
        }
      }
    },
    addIdenticComment() {
      this.commentsToUpdate['insert'].push({
        comment: '',
        faultOrigin: 'ABB fault',
        owner: this.userInfo._id,
        time: moment().format('ddd DD.MM.YYYY HH:mm'),
        sign: 'info',
        insertIdx: this.commentsToUpdate['insert'].length
      })
    },
    updateIdenticComment(comment) {
      if (comment.hasOwnProperty('updateIdx')) {
        this.commentsToUpdate['update'][comment.updateIdx] = comment
      } else if (comment.hasOwnProperty('insertIdx')) {
         this.commentsToUpdate['insert'][comment.insertIdx] = comment
      } else {
        Object.assign(comment, {updateIdx: this.commentsToUpdate['update'].length})
        this.commentsToUpdate['update'].push({
          ...comment,
          updateIdx: this.commentsToUpdate['update'].length
        })
      }
    },
    swapSignOnIdenticComment(newSign, comment) {
      if (comment.hasOwnProperty('insertIdx')) {
        this.commentsToUpdate['insert'][comment.insertIdx].sign = newSign
      } else if (comment.hasOwnProperty('updateSignIdx')) {
        this.commentsToUpdate['updateSigns'][comment.updateSignIdx] = {...comment, newSign}
      } else {
        comment.updateSignIdx = this.commentsToUpdate['updateSigns'].length
        this.commentsToUpdate['updateSigns'].push({...comment, newSign})
      }
    },
    submitCommentsChanges() {
      const time = moment().format('ddd DD.MM.YYYY HH:mm')
      
      // UPDATE COMMENTS
      this.commentsToUpdate['update'].forEach(comment => {
        this.netsToModify.map((e, idx) => {
          e.sign['Network Num'][comment.sign][comment.signIdx[idx]] = {
            comment: comment.comment,
            owner: this.userInfo._id,
            faultOrigin: comment.faultOrigin,
            time
          }
          return e
        })
      })

      // DELETE COMMENTS
      this.commentsToUpdate['delete'].forEach(comment => {
        this.netsToModify.map((e, idx) => {
          let remainingSignComments = e.sign['Network Num'][comment.sign]
          if (remainingSignComments.length !== 1) {
            e.sign['Network Num'][comment.sign].splice(comment.signIdx[idx], 1)
          } else {
            this.$delete(e.sign['Network Num'], comment.sign)
          }
        })
      })

      // INSERT COMMENTS
      this.commentsToUpdate['insert'].forEach(comment => {
        this.netsToModify.map((e, idx) => {
          if (e.sign.hasOwnProperty('Network Num') && e.sign['Network Num'].hasOwnProperty(comment.sign)) {
            e.sign['Network Num'][comment.sign].push({
              comment: comment.comment,
              owner: this.userInfo._id,
              faultOrigin: comment.faultOrigin,
              time
            })
          }
          else if (e.sign.hasOwnProperty('Network Num')) {
            e.sign['Network Num'] = Object.assign({}, e.sign['Network Num'], {
              [comment.sign]: [{
                comment: comment.comment,
                owner: this.userInfo._id,
                faultOrigin: comment.faultOrigin,
                time
              }]
            })
          } else {
            e.sign = {
              'Network Num': {
                [comment.sign]: [{
                  comment: comment.comment,
                  owner: this.userInfo._id,
                  faultOrigin: comment.faultOrigin,
                  time
                }]
              }
            }
          }
        })
      })

      // UPDATE SIGNS
      this.commentsToUpdate['updateSigns'].forEach(comment => {
        this.netsToModify.map((e, idx) => {
          let remainingSignComments = e.sign['Network Num'][comment.sign]
          if (remainingSignComments.length !== 1) {
            e.sign['Network Num'][comment.sign].splice(comment.signIdx[idx], 1)
          } else {
            this.$delete(e.sign['Network Num'], comment.sign)
          }

          let newComment = comment.comment
          if (comment.hasOwnProperty('updateIdx')) {
            newComment = this.commentsToUpdate['update'][comment.updateIdx].comment
          }

          if (e.sign.hasOwnProperty('Network Num') && e.sign['Network Num'].hasOwnProperty(comment.newSign)) {
            e.sign['Network Num'][comment.newSign].push({
              comment: comment.comment,
              owner: this.userInfo._id,
              faultOrigin: comment.faultOrigin,
              time
            })
          }
          else if (e.sign.hasOwnProperty('Network Num')) {
            e.sign['Network Num'] = Object.assign({}, e.sign['Network Num'], {
              [comment.newSign]: [{
                comment: comment.comment,
                owner: this.userInfo._id,
                faultOrigin: comment.faultOrigin,
                time
              }]
            })
          } else {
            e.sign = {
              'Network Num': {
                [comment.newSign]: [{
                  comment: comment.comment,
                  owner: this.userInfo._id,
                  faultOrigin: comment.faultOrigin,
                  time
                }]
              }
            }
          }
        })
      })

      const netIds = this.netsToModify.map(e => e._id)
      this.selectedNets.forEach(net => {
        const idx = netIds.indexOf(net._id)
        if (idx !== -1) {
          net.sign = this.netsToModify[idx].sign
          this.fieldsToModify.forEach((x, idx2) => {
            net[x[idx2].value] = x[idx2].newVal
          })
        }
      })

      this.commentsToUpdate = {
        delete: [],
        insert: [],
        update: [],
        updateSigns: []
      }

      let data = this.netsToModify.map(e => { return {sign: e.sign} })
      let fieldsToEditSap = []
      const fieldsToEditCouch = this.editableFields.filter(e => e.newVal)
      data.map(e => {
        fieldsToEditCouch.forEach(field => {
          e[field.value] = field.newVal
          if (field.hasOwnProperty('couchFieldIfFixed')) {
            e[field.couchFieldIfFixed] = field.newFixingVal
          }
          if (field.source === 'sap') {
            fieldsToEditSap.push({
              [field['sapFixingField']]: field.newFixingVal,
              [field['sourceField']]: field.dataType === 'date' ? field.newVal + 'T10:00:00' : field.newVal
            })
          }
        })
        return e
      })
      console.log('To couch: ', {
        netNums: netIds,
        data
      })
      console.log('To SAP: ', {
        netNums: netIds,
        data: fieldsToEditSap
      })

      this.changeProjectsData({
        netNums: netIds,
        data
      })

      this.modifyPccNetsData({
        netNums: netIds,
        data: fieldsToEditSap
      })

      this.netsToModify = []
      this.fieldsToModify = []
      // this.$root.$emit('refresh-formatting')
      this.setEditableFields()
      this.batchUpdateDialog = false
    },
    getSapNetsData() {
      this.fetchSapNetsData({
        netNums: this.selectedNets.map(e => e._id),
        query: '$select=InvoiceDate,FixationInvoice,FATPlanDate,ContractDeliveryDate,FixationExpedition,RPDispatchDate,NetworkNote'
      })
    },
    setDate(t, currentVal) {
      const regexp = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/g
      if (t.target.value.match(regexp)) {
        return t.target.value
      } else {
        this.$forceUpdate()
      }
    },
    setEditableFields() {
      let editableFields = this.invoicingDetailVisible.filter(e => e.editable)
      this.editableFields = editableFields.map(e => { return {...e, newVal: '', newFixingVal: false} })
    },
    fixField(e, idx) {
      e[idx].newFixingVal = !e[idx].newFixingVal
    }
  }
}
</script>

<style>
  .numericBatch {
    height: 100%!important;
    margin-top: 1px;
    font-size: 16px;
  }
</style>
