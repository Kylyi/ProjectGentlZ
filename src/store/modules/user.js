import username from 'username'
import bcrypt from 'bcrypt'
import keytar from 'keytar'
import store from '../index'
import { ipcRenderer } from 'electron';
import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const remoteUsers = new PouchDB('http://gentl_admin:jacob2603@XC-S-ZW00410.XC.ABB.COM:5984/users')
const userDb = new PouchDB(`${process.env.APPDATA}/GentlDatabase/user`)

async function getUserInfo() {
  const loggedUser = username.sync().toLowerCase()
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
       "$eq": username.sync().toLowerCase()
    }
  }
}).on('change', e => {
  getUserInfo()
})

const state = {
  loggedIn: false,
  userInfo: {},
  password: null,
  validPassword: false,
  resettedPassword: '',
  allUsers: [],
  selectedUserInfo: null,
  sapLogin: localStorage.getItem('sapLogin') || '',
  sapLoginTest: 'cmZjX2dlbnRsOkg1TWVuR3NQ'
}

const getters = {
  loggedIn: state => state.loggedIn,
  userInfo: state => state.userInfo,
  password: state => state.password,
  validPassword: state => state.validPassword,
  allUsers: state => state.allUsers,
  selectedUserInfo: state => state.selectedUserInfo
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

    const keychainPass = await keytar.getPassword('Gentl', username.sync().toLowerCase())
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
      keytar.setPassword('Gentl', username.sync().toLowerCase(), password)
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
      await keytar.setPassword('Gentl', username.sync().toLowerCase(), password)
      const doc = await userDb.upsert(username.sync().toLowerCase(), (doc) => {
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
      if (!sapUsername || sapUsername === '' || !sapUsernumber || sapUsernumber === '') throw 'SAP username or SAP ID not defined.'
      const user = username.sync().toLowerCase()
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
  },
  checkPassword({ commit, state }, password) {
    const validPassword = bcrypt.compareSync(password || '', state.password)
    commit('validPassword', validPassword)
  },
  async changePassword({ dispatch }, password) {
    try {
      await userDb.upsert(username.sync().toLowerCase(), newDoc => {
        newDoc.password = bcrypt.hashSync(password, 10)
        return newDoc
      })
      keytar.setPassword('Gentl', username.sync().toLowerCase(), password)

      dispatch('notify', {
        text: 'Password changed.',
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
  },
  async resetPassword({ dispatch, commit } ) {
    const newPassword = Math.random().toString(36).slice(-8)

    try {
      await userDb.upsert(username.sync().toLowerCase(), newDoc => {
        newDoc.password = bcrypt.hashSync(newPassword, 10)
        return newDoc
      })

    } catch (error) {
      dispatch('notify', {
        text: err,
        state: true,
        color: 'error'
      })
    }
  },
  async changeUserContactInfo({ dispatch }, { userEmail, userPhone }) {
    try {
      await userDb.upsert(username.sync().toLowerCase(), doc => {
        doc.email = userEmail
        doc.phone = userPhone
        return doc
      })
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
  },
  async fetchAllUsers({ commit, rootState, dispatch }) {
    try {
      if (rootState.general.offline) throw 'You must be online to use this functionality.'
      let users = await remoteUsers.allDocs({ include_docs: true })
      users = users.rows.map(e => {
        const {password, ...userInfo} = e.doc
        return userInfo
      })
      commit('setAllUsers', users)
      
    } catch (err) {
      dispatch('notify', {
        text: err,
        state: true,
        color: 'error'
      })
    }
  },
  async fetchUserInfo({ commit, rootState, dispatch }, userId) {
    try {
      const user = await remoteUsers.get(userId)
      const {password, ...userInfo} = user

      commit('setSelectedUserInfo', userInfo)
    } catch (error) {
      dispatch('notify', {
        text: error,
        state: true,
        color: 'error'
      })
    }
  },
  async changeUsersSubordinates({}, usersToUpdate) {
    Array.prototype.unique = function() {
      return this.filter(function (value, index, self) { 
        return self.indexOf(value) === index;
      });
    }
    try {
      for (const user of usersToUpdate) {
        remoteUsers.upsert(user._id, doc => {
          doc.subordinates = user.subordinates
          return doc
        })
      }
    } catch (error) {
      console.error(error)
    }
  },
  async partialOverwriteUser({ dispatch }, {userId, data}) {
    try {
      remoteUsers.upsert(userId, doc => {
        Object.assign(doc, data)
        return doc
      })
      dispatch('notify', {
        text: 'User modified',
        state: true,
        color: 'success'
      })
    } catch (error) {
      dispatch('notify', {
        text: error,
        state: true,
        color: 'error'
      })
    }
  },
  async setSapLogin({ commit, dispatch, rootState }, login) {
    const btoaLogin = btoa(login)
    localStorage.setItem('sapLogin', btoaLogin)
    rootState.general.sapLoginFilled = localStorage.getItem('sapLogin')
    commit('setSapLogin', btoaLogin)
    dispatch('notify', {
      text: 'Saved.',
      state: true,
      color: 'success'
    })
  },
  async partialOverwriteUserLocal({ dispatch, rootState }, data) {
    try {
      await userDb.upsert(rootState.user.userInfo._id, doc => {
        Object.assign(doc, data)
        return doc
      })
      dispatch('notify', {
        text: 'Saved.',
        state: true,
        color: 'success'
      })
    } catch (error) {
      dispatch('notify', {
        text: error,
        state: true,
        color: 'error'
      })
    }
  }
}

const mutations = {
  setLoggedIn: (state, validLogin) => state.loggedIn = validLogin,
  setUserInfo: (state, userInfo) => state.userInfo = userInfo,
  setUserPassword: (state, password) => state.password = password,
  validPassword: (state, valid) => state.validPassword = valid,
  setAllUsers: (state, users) => state.allUsers = users,
  setSelectedUserInfo: (state, userInfo) => state.selectedUserInfo = userInfo,
  setSapLogin: (state, btoaString) => state.sapLogin = btoaString
}

export default {
  state,
  getters,
  actions,
  mutations
}