<template>
  <v-layout column wrap id="userSystem">
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Organization</h3>
      </v-flex>

      <!-- MENU -->
      <v-flex column grow offset-xs1 xs4>
      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <v-flex column xs4>
          <v-flex row wrap>
            <v-btn @click="dialogNewPerson = true" color="primary" style="margin: 0;" :disabled="offline">New person</v-btn>
            <v-btn @click="dialogNewGroup = true" color="accent" style="margin: 0;" :disabled="offline">New group</v-btn>
            <v-btn :disabled="offline || !userInfo.roles.includes('hierarchyAdmin')" icon @click="saveHierSettings"><v-icon>save</v-icon></v-btn>
          </v-flex>
          <v-flex row wrap mt-3>

            <!-- VUE TREE -->
            <sl-vue-tree ref="treeView" v-model="nodes" style="width: 100%;" @nodecontextmenu="contextMenu" @select="getUserInfo" :allowMultiselect="false" @drop="setSupervisor">
              <template slot="title" slot-scope="{node}">
                <span>
                  <v-icon small style="padding-right: 10px;" color="white">{{getIcon(node.data.type)}}</v-icon>
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
        <v-flex column shrink pl-5>
          <v-card flat hover v-if="selectedUserInfo" style="width: 500px;">
            <v-img :src="userPlaceholderImage" width="300" height="300" style="margin: auto;" />
            <v-card-title style="margin-top: 16px; padding: 0 16px;"><b style="primary--text">{{selectedUser.title}}</b></v-card-title>
            <v-card-text style="padding: 4px 16px;">
              <v-flex row wrap>
                <v-text-field disabled label="Phone number" :value="'+420'+selectedUserInfo.phone" style="display: inline-block;"></v-text-field>
                <v-text-field disabled label="Email" :value="selectedUserInfo.email+'@cz.abb.com'" style="padding-left: 5px; display: inline-block;"></v-text-field>

                <v-flex row wrap>
                  <b>Roles</b>
                  <v-autocomplete
                    :items="availableRoles"
                    v-model="selectedUserRoles"
                    multiple
                    label="User roles"
                    chips
                    mt-2
                  >
                    <template v-slot:selection="{item}">
                      <v-chip
                        close
                        class="chip--select-multi"
                        @input="removeChip({arr: 'selectedUserRoles', val: item})"
                      >
                        {{item}}
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-flex>
              </v-flex>
              <v-flex row wrap mt-3>
                <v-flex row wrap>
                  <b>Direct subordinates</b>
                </v-flex>
                <v-flex row wrap>
                  <v-chip v-for="(sub, i) in selectedUser.children" :key="i">
                    <v-avatar color="primary" class="white--text">{{ sub.title.split(" ").map(e => e[0]).join("") }}</v-avatar>
                    {{sub.title}}
                  </v-chip>
                </v-flex>
              </v-flex>
              <v-divider></v-divider>
              <v-flex row wrap mt-3>
                <v-alert
                  :value="true"
                  type="info"
                >
                  Subordinates are added automatically accordingly to hierarchy. However, you are able to add more subordinates via the following input. Use PPES username for this functionality to work properly. Duplicates will be deleted.
                </v-alert>
                <v-autocomplete
                  :items="uniquePms"
                  v-model="manuallyAddedSubs"
                  multiple
                  label="Manually added subordinates"
                  chips
                  mt-2
                >
                  <template v-slot:selection="{item}">
                    <v-chip
                      close
                      class="chip--select-multi"
                      @input="removeChip({arr: 'manuallyAddedSubs', val: item})"
                    >
                      {{item}}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-flex>
            </v-card-text>
            <v-card-actions text-xs-right>
              <v-btn icon @click="editUser" :disabled="offline || !userInfo.roles.includes('hierarchyAdmin')"><v-icon>save</v-icon></v-btn>
            </v-card-actions>
          </v-card>
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
            <b class="subheading accent--text">New folder</b>
          </v-flex>
          <v-divider></v-divider>
          <v-flex row wrap>
            <v-form v-model="newGroupForm" @submit.prevent="addGroup" ref="newGroupForm">
              <v-text-field v-model="newGroupName" @submit.prevent="addGroup" label="Group name" hide-details :rules="[v => (v && v.length > 0) || 'Not long enough']"></v-text-field>
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
      <v-container fluid style="background-color: white; min-height: 525px; height: 525px;">
        <v-layout column wrap>
          <v-flex row wrap>
            <b class="subheading accent--text">New person</b>
          </v-flex>
          <v-divider></v-divider>
          <v-flex row wrap mt-3>
            <v-form v-model="newPersonForm" @submit.prevent="addPerson" ref="newPersonForm">
              <v-layout column wrap>
                <v-flex row wrap>
                  <v-text-field v-model="newPersonName" @submit.prevent="addPerson" label="Person name" hide-details :rules="[v => (v && v.length > 0) || 'Not long enough']"></v-text-field>
                </v-flex>
                <v-flex row wrap mt-3>
                  <v-flex row wrap>
                    <v-autocomplete
                      v-model="chosenPerson"
                      :items="allUsers"
                      label="Person's Gentl username"
                      item-text="_id"
                      return-object
                      :rules="[v => (v && v.hasOwnProperty('_id')) || 'Nothing selected']"
                      @submit.prevent="addPerson"
                    >
                    </v-autocomplete>
                    <!-- <multiselect track-by="_id" label="_id" v-model="chosenPerson" placeholder="Person's Gentl username" :options="allUsers"></multiselect> -->
                  </v-flex>
                  <v-flex row wrap>
                    <v-combobox
                      v-model="chosenPersonSapUserName"
                      label="Person's SAP username"
                      :items="uniquePms"
                      persistent-hint
                      hint="If you can't find person's name, you can just add it."
                      :rules="[v => (v && v.length > 0) || 'Nothing selected']"
                      @submit.prevent="addPerson"
                    >
                    </v-combobox>                 
                  </v-flex>
                </v-flex>
              </v-layout>
            </v-form>
          </v-flex>
          <v-flex row wrap mt-4 style="height: 150px;">
            
          </v-flex>
          <v-divider></v-divider>
          <v-flex row wrap mt-4>
            <v-layout row wrap align-end>
              <v-flex column xs6>
                <v-btn @click="dialogNewPerson = false" style="margin: 0;" color="accent">Close</v-btn>
              </v-flex>
              <v-flex column xs6 text-xs-right>
                <v-btn @click="addPerson" style="margin: 0;" color="primary" :disabled="!newPersonForm">Save</v-btn>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </v-dialog>

    <!-- CONTEXT MENU -->
    <v-menu
      v-model="contextMenuShow"
      :position-x="currentPosition.left"
      :position-y="currentPosition.top"
      absolute
      offset-y
      dark
      >
      <v-list style="width: 150px;">
        <v-list-tile @click="promoDemo">
          <v-list-tile-title>{{ promoteDemote }}</v-list-tile-title>
        </v-list-tile>
        <v-divider />
        <v-list-tile @click="removeNode">
          <v-list-tile-title>Remove</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-layout>
