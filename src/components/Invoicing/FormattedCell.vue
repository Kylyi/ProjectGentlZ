<template>
  <v-layout row wrap>
    <v-flex column grow>
      {{templateData.text}}
    </v-flex>
    <v-flex column shrink>
      <v-icon style="font-size: small;" :title="`This field ${templateData.data['Invoice Date Fixed'] ? 'is' : 'is NOT'} fixed in PPES.`">
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
  const moment = require('moment')

  export default {
    props: ['templateData'],
    methods: {
    }
  }
</script>
