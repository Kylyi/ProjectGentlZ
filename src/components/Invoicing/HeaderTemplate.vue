<template>
  <v-layout row wrap> 
    <div class="column" style="width: 48px; text-align: left;" v-if="headerFilter && headerFilter.hasOwnProperty(templateData.column.dataField)">
      <v-icon style="font-size: 18px;" :color="headerFilter[templateData.column.dataField] === 'check' ? 'success' : headerFilter[templateData.column.dataField] === 'info' ? 'info' : 'error'">
        {{headerFilter[templateData.column.dataField]}}
      </v-icon>
    </div>

    <v-flex column style="width: max-content;">{{templateData.column.caption}}</v-flex>
  </v-layout>
</template>

<script>
  export default {
    props: {
      templateData: {
        type: Object,
        default: () => {}
      },
      headerFilter: {
        type: Object,
        default: () => {}
      },
    }
  }
</script>