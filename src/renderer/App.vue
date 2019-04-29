<template>
  <v-app id="app">
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

          <!-- Projects -->
          <v-list-group prepend-icon="work_outline">

            <v-list-tile slot="activator">
              <v-list-tile-title>Projects</v-list-tile-title>
            </v-list-tile>
            
            <v-list-tile 
              router
              :to="item.to"
              :key="i"
              v-for="(item, i) in projects"
              exact>

              <v-list-tile-action>
                <v-icon v-html="item.icon"></v-icon>
              </v-list-tile-action>

              <v-list-tile-content>
                <v-list-tile-title v-text="item.title"></v-list-tile-title>
              </v-list-tile-content>

            </v-list-tile>
          </v-list-group>

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
          <v-list-group prepend-icon="business">

            <v-list-tile slot="activator">
              <v-list-tile-title>Risk register</v-list-tile-title>
            </v-list-tile>
            
            <v-list-tile 
              router
              :to="item.to"
              :key="i"
              v-for="(item, i) in riskRegister"
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
          <v-list-tile router to="/userSystem" class="bottom" style="bottom:96px;">
            <v-list-tile-action>
              <v-icon>account_circle</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Organization</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

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
          <v-btn icon @click.native.stop="miniVariant = !miniVariant" class="abs-center" style="margin: auto;">
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
        <span style="padding-left: 14px; -webkit-app-region: no-drag;" v-html="updateState ? updateState : ''"></span>
        <v-spacer></v-spacer>
        <span style="padding-right: 10px;">Last data update: {{invoicingSettings ? invoicingSettings.lastUpdate : 'never'}}</span>
        <v-icon
          v-if="!userInfo.sapUsername"
          color="error"
          title="Please set SAP username in settings."
          style="-webkit-app-region: no-drag;"
        >
          account_circle
        </v-icon>
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
            <td style="width: 19px;"></td>
            <td style="width: 100px; text-align: center;">Info</td>
            <td style="text-align: center; padding: 0 3px;">Actions</td>
            <td style="text-align: center; width: 38px"></td>
          </tr>
          <tr 
            v-for="notif in notifications[notificationsTypeSelected].notifs"
            :key="notif._id" 
            :class="notif.type+'--text'"
            :style="`border: 1px dashed ${notif.type === 'error' ? '#ff5252' : notif.type === 'info' ? '#2196f3' : '#4caf50' }`"
            >
            <td style="width: 19px; text-align: center;">
              <v-icon small color="error" 
                v-html="notif.actionForce ? 'report' : ''" 
                :title="notif.actionForce ? 'Action associated with this notification was forced on you.' : ''" />
              </td>
            <td style="width: 100px; text-align: center;">{{notif.name}}</td>
            <td style="text-align: center; padding: 0 3px;">{{notif.actionDescription}}</td>
            <td style="text-align: center; width: 34px">
              <v-icon v-if="!notif.actionForce" small color="success">check</v-icon>
              <v-icon color="error" small>close</v-icon>
            </td>
          </tr>
        </table>
      </v-layout>


      <!-- Content -->
      <v-content>
        <v-slide-y-transition mode="out-in">
          <router-view></router-view>
        </v-slide-y-transition>
      </v-content>

      <!-- INVOICING SIGNS -->
      <v-menu
        v-model="showSignInfo"
        :position-x="currentPosition.left"
        :position-y="currentPosition.top"
        absolute
        offset-y
        transition="slide-y-transition"
        >
        <v-layout row wrap>
          <v-flex column grow>
            <v-list style="padding: 0;" id="checkSignsList">
              <v-list-tile v-for="comment in signComments" :key="comment.comment">
                <v-list-tile-action>
                  <tr style="vertical-align: middle;">
                    <td style="width: 400px; word-break: break-word; border-bottom: 1px dashed gray;"><span style="color: black;">{{comment.owner}} - {{comment.time}}</span></td>
                  </tr>
                  <tr>
                    <td style="width: 400px; word-break: break-word;">
                      {{comment.comment}}
                    </td>
                  </tr>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-flex>
          <v-flex column shrink style="background-color: white;">
            <v-icon @click="showSignInfo = false" color="error">close</v-icon>
          </v-flex>
        </v-layout>
      </v-menu>

      <!-- CUSTOM DIALOG -->
      <v-dialog
        v-model="customDialog"
        scrollable fullscreen 
        persistent :overlay="false"
        max-width="500px"
        transition="dialog-transition"
        v-html="customDialogBody"
      >
      </v-dialog>

    </template>
    <template v-else>
      <v-system-bar window dark fixed app style="-webkit-app-region: drag; -webkit-user-select: none; z-index: 10;">
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
        <v-icon @click="minimize" style="-webkit-app-region: no-drag;">minimize</v-icon>
        <v-icon @click="fullscreen" v-html="maximizedWindow? 'fullscreen_exit' : 'fullscreen'" style="-webkit-app-region: no-drag;"></v-icon>
        <v-icon @click="close" color="red lighten-1" style="-webkit-app-region: no-drag;">close</v-icon>
      </v-system-bar>

      <v-card width="100%" height="100%">
        <v-img :src="logo" width="480px" aspect-ratio="1" style="margin: 30px auto 5px auto;"/> 

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
                <el-form-item style="margin-bottom: 0px;">
                  <v-btn outline depressed color="primary" @click="submitForm('createAccountForm')">Register</v-btn>
                </el-form-item>
              </el-form>
              
            </v-flex>
          </v-layout>

        </v-card-title>

      </v-card>
    </template>

    <v-snackbar v-model="snackbar.state" :top="true" :right="true" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.text }}
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

  #app {
    background-color: #F5F5F5;
  }

  #app .v-list {
    padding: 0;
  }
