<template>
  <v-container fluid>
    <v-btn @click="yikes">Yikes</v-btn>
  </v-container>
</template>

<style>

</style>

<script>
  export default {
    data: () => ({
      value1: '',
      arr: ['close', 'add'],
      sel: null,
      data: []
    }),
    methods: {
      async getData() {
        // Missing values
        // [] as [net_orig_delivery], \
        // [] as [net_package_date], \
        // [] as [net_revenues], \
        // [] as [project_ob], \
        // [] as net_fat \
        // [Transport] as [net_transport], \
        // [Destination] as [project_destination], \
        // [Actual Despatch] as [actual_dispatch_date], \
        // [Group] as [pm_group], \

        const a = await conn.request().query("select \
         [Project Definition] as [project_id], \
         [Network Num] as [net_num], \
         [Network Description] as [net_descr], \
         [Number of Panels] as [net_panels_no], \
         [Switchgear Type] as [net_type], \
         [Net Status from Tasks] as [net_status], \
         [Buffer Size - Overall Project] as [net_bpo], \
         [Contractual Delivery Date] as [net_contract_delivery], \
         [Contractual Expedition Date] as [contract_dispatch], \
         [INCO Type] as [project_inco], \
         [Expedition Fixed] as [fixed], \
         [Packaging] as [project_packaging], \
         [Project Manager] as [project_pm], \
         [Network Note] as [ppes_comments] \
         from ppes_1601 where ([Task Num] = '0435' and [Delivery Date] > '2019-01-01')")
        console.log(a)
      },
      async dumpDb () {
        const toBeSaved = await other.allDocs({include_docs: true})
        // const toBeSaved = await other.get('01b26189fe4662f4da5a7bbb7b002f03')
        let a = toBeSaved.rows.map(e => e.doc)
        // a = a.map(e => {
        //   console.log(e)
        // })
        
        const x = a.map(e => {
          Object.keys(e.feelings).forEach(f => {
            e[f] = e.feelings[f]
          });

          e.audioAnswers.forEach((a, idx) => {
            e[`${idx+1}_words`] = Object.values(a).toString()
          });

          return e
        })

        delete x['audioAnswers']
        delete x['feelings']

        // fs.writeFile("C:/Users/kyli/Desktop/output.json", JSON.stringify(x), 'utf8', (err, res) => {
        //   if (err) throw err;
        // })
        this.data = x
      }
    },
    components: {
    }
}
</script>
