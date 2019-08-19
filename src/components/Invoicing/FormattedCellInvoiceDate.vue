<template>
  <v-layout row wrap>
    <v-flex column shrink>
      <v-icon style="font-size: small;" :title="getTitleRealInvoice()">
        {{getIconRealInvoice()}}
      </v-icon>
    </v-flex>
    <v-flex column grow :style="getColor()">
      {{templateData.text}}
    </v-flex>
    <v-flex column shrink>
      <v-icon style="font-size: small;" :title="`This field ${templateData.data['Invoice Date Fixed'] ? 'is' : 'is NOT'} fixed in SAP.`">
        {{ templateData.rowType === 'data' ? templateData.data['Invoice Date Fixed'] ? 'radio_button_checked' : 'radio_button_unchecked' : ''}}
      </v-icon>
    </v-flex>
  </v-layout>
</template>


<style>
  .delayed {
    color: red;
  }
  .hasted {
    color: green;
  }
  .normal {
    color: black;
  }
</style>



<script>
import { mapGetters } from 'vuex';
  const moment = require('moment')

  export default {
    props: ['templateData'],
    computed: {
      ...mapGetters(['invoicingLastUpdate', 'invoicingCompareDate']),
    },
    methods: {
      getColor() {
        if (this.templateData.rowType === 'data') {
          const lastDate = this.templateData.data['Current Invoice Date']
          if (lastDate > this.templateData.data['Invoice Date'][this.invoicingCompareDate]) {
            return 'color: red;'
          } else if (lastDate < this.templateData.data['Invoice Date'][this.invoicingCompareDate]) {
            return 'color: green;'
          }
        }
        // console.log(this.templateData['Invoice Date']['lastUpdate'])
      },
      getIconRealInvoice() {
        if (this.templateData.rowType === 'data') {
          if (!this.templateData.data['Invoice Date Actual']) return 'close'
          else if (this.templateData.data['Invoice Date Actual'].substr(0, 10) === this.templateData.data['Current Invoice Date'].substr(0, 10)) return 'check'
          else return 'remove'
        }
      },
      getTitleRealInvoice() {
        if (this.templateData.rowType === 'data' && this.templateData.data['Invoice Date Actual']) {
          return `Invoice date actual: ${this.templateData.data['Invoice Date Actual'].substr(0, 10)}`
        } else {
          return `Invoice date actual: Not finished yet.`
        }
      }
    }
  }
</script>