</style>


<script>
  const { remote, ipcRenderer} = require('electron')
  import { mapGetters, mapActions } from "vuex";

  export default {
    name: 'app',
    created: function () {
      this.$root.$on('show-sign-info', (e) => setTimeout(() => {
        this.showSignInfo = e
      }), 100)
      
      // ipcRenderer.send('check-for-updates')
      ipcRenderer.on('gentl-update', (e, autoUpdateEvent, info) => {
        if (autoUpdateEvent === 'checking') {
          this.updateState = '<i aria-hidden="true" class="v-icon fas fa-spinner fa-spin theme--dark" title="Checking for updates..."></i>'
        } else if(autoUpdateEvent === 'available') {
           this.updateState = '<i aria-hidden="true" class="v-icon material-icons theme--dark" style="color:#66bb6a;" title="Gentl will be automatically updated once update is downloaded.">warning</i>'
        } else if (autoUpdateEvent === 'unavailable') {
          this.updateState = '<i aria-hidden="true" class="v-icon material-icons theme--dark" style="color:#66bb6a;" title="Gentl is up to date.">check</i>'
        } else if (autoUpdateEvent === 'error') {
          this.updateState = '<i aria-hidden="true" class="v-icon material-icons theme--dark" style="color:red;" title="Cannot check new updates.">error</i>'
        } else if (autoUpdateEvent === 'progress') {
          console.log(progress)
        } else if ('downloaded') {
          this.updateState = 'Update downloaded'
        }

        // this.updateAvailable = info
      })

      this.checkConnectivity(navigator.onLine)
      window.addEventListener('online',  this.changeConnectivity);
      window.addEventListener('offline', this.changeConnectivity);

      const localRevision = localStorage.getItem('revision')
      if (localRevision !== this.revision) {
        localStorage.clear()
        localStorage.setItem('revision', this.revision)
      } 

      // FETCH PROJECTS
      this.fetchAllProjectsBasic();
      this.fetchProjectsDetail();

      // FETCH TEMPLATES
      this.fetchAllTemplates();

      // FETCH INVOICING
      this.fetchInvoicingDetail()

      //FETCH SETTINGS
      this.fetchInvoicingSettings()

    },
    data: () => ({
      drawer: true,
      rightDrawer: false,
      notificationsTypeSelected: 0,
      clipped: true,
      miniVariant: false,
      maximizedWindow: false,
      userPassword: '',
      createAccountForm: {
        pass: '',
        pass2: ''
      },
      updateState: false,
      showSignInfo: false,
      customDialog: false,
      logo: require('./assets/Logo.png'),
      invoicing: [
        { icon: 'grid_on', title: 'Interface', to: '/invoicing' },
        // { icon: 'cloud_upload', title: 'Import data', to: '/importInvoicing' }
      ],
      templates: [
        { icon: 'trip_origin', title: 'Template generator', to: '/templateGenerator'},
        { icon: 'edit', title: 'Manage templates', to: '/newTemplate' },
      ],
      projects: [
        { icon: 'supervised_user_circle', title: 'Delegate projects', to: '/delegateProjects'}
      ],
      riskRegister: [
        { icon: 'grid_on', title: 'Aggregate view', to: '/riskRegisterAggregate'},
        { icon: 'edit', title: 'Manage risk register', to: '/riskRegister'},
      ]
    }),
    computed: {
      ...mapGetters(['offline', 'loggedIn', 'snackbar', 'openAfterGenerate', 'userInfo', 'notifications', 'dbConnectivity', 'password', 'invoicingSettings', 'revision',
      'signComments', 'currentPosition', 'customDialogBody']),
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
      ...mapActions([ 'loginWithPassword', 'registerUser', 'checkConnectivity', 'removeNotification',
      'fetchAllProjectsBasic', 'fetchProjectsDetail', 'fetchAllTemplates', 'fetchInvoicingSettings',
      'fetchInvoicingDetail', 'setShowSignInfo']),
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
      commitAction (notifName, e, action, actionArgs) {
        this.removeNotification(notifName)
        if (e) this.$store.dispatch(action, actionArgs)
      },
      getColor(icon) {
        if (icon === 'arrow_upward') {
          return 'success'
        } else if (icon === 'arrow_downward') {
          return 'warning'
        } else if (icon === 'warning') {
          return 'error'
        } else {
          return 'info'
        }
      }
    }
  }

</script>
