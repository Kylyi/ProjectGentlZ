<template>
  <v-layout row wrap>
    <v-flex column style="width: max-content;">{{templateData.text}}</v-flex>
    <div class="column" style="width: 64px; text-align: right;"  v-if="templateData.data.sign">
      <v-icon v-for="(sign, key) in templateData.data.sign[templateData.column.dataField]" :key="key"
      :color="getColor(key)" small v-html="key" @click="setSignInfo($event, sign)"></v-icon>
    </div>

    <!-- <v-menu
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
            </tr>
            <tr>
              <td style="width: 400px; word-break: break-word;">
                {{comment.comment}}
              </td>
            </tr>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-menu> -->
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex';

  export default {
    props: {
      templateData: {
        type: Object,
        default: () => {}
      },
      signs: {
        type: Object,
        default: () => {}
      }
    },
    data: () => {
      return {
        currentPosition: {left: 0, top: 0},
        showSignInfo: false,
        signComments: []
      }
    },
    methods: {
      ...mapActions(['setCurrentPosition', 'signInfo']),
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
      setSignInfo(e, sign) {
        this.setCurrentPosition(e)
        this.signInfo(sign)
        this.$root.$emit('show-sign-info', true)
      }
    }
  }
</script>
