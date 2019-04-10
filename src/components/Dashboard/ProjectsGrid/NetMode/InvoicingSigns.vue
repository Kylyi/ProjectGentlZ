<template>
    <div>
      <span v-for="sign in Object.keys(invoicingSigns).sort()" :key="sign">
        <v-icon small v-html="sign" :color="getColor(sign)" />
      </span>
    </div>
</template>

<script>
export default {
  name: 'NetModeInvoicingSigns',
  props: {
    signs: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    invoicingSigns: {
      get: function () {
        const signs = this.$props.signs

        const s =  Object.keys(signs).reduce((agg, f) => {
          const fieldSigns = Object.keys(signs[f])
          
          fieldSigns.map(fs => {
            if (agg.hasOwnProperty(fs)) {
              agg[fs] = agg[fs].concat(signs[f][fs])
                } else {
              agg[fs] = signs[f][fs]
            }
          })

          return agg
        }, {})

        return s
      }
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

<style>

</style>
