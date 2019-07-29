<template>
  <v-layout row wrap>
    <v-flex column style="width: max-content;">{{templateData.text}}</v-flex>
    <div class="column" style="width: 64px; text-align: right;"  v-if="templateData.data.sign">
      <v-icon v-for="(sign, key) in templateData.data.sign[templateData.column.dataField]" :key="key"
      :color="getColor(key)" small v-html="key" @click="setSignInfo($event, sign)"></v-icon>
    </div>
  </v-layout>
</template>

<script>
import { mapActions } from 'vuex';

  export default {
    props: ['templateData', 'signs'],
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
