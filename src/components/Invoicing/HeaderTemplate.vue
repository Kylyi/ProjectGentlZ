<template>
  <v-layout row wrap> 
    <div class="column" style="width: 48px; text-align: left;" v-if="headerFilter && headerFilter.hasOwnProperty(templateData.column.dataField)">
      <v-icon style="font-size: 18px;" 
        :color="getColor(headerFilter[templateData.column.dataField])"
      >
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
    },
    methods: {
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