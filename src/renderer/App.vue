<template>
  <v-app>
    <v-navigation-drawer
      fixed
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      app>
      <v-list>
        <!-- Dashboard -->
        <v-list-tile router to="/">
          <v-list-tile-action>
            <v-icon>dashboard</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Dash</v-list-tile-title>
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
      <v-spacer></v-spacer>

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
</style>


<script>
  const {ipcRenderer} = require('electron')
  const remote = require('electron').remote
  import db from '../main/scripts/database'

  export default {
    name: 'app',
    beforeCreate: async function () {
      ipcRenderer.on('new-template-added-info', (e, data) => { this.notifyTmpls(data) })
      ipcRenderer.on('new-project-added-info', (e, data) => this.notifyProject(data))
    },
    data: () => ({
      clipped: true,
      drawer: true,
      fixed: false,
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
          text: `Project ${projData._id} — ${projData.project_name} was created/updated.`
        });
      },
      close () {
        const window = remote.getCurrentWindow()
        window.close()
      }
    }
  }

</script>
