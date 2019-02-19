<template>
  <v-container>
    <v-btn @click="getData">click</v-btn>
    <v-btn @click="t">Test</v-btn>
  </v-container>
</template>

<style>

</style>

<script>
  import db from '../main/scripts/database'
  const sql = require("mssql/msnodesqlv8");
  const conn = new sql.ConnectionPool({
    database: "ppes_dev",
    server: "localhost\\SQLEXPRESS",
    driver: "msnodesqlv8",
    options: {
      trustedConnection: true
    }
  });
  conn.connect()
    .then(() => {
    console.log('connected')
    })
    .catch(e => console.error(e))

  export default {
    data: () => ({
      value1: ''
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
      async t() {
        const a = await db.billings.allDocs()
        console.log(a)
      }
    }
}
</script>