</template>

<script>
import SlVueTree from 'sl-vue-tree'
import 'sl-vue-tree/dist/sl-vue-tree.js'
import 'sl-vue-tree/dist/sl-vue-tree-dark.css'
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'UserSystem',
  components: {
    SlVueTree
  },
  async created() {
    if (!this.offline) await this.fetchAllUsers()
    await this.fetchHierarchySettings()
    this.nodes = this.heirarchySettings
  },
  beforeDestroy() {
    
  },
  data: function() {
    return {
      nodes: [],
      dialogNewGroup: false,
      newGroupName: '',
      newGroupForm: false,
      newPersonName: '',
      newPersonForm: false,
      dialogNewPerson: false,
      chosenPerson: null,
      chosenPersonSapUserName: null,
      currentPosition: { left: 0, top: 0 },
      contextMenuShow: false,
      promoteDemote: 'Promote',
      selectedNodePath: [],
      selectedNode: null,
      selectedUser: {},
      userPlaceholderImage: require('../renderer/assets/user-placeholder.jpg'),
      chosenRoles: [],
      availableRoles: ['invoicingAdmin', 'hierarchyAdmin', 'templatesAdmin', 'invoicingReader'],
      manuallyAddedSubs: [],
      selectedUserRoles: []
    }
  },
  methods: {
    ...mapActions(['overwriteHierarchySettings', 'fetchAllUsers', 'fetchHierarchySettings', 'fetchUserInfo', 'partialOverwriteUser', 'changeUsersSubordinates']),
    addGroup() {
      this.nodes.push({title: this.newGroupName, isLeaf: false, data: { type: 'folder' }})
      this.$refs['newGroupForm'].reset()
      this.dialogNewGroup = false
    },
    addPerson() {
      this.nodes.push({
        title: this.newPersonName,
        isLeaf: true,
        data: {
          type: 'person',
          gentlId: this.chosenPerson._id,
          sapUsername: this.chosenPersonSapUserName
        }
      })
      this.$refs['newPersonForm'].reset()
      this.dialogNewPerson = false
    },
    async saveHierSettings() {
      this.overwriteHierarchySettings(this.nodes)
      const usersToUpdate = await this.getAllSubs()
      console.log(this.nodes)
      console.log(usersToUpdate)
      this.changeUsersSubordinates(usersToUpdate)
    },
    getIcon(type) {
      if (type === 'folder') {
        return 'far fa-folder'
      } else if (type === 'group') {
        return 'fas fa-user-tie'
      } else {
        return 'fas fa-user'
      }
    },
    contextMenu(node, e) {
      e.preventDefault()
      if (node.data.type === 'group' || node.data.type === 'person') {
        this.currentPosition = {
          left: e.clientX,
          top: e.clientY
        }
        this.promoteDemote = node.data.type === 'group' ? 'Demote' : 'Promote'
        this.selectedNode = node
        this.selectedNodePath= node.path
        this.contextMenuShow = true
      }
    },
    removeNode() {
      this.$refs['treeView'].remove([this.selectedNodePath])
    },
    promoDemo() {
      const promote = this.promoteDemote === 'Promote'

      this.$refs['treeView'].updateNode(this.selectedNodePath, { isLeaf: !promote, data: Object.assign(this.selectedNode.data, {type: promote ? 'group' : 'person'}) })
    },
    async getUserInfo(e) {
      if (e[0].data.type !== 'folder') {
        if (this.offline) return
        this.selectedUser = e[0]
        await this.fetchUserInfo(e[0].data.gentlId)
        this.manuallyAddedSubs = this.selectedUserInfo.manuallyAddedSubordinates || []
        this.selectedUserRoles = this.selectedUserInfo.roles || []
      }
    },
    removeChip({arr, val}) {
      const idx = this[arr].indexOf(val)
      if (idx !== -1) this[arr].splice(idx, 1)
    },
    editUser() {
      console.log(this.manuallyAddedSubs)
      this.partialOverwriteUser({
        userId: this.selectedUserInfo._id,
        data: {
          manuallyAddedSubordinates: this.manuallyAddedSubs,
          roles: this.selectedUserRoles
        }
      })
    },
    setSupervisor(e) {
      let currentPath
      this.$refs['treeView'].traverse((node, model) => {
        if (node.title === e[0].title) {
          currentPath = node.path
          return false
        } else {
          return true
        }
      })

      let supervisors = []
      const traversePath = currentPath.slice(0, currentPath.length - 1)
      if (traversePath.length > 0) {
        for (let idx = traversePath.length; idx > 0; idx--) {
          const n = this.$refs['treeView'].getNode(traversePath.slice(0, idx))
          // if (n.data.type !== 'folder') {
          //   supervisors.push(n.title)
          // }
          supervisors.push(n.title)
        }   
      }

      this.$refs['treeView'].updateNode(currentPath, {
        data: Object.assign(e[0].data, {supervisors: supervisors})
      })
      

      for (const node of this.$refs['treeView'].getNode(currentPath).children) {
        this.setSupervisor([node])
      }      
    },
    async getAllSubs(e = null) {
      let currentNode = e || this.$refs['treeView'].getFirstNode()
      let usersToUpdate = []
      while (currentNode) {

        let nextNode = this.$refs['treeView'].getNextNode(currentNode.path)
        let allSubs = []
        while (nextNode && nextNode.level > currentNode.level) {
          allSubs.push(nextNode.data.sapUsername)
          nextNode = this.$refs['treeView'].getNextNode(nextNode.path)
        }

        if (currentNode.data.type !== 'folder') {
          usersToUpdate.push({
            _id: currentNode.data.gentlId,
            subordinates: allSubs
          })
        }
        currentNode = this.$refs['treeView'].getNextNode(currentNode.path)
      }

      return usersToUpdate
    }
  },
  computed: {
    ...mapGetters(['allUsers', 'heirarchySettings', 'offline', 'selectedUserInfo', 'uniquePms', 'userInfo'])
  }
}
</script>

<style>
  #userSystem input {
    color: black!important;
  }
</style>
