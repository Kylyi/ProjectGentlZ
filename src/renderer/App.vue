<template>
  <v-app>
    <template v-if="loggedIn">
      <!-- Navigation drawer LEFT -->
      <v-navigation-drawer
        fixed
        :mini-variant="miniVariant"
        :clipped="clipped"
        v-model="drawer"
        app
        dark
        width="250"
        mini-variant-width="80"
        >
        <v-list>
          <!-- Dashboard -->
          <v-list-tile router to="/">
            <v-list-tile-action>
              <v-icon>dashboard</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Dashboard</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

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

          <!-- Risk Register -->
          <v-list-tile router to="/riskRegister">
            <v-list-tile-action>
              <v-icon>business</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Risk register</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>


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


      <!-- Navigation drawer RIGHT -->
      <!-- <v-navigation-drawer
      >
      </v-navigation-drawer> -->

      <!-- System Bar -->
      <v-system-bar window dark fixed app style="-webkit-app-region: drag; -webkit-user-select: none; z-index: 10;">
        <v-icon @click="drawer = !drawer" style="-webkit-app-region: no-drag; margin-left:20px;">menu</v-icon>
        <font face="Lucida Handwriting" style="margin-left: 1em;">Gentl.</font>
        <v-spacer></v-spacer>
        <v-icon
          :title="`Database ${!offline ? 'is':'is NOT'} synced across all users.`"
          style="-webkit-app-region: no-drag;"
          v-html="offline ? 'sync_disabled' : 'sync'"
          :color="offline ? 'error' : ''" />
        <v-icon
          :title="`ABB database ${dbConnectivity? 'is':'is NOT'} connected`"
          style="-webkit-app-region: no-drag;"
          v-html="dbConnectivity ? 'power' : 'power_off'" 
          :color="dbConnectivity ? '' : 'error'" 
        />
        <v-icon
          @click="rightDrawer = !rightDrawer"
          style="-webkit-app-region: no-drag;"
          v-html="notifications[1].notifs.length > 0 ? 'notification_important' : 'notifications'"
          :color="notifications[1].notifs.length > 0 ? 'error' : ''"
        />
        <v-icon @click="minimize" style="-webkit-app-region: no-drag;">minimize</v-icon>
        <v-icon @click="fullscreen" v-html="maximizedWindow? 'fullscreen_exit' : 'fullscreen'" style="-webkit-app-region: no-drag;"></v-icon>
        <v-icon @click="close" color="red lighten-1" style="-webkit-app-region: no-drag;">close</v-icon>
      </v-system-bar>

      <!-- Notification bar -->
      <v-layout v-show="rightDrawer" id="notificationBar" justify-start column>
        <div>
          <v-btn-toggle v-model="notificationsTypeSelected" dark mandatory style="width: 100%;">
            <v-btn flat style="width:25%;"> All </v-btn>
            <v-btn flat style="width:25%;"> <v-icon color="error">warning</v-icon> </v-btn>
            <v-btn flat style="width:25%;"> <v-icon color="info">info</v-icon> </v-btn>
            <v-btn flat style="width:25%;"> <v-icon color="success">check</v-icon> </v-btn>
          </v-btn-toggle>
        </div>
        <table style="cursor: default; border-collapse: collapse;">
          <tr v-show="notifications[notificationsTypeSelected].notifs.length > 0">
            <td style="width: 100px; text-align: center;">Info</td>
            <td style="text-align: center; padding: 0 3px;">Actions</td>
            <td style="text-align: center; width: 34px"></td>
          </tr>
          <tr v-for="notif in notifications[notificationsTypeSelected].notifs" :key="notif._id" :class="notif.type+'--text'">
            <td style="width: 100px; text-align: center;">{{notif.name}}</td>
            <td style="text-align: center; padding: 0 3px;">{{notif.actionInfo}}</td>
            <td style="text-align: center; width: 34px"><v-icon v-if="!notif.actionDone" small color="success" @click="commitAction(notif._id, true, notif.action, notif.actionArgs)">check</v-icon><v-icon @click="commitAction(notif._id, false)" color="error" small>close</v-icon></td>
          </tr>
        </table>
      </v-layout>


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
    <template v-else>
      <v-card width="100%" height="100%">
        <v-img :src="logo" width="480px" aspect-ratio="1" style="margin: 5px auto 5px auto;" mt-5/> 

        <v-card-title primary-title style="padding: 0px;">
          <v-layout column xs12 text-xs-center>

            <v-flex row wrap v-if="password" style="text-align: -webkit-center;">
              <v-flex row wrap>
                <input v-model="userPassword" type="password" autocomplete="off" placeholder="Password" class="el-input__inner" style="width: 320px; text-align: center;" @keyup.enter="callLogin" />
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

    <v-snackbar v-model="snackbar.state" :top="true" :right="true" :color="snackbar.color" :timeout=2000>
      {{snackbar.text}}
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

  #notificationBar {
    position: fixed;
    right: 0;
    width: 300px;
    background-color: #424242;
    height: calc(100% - 32px);
    margin-top: 32px;
    z-index: 50;
    color: #fff;
  }
</style>


<script>
  const {ipcRenderer, remote, shell} = require('electron')
  import { mapGetters, mapActions } from "vuex";
  import db from '../main/scripts/database'

  export default {
    name: 'app',
    beforeCreate: async function () {
      ipcRenderer.on('new-template-added-info', (e, data) => this.notifyTmpls(data))
      ipcRenderer.on('new-project-added-info', (e, data) => this.notifyProject(data))
    },
    created: function () {
      ipcRenderer.on('userInfo', (e, userInfo) => {
        this.checkLoggedIn(userInfo)
      })

      ipcRenderer.on('generated', (e, p) => {
        this.notify({
          text: 'Template was successfuly generated.',
          color: 'success',
          state: true
        })

        if (this.openAfterGenerate === 'yes') shell.openItem(p)
      })

      this.checkConnectivity(navigator.onLine)
      window.addEventListener('online',  this.changeConnectivity);
      window.addEventListener('offline', this.changeConnectivity);
      this.changeOpenAfterGenerate()
      this.changeGeneratorSelectionMode()
    },
    data: () => ({
      drawer: true,
      rightDrawer: false,
      notificationsTypeSelected: 0,
      clipped: true,
      miniVariant: true,
      maximizedWindow: false,
      userPassword: '',
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
      ]
    }),
    computed: {
      ...mapGetters(['offline', 'loggedIn', 'snackbar', 'openAfterGenerate', 'userInfo', 'notifications', 'dbConnectivity', 'password']),
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
      ...mapActions(['checkLoggedIn', 'loginWithPassword', 'registerUser', 'changeOpenAfterGenerate', 'notify', 'checkConnectivity', 'removeNotification', 'changeGeneratorSelectionMode']),
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
      callLogin() {
        this.loginWithPassword(this.userPassword)
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
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.registerUser(this.createAccountForm.pass)
          }
        });
      },
      async changeConnectivity(e) {
        this.checkConnectivity(e.type === 'online')
      },
      commitAction (notificationId, e, action, actionArgs) {
        this.removeNotification(notificationId)
        if (e) this.$store.dispatch(action, actionArgs)
      }
    }
  }

</script>
