<template>
  <span>{{ssoE ? ssoE[0] : ''}} <sup>{{ssoE ? ssoE[1] : ''}}</sup></span>
</template>

<script>
export default {
  props: ['templateData'],
  computed: {
    ssoE() {
      if (this.templateData.rowType === 'data') {
        const ssoSplit = this.templateData.data.SSO.split('_')
        return [ssoSplit[1], ssoSplit[0]]
      }

      return null
    }
  }
}
</script>

<style>

</style>
