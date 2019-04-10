<template>
  <dx-check-box
    v-model="killMePls"
  >
  </dx-check-box>
</template>

<script>
export default {
  name: 'CheckTemplate',
  props: ['checked', 'riskRegister'],
  computed: {
    killMePls: {
      get: function () {
        return this.checked
      },
      set: function (newValue) {
        console.log(this.riskRegister.risks['Health and Safety'].exists)
        console.log(newValue)
        this.riskRegister.risks['Health and Safety'][0].exists = newValue
      }
    }
  }
}
</script>

<style>

</style>
