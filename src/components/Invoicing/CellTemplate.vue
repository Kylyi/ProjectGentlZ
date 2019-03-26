<template>
  <v-layout row wrap>
    <v-flex column style="width: max-content;">{{templateData.text}}</v-flex>
    <div class="column" style="width: 48px; text-align: right;"  v-if="templateData.data.sign">
      <v-icon v-for="(sign, key) in templateData.data.sign[templateData.column.dataField]" :key="key"
      :color="getColor(key)" small v-html="key"></v-icon>
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
