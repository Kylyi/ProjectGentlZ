import username from 'username'
import bcrypt from 'bcrypt'
import keytar from 'keytar'
import store from '../index'
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const remoteUsers = new PouchDB('http://Kyli:ivana941118@40.113.87.17:5984/users')
const userDb = new PouchDB('src/db/user')

async function getUserInfo() {
  const loggedUser = username.sync()
  let currentUser
  
  try {
    currentUser = await userDb.get(loggedUser)
    store.dispatch('checkLoggedIn', currentUser)
  } catch (error) {
    store.dispatch('checkLoggedIn', false)
  }
}
getUserInfo()

userDb.sync(remoteUsers, {
  live: true,
  retry: true,
  "selector": {
    "_id": {
       "$eq": username.sync()
    }
  }
}).on('change', e => {
  getUserInfo()
})

const state = {
  loggedIn: false,
  userInfo: {},
  password: null
}

const getters = {
  loggedIn: state => state.loggedIn,
  userInfo: state => state.userInfo,
  password: state => state.password
}

const actions = {
  async checkLoggedIn({ commit }, userDoc) {
    if (!userDoc) {
      commit('setLoggedIn', false)
      return
    }
    const {password, ...userInfo} = userDoc
    commit('setUserInfo', userInfo)
    commit('setUserPassword', password)

    const keychainPass = await keytar.getPassword('Gentl', username.sync())
    if (!keychainPass) {
      commit('setLoggedIn', false)
      return
    }

    const validLogin = bcrypt.compareSync(keychainPass, password)
    commit('setLoggedIn', validLogin)
  },
  async loginWithPassword({ commit, state, dispatch }, password) {
    const passMatch = bcrypt.compareSync(password, state.password)

    if (passMatch) {
      keytar.setPassword('Gentl', username.sync(), password)
      commit('setLoggedIn', true)
    } else {
      dispatch('notify', {
        text: 'Passwords don\'t match',
        color: 'error',
        state: true
      })
    }
  },
  async registerUser({commit}, password) {
    try {
      await keytar.setPassword('Gentl', username.sync(), password)
      const doc = await userDb.upsert(username.sync(), (doc) => {
        doc.password = bcrypt.hashSync(password, 10)
        doc.roles = []
        return doc
      })

      const addedUser = await userDb.get(doc.id)
      commit('setLoggedIn', true)
      commit('setUserInfo', addedUser)
      commit('setUserPassword', password)
    } catch (err) {
      console.log(err)
    }
  },
  async changeUserSapName({ dispatch }, {sapUsername, sapUsernumber}) {
    try {
      if (!sapUsername || sapUsername === '' || !sapUsernumber || sapUsernumber === '') throw 'SAP username not defined.'
      const user = username.sync()
      await userDb.upsert(user, doc => {
        doc.sapUsername = sapUsername
        doc.sapUsernumber = sapUsernumber
        return doc
      })
      localStorage.setItem('sapUsername', sapUsername)
      // dispatch('fetchAllProjectsBasic', true)
      dispatch('notify', {
        text: 'User modified',
        state: true,
        color: 'success'
      })
    } catch (err) {
      dispatch('notify', {
        text: err,
        state: true,
        color: 'error'
      })
    }
  }
}

const mutations = {
  setLoggedIn: (state, validLogin) => {
    state.loggedIn = validLogin
    setTimeout(() => ipcRenderer.send('appIsReady', true))
  },
  setUserInfo: (state, userInfo) => state.userInfo = userInfo,
  setUserPassword: (state, password) => state.password = password
}

export default {
  state,
  getters,
  actions,
  mutations
}