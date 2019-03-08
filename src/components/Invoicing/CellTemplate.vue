<template>
  <v-layout row wrap>
    <v-flex column style="width: max-content;">{{templateData.text}}</v-flex>
    <div class="column" style="width: 48px; text-align: right;"  v-if="templateData.data.sign">
      <v-icon v-for="(sign, key) in templateData.data.sign[templateData.column.dataField]" :key="key"
      :color="key === 'check' ? 'success' : key === 'info' ? 'info' : 'error'" small v-html="key"></v-icon>
    </div>
  </v-layout>
</template>

<script>
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
    }
  }
</script>
