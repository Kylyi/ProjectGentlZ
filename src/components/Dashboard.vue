<template>
  <v-layout column xs12 wrap style="background-color: #EEEEEE; min-height: calc(100vh - 32px)">
    <v-layout row wrap style="background-color: #424242; height: 70px; max-height: 70px;">
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Dashboard</h3>
      </v-flex>
      <v-flex column grow text-xs-right>

        <v-btn fab @click="editMode = !editMode">
          <v-icon color="primary" >
            far fa-edit
          </v-icon>
        </v-btn>
        
      </v-flex>
    </v-layout>

    <v-layout v-show="showDev" row wrap v-shortkey="['ctrl', 'alt', 'o']" @shortkey="showDev = !showDev">
      <v-flex row wrap>
        <v-btn @click="getDevTools">Dev tools</v-btn>
        <!-- <v-btn @click="checkForUpdates">Check for updates</v-btn> -->
        <v-btn @click="switchPccremote">Switch to test mode</v-btn>
        <v-btn @click="addActiveProjects">Add active projects</v-btn>
        <v-btn @click="insertDataPath">Insert data</v-btn>
      </v-flex>

    </v-layout>

    <v-container fluid ref="dashboardContainer">
      <resize-observer @notify="handleResize" />
      <grid-layout
        :layout.sync="dashboardLayout"
        :col-num="12"
        :row-height="30"
        :is-draggable="editMode"
        :is-resizable="editMode"
        :is-mirrored="false"
        :vertical-compact="true"
        :margin="[10, 10]"
        :use-css-transforms="true"
      >

        <grid-item
          :x="dashboardLayout[0].x"
          :y="dashboardLayout[0].y"
          :w="dashboardLayout[0].w"
          :h="dashboardLayout[0].h"
          :i="dashboardLayout[0].i"
          :class="editMode ? 'editMode' : ''"
          style="display: flex;"
          @resized="layoutChanged"
          @moved="layoutChanged"
        >
            <span v-if="editMode" style="margin: auto; font-size: x-large; font-style: italic;">Projects overview</span>
            <template v-else>
              <projects-grid />
            </template>
        </grid-item>

        <grid-item
          :x="dashboardLayout[1].x"
          :y="dashboardLayout[1].y"
          :w="dashboardLayout[1].w"
          :h="dashboardLayout[1].h"
          :i="dashboardLayout[1].i"
          :class="editMode ? 'editMode' : ''"
          style="display: flex;"
          @resized="layoutChanged"
          @moved="layoutChanged"
        >
            <span v-if="editMode" style="margin: auto; font-size: x-large; font-style: italic;">Risk register quickview</span>
            <template v-else>
              <v-layout row wrap v-if="chosenProjects.length > 0 && chosenProjects[0].riskRegisterBilance">
                <risk-register :chart-data="chosenProjects[0].riskRegisterBilance.chartData" />
              </v-layout>
              <v-layout v-else-if="chosenProjects.length > 0 && !chosenProjects[0].hasOwnProperty('riskRegisterBilance')">This feature is available only in Projects mode.</v-layout>
              <v-layout v-else>No risk register available.</v-layout>
            </template>
        </grid-item>

        <grid-item
          :x="dashboardLayout[2].x"
          :y="dashboardLayout[2].y"
          :w="dashboardLayout[2].w"
          :h="dashboardLayout[2].h"
          :i="dashboardLayout[2].i"
          :class="editMode ? 'editMode' : ''"
          style="display: flex;"
          @resized="layoutChanged"
          @moved="layoutChanged"
        >
            <span v-if="editMode" style="margin: auto; font-size: x-large; font-style: italic;">Tasks</span>
            <template v-else>
              <tasks />
            </template>
        </grid-item>
      </grid-layout>
    </v-container>

  </v-layout>
</template>

<script>
import ProjectsGrid from './Dashboard/ProjectsGrid'
import RiskRegister from './Dashboard/RiskRegister'
import Tasks from './Dashboard/Tasks'
import { mapGetters, mapActions } from "vuex";
import { ipcRenderer } from 'electron'
import { GridLayout, GridItem } from 'vue-grid-layout'
import _ from 'underscore'

export default {
  name: 'Dashboard',
  created() {
    const updateContentWindowSize =  (size) => {
      this.setContentWindowSize(size)
      this.$root.$emit('contentWindowResized')
    }

    this.updateContentWindowSize = _.debounce(updateContentWindowSize, 100)
    this.chooseProjects([])
  },
  data: () => {
    return {
      showDev: false,
      editMode: false,
      activeComponent: null,
      dashboardLayout: JSON.parse(localStorage.getItem('dashboardLayout')) || [
        { x: 0, y: 0, w: 9, h: 22, i: '0', name: 'projectsGrid' },
        { x: 9, y: 0, w: 3, h: 11, i: '1', name: 'riskRegisterQuickview' },
        { x: 9, y: 11, w: 3, h: 11, i: '2', name: 'tasksQuickview' }
      ]
    }
  },
  components: {
    ProjectsGrid,
    RiskRegister,
    Tasks,
    GridLayout,
    GridItem
  },
  methods: {
    ...mapActions(['addActiveProjects', 'setContentWindowSize', 'chooseProjects', 'switchPccremote', 'addActiveProjects', 'insertData']),
    getDevTools() {
      ipcRenderer.send('showDevTools')
    },
    checkForUpdates() {
      ipcRenderer.send('check-for-updates')
    },
    layoutChanged(idx, newH, newW, newHPx, newWPx) {
      localStorage.setItem('dashboardLayout', JSON.stringify(this.dashboardLayout))
    },
    handleResize() {
      this.updateContentWindowSize({
        width: this.$refs['dashboardContainer'].clientWidth - 48,
        height: this.$refs['dashboardContainer'].clientHeight - 48
      })
    },
    insertDataPath() {
      const path = prompt('Path')
      this.insertData(path)
    }
  },
  computed: {
    ...mapGetters(['chosenProjects', 'taskInfo', 'contentWindowSize']),
  }
}
</script>

<style>
  .vdr {
    border: none!important;
  }

  .editMode {
    border: 1px dashed black;
    align-items: center;
  }
</style>
