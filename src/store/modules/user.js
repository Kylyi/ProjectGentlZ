import username from 'username'
import bcrypt from 'bcrypt'
import keytar from 'keytar'
import db from '../../main/scripts/database'
import { ipcRenderer } from 'electron';

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
      const doc = await db.user.upsert(username.sync(), (doc) => {
        doc.password = bcrypt.hashSync(password, 10)
        doc.roles = []
        return doc
      })

      const addedUser = await db.user.get(doc.id)
      commit('setLoggedIn', true)
      commit('setUserInfo', addedUser)
      commit('setUserPassword', password)
    } catch (err) {
      console.log(err)
    }
  },
  async changeUserSapName({ dispatch }, sapName) {
    try {
      if (!sapName || sapName === '') throw 'SAP username not defined.'
      const user = username.sync()
      const a = await db.user.upsert(user, doc => {
        doc.sapUsername = sapName
        return doc
      })
      localStorage.setItem('sapUsername', sapName)
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
    setTimeout(() => ipcRenderer.send('appIsReady', true), 200)
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