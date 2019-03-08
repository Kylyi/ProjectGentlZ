<template>
  <v-app>
    <template v-if="loggedIn">
      <v-navigation-drawer
        fixed
        :mini-variant="miniVariant"
        :clipped="clipped"
        v-model="drawer"
        app>
        <v-list>
          <!-- Dashboard -->
          <!-- <v-list-tile router to="/">
            <v-list-tile-action>
              <v-icon>dashboard</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Dash</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile> -->

          <!-- Templates -->
          <v-list-group prepend-icon="assignment">

            <v-list-tile slot="activator">
              <v-list-tile-title>Templates</v-list-tile-title>
            </v-list-tile>
            
            <v-list-tile 
              router
              :to="item.to"
              :key="i"
              v-for="(item, i) in templates"
              exact>

              <v-list-tile-action>
                <v-icon v-html="item.icon"></v-icon>
              </v-list-tile-action>

              <v-list-tile-content>
                <v-list-tile-title v-text="item.title"></v-list-tile-title>
              </v-list-tile-content>

            </v-list-tile>
          </v-list-group>

          <!-- Invoicing -->
          <v-list-group prepend-icon="credit_card">

            <v-list-tile slot="activator">
              <v-list-tile-title>Invoicing</v-list-tile-title>
            </v-list-tile>
            
            <v-list-tile 
              router
              :to="item.to"
              :key="i"
              v-for="(item, i) in invoicing"
              exact>

            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>

            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>

            </v-list-tile>

          </v-list-group>

          <!-- Bottom -->
          <v-list-tile router to="/settings" class="bottom" style="bottom:48px;">
            <v-list-tile-action>
              <v-icon>settings</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Settings</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-list-tile class="bottom">
          <v-btn icon @click.native.stop="miniVariant = !miniVariant" class="abs-center">
            <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
          </v-btn>
        </v-list-tile>

      </v-navigation-drawer>

      <!-- Toolbar -->
      <v-toolbar fixed app :clipped-left="clipped" style="-webkit-app-region: drag; -webkit-user-select: none;">
        <v-toolbar-side-icon @click.native.stop="drawer = !drawer" style="-webkit-app-region: no-drag;"></v-toolbar-side-icon>
        
        <v-toolbar-title v-text="title"></v-toolbar-title>
        <v-toolbar-items>
            <v-btn v-if="offline" flat style="padding-left: 3em;"><v-icon :color="'red lighten-1'">warning</v-icon>offline</v-btn>
        </v-toolbar-items>
        <v-spacer></v-spacer>

        <v-toolbar-side-icon @click="minimize" style="-webkit-app-region: no-drag;"><v-icon small>minimize</v-icon></v-toolbar-side-icon>
        <v-toolbar-side-icon @click="fullscreen" style="-webkit-app-region: no-drag;"><v-icon small v-html="maximizedWindow? 'fullscreen_exit' : 'fullscreen'"></v-icon></v-toolbar-side-icon>
        <v-toolbar-side-icon @click="close" style="-webkit-app-region: no-drag;"><v-icon small color="red lighten-1" >close</v-icon></v-toolbar-side-icon>
        
      </v-toolbar>

      <!-- Content -->
      <v-content>
        <v-container fluid style="padding-top: 17px;">
          <v-slide-y-transition mode="out-in">
            <router-view></router-view>
          </v-slide-y-transition>
        </v-container>
      </v-content>

      <notifications group="new-tmpl"/>
      <notifications group="new-proj"/>
    </template>
    <template v-else style="background-color: red;">
      <v-card width="100%" height="100%">
        <v-img :src="logo" width="480px" aspect-ratio="1" style="margin: 5px auto 5px auto;" mt-5/> 

        <v-card-title primary-title style="padding: 0px;">
          <v-layout column xs12 text-xs-center>

            <v-flex row wrap v-if="userInfo" style="text-align: -webkit-center;">
              <v-flex row wrap>
                <input v-model="userPassword" type="password" autocomplete="off" placeholder="Password" class="el-input__inner" style="width: 320px; text-align: center;" @keyup.enter="login" />
              </v-flex>
              <v-flex row wrap mt-2>
                Seems like you already have an account but your passwords don't match. Please try a different password.
              </v-flex>
            </v-flex>

            <v-flex row wrap v-else style="text-align: -webkit-center;">
              <el-form :model="createAccountForm" ref="createAccountForm" :rules="createAccountRules" status-icon style="width: 320px;">
                <el-form-item prop="pass">
                  <el-input placeholder="Password" type="password" v-model="createAccountForm.pass" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item prop="pass2">
                  <el-input placeholder="Confirm password" type="password" v-model="createAccountForm.pass2" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                  <v-btn  outline depressed color="primary" @click="submitForm('createAccountForm')">Register</v-btn>
                </el-form-item>
              </el-form>
              
            </v-flex>
          </v-layout>

        </v-card-title>

      </v-card>
    </template>

    <v-snackbar v-model="snackbar" :top="true" :right="true" :color="color" :timeout=2000>
      {{snackText}}
      <v-btn dark flat @click="snackbar = false" >Close</v-btn>
    </v-snackbar>
