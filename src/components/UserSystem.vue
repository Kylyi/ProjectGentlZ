<template>
  <v-layout column wrap>
    <v-layout row wrap align-center style="padding: 4px 24px; background-color: #424242;" >
      <!-- Title -->
      <v-flex column shrink xs7>
        <h3 class="display-2 white--text">Manage users</h3>
      </v-flex>

      <!-- MENU -->
      <v-flex column grow offset-xs1 xs4>
      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <v-flex column xs6>
          <v-flex row wrap>
            <v-btn @click="dialogNewPerson = true" color="primary" style="margin: 0;">New person</v-btn>
            <v-btn @click="dialogNewGroup = true" color="accent" style="margin: 0;">New group</v-btn>
            <v-btn icon @click="saveHierSettings"><v-icon>save</v-icon></v-btn>
          </v-flex>
          <v-flex row wrap mt-3>
            <sl-vue-tree v-model="nodes" style="width: 300px;">
              <template slot="title" slot-scope="{node}">
                <span>
                  <v-icon small style="padding-right: 10px;" color="white">{{ node.isLeaf ? 'fa fa-file': 'fa fa-folder' }}</v-icon>
                  {{ node.title }}
                </span>
              </template>
              <template slot="toggle" slot-scope="{node}">
                <span v-if="!node.isLeaf">
                  <v-icon small color="white">{{ node.isExpanded ? 'fa fa-chevron-down': 'fa fa-chevron-right' }}</v-icon>
                </span>
              </template>
            </sl-vue-tree>
          </v-flex>
        </v-flex>
        <v-flex column xs6>
          
        </v-flex>
        
      </v-layout>
    </v-container>

    <!-- NEW GROUP -->
    <v-dialog
      v-model="dialogNewGroup"
      persistent
      max-width="500px"
      transition="dialog-transition"
      >
      <v-container fluid style="background-color: white;">
        <v-layout column wrap>
          <v-flex row wrap>
            <b class="subheading accent--text">New group</b>
          </v-flex>
          <v-divider></v-divider>
          <v-flex row wrap>
            <v-form v-model="newGroupForm" @submit.stop="addGroup" ref="newGroupForm">
              <v-text-field v-model="newGroupName" label="Group name" hide-details :rules="[v => (v && v.length > 0) || 'Not long enough']"></v-text-field>
            </v-form>
          </v-flex>
          <v-divider></v-divider>
          <v-layout row wrap mt-4>
            <v-flex column xs6>
              <v-btn @click="dialogNewGroup = false" style="margin: 0;" color="accent">Close</v-btn>
            </v-flex>
            <v-flex column xs6 text-xs-right>
              <v-btn @click="addGroup" style="margin: 0;" color="primary" :disabled="!newGroupForm">Save</v-btn>
            </v-flex>
          </v-layout>
        </v-layout>
      </v-container>
    </v-dialog>

    <!-- NEW PERSON -->
    <v-dialog
      v-model="dialogNewPerson"
      persistent
      max-width="500px"
      transition="dialog-transition"
    >
      <v-container fluid style="background-color: white;">
        <v-layout column wrap>
          <v-flex row wrap>
            <b class="subheading accent--text">New person</b>
          </v-flex>
          <v-divider></v-divider>
          <v-flex row wrap mt-2>
            <v-form v-model="newPersonForm" @submit.stop="addGroup" ref="newPersonForm">
              <v-text-field v-model="newPersonName" label="Person name" hide-details :rules="[v => (v && v.length > 0) || 'Not long enough']"></v-text-field>
            </v-form>
          </v-flex>
          <v-divider></v-divider>
          <v-layout row wrap mt-4>
            <v-flex column xs6>
              <v-btn @click="dialogNewPerson = false" style="margin: 0;" color="accent">Close</v-btn>
            </v-flex>
            <v-flex column xs6 text-xs-right>
              <v-btn style="margin: 0;" color="primary" :disabled="!newPersonForm">Save</v-btn>
            </v-flex>
          </v-layout>
        </v-layout>
      </v-container>
    </v-dialog>
  </v-layout>
</template>

<script>
import SlVueTree from 'sl-vue-tree'
import 'sl-vue-tree/dist/sl-vue-tree.js'
import 'sl-vue-tree/dist/sl-vue-tree-dark.css'
import { mapActions } from 'vuex';

export default {
  name: 'UserSystem',
  components: {
    SlVueTree
  },
  created() {

  },
  data: () => {
    return {
      nodes: [
        {title: 'PM', toggle: 'edit', isLeaf: false},
        {title: 'jakub', isLeaf: true}
      ],
      dialogNewGroup: false,
      newGroupName: '',
      newGroupForm: false,
      newPersonName: '',
      newPersonForm: false,
      dialogNewPerson: false
    }
  },
  methods: {
    ...mapActions(['overwriteHierarchySettings']),
    addGroup() {
      this.nodes.push({title: this.newGroupName, isLeaf: false})
      this.$refs['newGroupForm'].reset()
      this.dialogNewGroup = false
    },
    async saveHierSettings() {
      this.overwriteHierarchySettings(this.nodes)
    }
  }
}
</script>

<style>

</style>
