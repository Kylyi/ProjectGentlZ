import path from 'path'
import { readFile } from '../../main/scripts/misc'
const XLSX = require('xlsx')
const isDev = require('electron-is-dev')
const sql = require("mssql/msnodesqlv8")
import DataFrame from 'dataframe-js';

const conn = isDev ? new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), '..', 'defaultSettings', 'databaseSettings.json'), 'utf-8'))) : new sql.ConnectionPool(JSON.parse(readFile(path.join(path.dirname(__dirname), 'defaultSettings', 'databaseSettings.json'), 'utf-8')))

const state = {
  obDailyPath1301: localStorage.getItem('obDailyPath1301'),
  obDailyPath1601: localStorage.getItem('obDailyPath1601')
}

const getters = {
  obDailyPath1301: state => state.obDailyPath1301,
  obDailyPath1601: state => state.obDailyPath1601
}

const actions = {
  addAllBillings({ commit }) {
    conn.connect()
      .then(() => {
        return conn
          .request()
          .query( `SELECT dbo.lvmv_networks.*, dbo.lvmv_tasks.* FROM dbo.lvmv_networks INNER JOIN dbo.lvmv_tasks ON dbo.lvmv_networks.[Network Num] = dbo.lvmv_tasks.[Network Num] WHERE (dbo.lvmv_tasks.[Task Num] = N'0390')`);
      })
      .then(data => {
        console.log(data.recordset)
      })
      .then(() => conn.close())
      .catch(err => {
        conn.close();
        dispatch('notify', {
          text: err,
          color: 'error',
          state: true
        })
      })
  },
  async getOBDaily({}, filePath) {
    const file = XLSX.readFile(filePath, {
      cellDates: true
    })
    const sheet = file.Sheets['zdroj']
    let data = XLSX.utils.sheet_to_json(sheet, {
      range: 2,
    })

    data = data.map(r => {
      return {
        'Project Definition': r['Číslo projektu'],
        'Project Name': r['Název projektu'],
        'Customer Name': r['Jméno odběratele'],
        'Customer Country': r['Stát'],
        'Project Revenues': r['R celk. v CZK'] + r['OB v CZK'],
        'Project OB': r['OB v CZK']
      }
    })

    const df = new DataFrame(data)
    const df2 = new DataFrame(JSON.parse(localStorage.getItem('allProjectsBasic')))

    const x = df2.leftJoin(df, ['Project Definition'])
    return x
  },
  async changeFileLocation({ commit }, {plant, path}) {
    localStorage.setItem('obDailyPath'+plant, path)
    commit('setObDailyPath'+plant, path)
  }
}


const mutations = {
  setObDailyPath1301: (state, path) => state.obDailyPath1301 = path,
  setObDailyPath1601: (state, path) => state.obDailyPath1601 = path,
}

export default {
    state,
    getters,
    actions,
    mutations
}