</v-app>
</template>

<style lang="scss">
  .bottom {
    position: absolute;
    bottom: 0;
    margin: auto;
    left: 0;
    right: 0;
  }

  .abs-center {
    position: absolute;
    margin: auto;
    left: 0;
    right: 0; 
  }

  .el-input > input {
    text-align: center;
  }

  #card {
    padding: 0px; 
  }
</style>


<script>
  const {ipcRenderer, remote} = require('electron')
  import db from '../main/scripts/database'
  import username from 'username'
  import bcrypt from 'bcrypt'
  import keytar from 'keytar'

  export default {
    name: 'app',
    beforeCreate: async function () {
      ipcRenderer.on('new-template-added-info', (e, data) => { this.notifyTmpls(data) })
      ipcRenderer.on('new-project-added-info', (e, data) => this.notifyProject(data))
    },
    created: function () {
      ipcRenderer.on('userInfo', (e, userInfo) => {
        this.userInfo = userInfo
        this.checkLoggedIn()
      })
    },
    data: () => ({
      snackText: null,
      color: null,
      snackbar: false,
      clipped: true,
      drawer: true,
      fixed: false,
      maximizedWindow: false,
      loggedIn: false,
      userPassword: '',
      userInfo: null,
      createAccountForm: {
        pass: '',
        pass2: ''
      },
      logo: require('./assets/Logo.png'),
      invoicing: [
        { icon: 'grid_on', title: 'Interface', to: '/invoicing' },
        { icon: 'cloud_upload', title: 'Import data', to: '/importInvoicing' }
      ],
      templates: [
        { icon: 'trip_origin', title: 'Template generator', to: '/templateGenerator'},
        { icon: 'add', title: 'New template', to: '/newTemplate' },
      ],
      miniVariant: true,
      title: 'gentl.'
    }),
    computed: {
      offline: () => {
        return !navigator.onLine
      },
      createAccountRules: function () {
        const pass1 = this.createAccountForm.pass
        return {
          pass: [
            {validator: (rule, value, callback) => {value.length >= 5 ? callback() : callback(new Error('Password needs to be at least 5 characters long.'))}, trigger: 'blur'}
          ],
          pass2: [
            {validator: function (rule, value, callback) {value === pass1 ? callback() : callback(new Error('Passwords don\'t match'))}, trigger: 'change'}
          ]
        }
      },
      createAccountFormValid: function () {
        this.$refs['createAccountForm'].validate(valid => {
          console.log(valid)
          return true
        })
      }
    },
    methods: {
      async notifyTmpls (tmpls) {

        this.$notify({
          group: 'new-tmpl',
          title: 'New template(s) added/modified.',
          text: tmpls.toString()
        });
      },
      async notifyProject (projData) {
        this.$notify({
          group: 'new-proj',
          title: `Project change.`,
          text: `Project ${projData._id} — ${projData.project_pm} was created/updated.`
        });
      },
      close () {
        const window = remote.getCurrentWindow()
        window.close()
      },
      minimize () {
        const window = remote.getCurrentWindow()
        window.minimize()
      },
      fullscreen () {
        const window = remote.getCurrentWindow()
        window.isMaximized()? window.unmaximize() : window.maximize()
        this.maximizedWindow = window.isMaximized()
      },
      async signUpTrigger() {
        console.log(remote.getGlobal('user'))
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            keytar.setPassword('Gentl', username.sync(), this.createAccountForm.pass)
              .then(() => {
                return db.user.upsert(username.sync(), (doc) => {
                  doc.password = bcrypt.hashSync(this.createAccountForm.pass, 10)
                  doc.roles = []
                  return doc
                })
              })
              .then((doc) => {
                return db.user.get(doc.id)
              })
              .then((doc) => {
                this.userInfo = doc
              })
              .then(() => {
                this.checkLoggedIn()
              })
          } else {
            return
          }
        });
      },
      async login () {
        const passMatch = bcrypt.compareSync(this.userPassword, this.userInfo['password'])
        if (passMatch) {
          keytar.setPassword('Gentl', username.sync(), this.userPassword)
            .then(() => this.checkLoggedIn())
          
        } else {
          this.snackbar = true
          this.color = 'error'
          this.snackText = 'Incorrect password.'
        }
      },
      async checkLoggedIn () {
        if (!this.userInfo) return false

        const keychainPass = await keytar.getPassword('Gentl', username.sync())
        if (!keychainPass) return false


        this.loggedIn = bcrypt.compareSync(keychainPass, this.userInfo['password'])
      },
      setUserInfo() {
        this.userInfo = remote.getGlobal('user')
      }
    }
  }

</script>
