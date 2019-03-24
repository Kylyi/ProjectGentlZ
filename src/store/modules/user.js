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
  userInfo: state => state.userInfo
}

const actions = {
  async checkLoggedIn({ commit }, userDoc) {
    if (!userDoc) return false
    const {password, ...userInfo} = userDoc
    commit('setUserInfo', userInfo)
    commit('setUserPassword', password)

    const keychainPass = await keytar.getPassword('Gentl', username.sync())
    if (!keychainPass) return false

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
  }
}

const mutations = {
  setLoggedIn: (state, validLogin) => {
    state.loggedIn = validLogin
    ipcRenderer.send('appIsReady', true)
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