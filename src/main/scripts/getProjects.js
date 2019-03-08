import path from 'path'
import { readFile } from './misc'
const isDev = require('electron-is-dev')
const PouchDB = require('pouchdb')
const projects = new PouchDB('src/db/projects')
const sql = require("mssql/msnodesqlv8")
// const conn = new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), '..' , 'defaultSettings', 'databaseSettings.json'), 'utf-8')))
const conn = isDev ? new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'databaseSettings.json'), 'utf-8'))) : new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json'), 'utf-8')))


export let getAllProjects = async function () {
  conn.connect()
    .then(() => {
      async function getAllProjectsData() {
        try {
          const sapData = await conn.request().query(`select top 2000 * from [lvmv_networks]`)
          const x = sapData['recordset']

          const y = x.reduce((agg, e) => {
            const f = agg.map(a => a.project_id === e['Project Definition']).indexOf(true)

            if (f === -1) {
              // Project ID not in aggregator
              return [...agg, {
                project_id: e['Project Definition'],
                nets_keys: [e['Network Num']],
                nets: [{
                  net_num: e['Network Num'],
                  net_info: [{
                    task_num: e['Task Num'],
                    task_info: e
                  }]
                }]
              }]

            } else {
              // Project ID in aggregator
              const f2 = agg[f]['nets'].map(a => a.net_num === e['Network Num']).indexOf(true)

              if (f2 === -1) {
                // Network num not in aggregator
                agg[f]['nets'].push({
                  net_num: e['Network Num'],
                  net_info: [{
                    task_num: e['Task Num'],
                    task_info: e
                  }]
                })
                agg[f]['nets_keys'].push(e['Network Num'])

                return agg

              } else {
                // Network num in aggregator
                agg[f]['nets'][f2]['net_info'].push({
                  task_num: e['Task Num'],
                  task_info: e
                })
                return agg
              }

            }
          }, [])

          return y

        } catch (error) {
          console.log(error)
        }
      }

      return getAllProjectsData()
    })
    .then(projInfo => {
      const x = projInfo.map(p => {
        p['_id'] = p.project_id
        p['project_pm'] = p.nets[0].net_info[0].task_info['Project Manager']
        
        projects.upsert(p.project_id, (doc) => {
          return p
        })
        return p
      })
    })
    .then(() => conn.close())
    .catch(e => console.error(e))
}