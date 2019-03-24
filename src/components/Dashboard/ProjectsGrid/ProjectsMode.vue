<template>
  <v-layout>
    <el-table
      ref="myProjectsTable"
      id="myProjectsTable"
      :data="pmProjectsNetMode"
      :default-sort="{prop:'_id', order: 'ascending'}"
      style="width: 100%;"
      max-height="550"
      >
      <el-table-column type="expand">
        <template slot-scope="props">
            <v-tabs
              dark
              show-arrows
              height="22"
              grow
              @change="chnageProjectSelection($event, props.row)"
            >
              <v-tab
                v-for="net in props.row.nets"
                :key="net.net_num"
              >
                {{net.net_num}}
              </v-tab>

              <v-tab-item
                v-for="net in props.row.nets"
                :key="net.net_num"
              >
                <v-container>
                  <table style="width: 100%;">
                    <tr>
                      <!-- LEFT SIDE -->
                      <td>
                        <table class="detailTable" style="width: 100%;">
                          <thead>
                            <tr>
                              <td><b>Field</b></td>
                              <td><b>Value</b></td>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="field in visibleProjectsDetail" :key="field.value">
                              <td style="width:40%;">{{field.name}}</td>
                              <td style="width:60%;">{{net.net_info[0].task_info[field.value]}}</td>
                            </tr>
                          </tbody>
                        </table>
                      </td>

                      <!-- RIGHT SIDE -->
                      <td style="width: 120px; max-wdith: 120px; vertical-align: top; text-align: center;">
                        <v-flex row style="color: #909399;"><b>Actions</b></v-flex>
                        <v-layout id="generateTemplate" wrap @click="generateTemplateTrigger(net.net_info[0].task_info)"
                          style="cursor: pointer;  margin-left: 2px; padding: 2px; border: 1px solid #7e57c2; border-radius: 5px;">
                          <v-flex row><v-icon color="deep-purple lighten-1">trip_origin</v-icon></v-flex>
                          <v-flex row class="deep-purple--text lighten-1">Generate template</v-flex>
                        </v-layout>
                        <v-layout id="generateTemplate" wrap
                          mt-1
                          style="cursor: pointer;  margin-left: 2px; padding: 2px; border: 1px solid #7e57c2; border-radius: 5px;"
                        >
                          <a href="#/riskRegister" style="text-decoration: none;">
                            <v-flex row><v-icon color="deep-purple lighten-1">business</v-icon></v-flex>
                            <v-flex row class="deep-purple--text lighten-1">Manage risk register</v-flex>
                          </a>
                        </v-layout>
                      </td>
                    </tr>
                  </table>
                </v-container>
              </v-tab-item>
              
            </v-tabs>     
        </template>


      </el-table-column>
      <el-table-column
        prop="project_id"
        label="Project #"
        sortable
        align="left"
        width="110"
      />
      <el-table-column
        prop="electrical_eng"
        label="Electrical ENG"
        sortable
        align="left"
        min-width="150"
      />
      <el-table-column
        prop="foreman"
        label="Foreman"
        sortable
        align="left"
        min-width="150"
      />
      <el-table-column
        prop="zvl"
        label="ZVL"
        sortable
        align="left"
        width="120"
      />
      <el-table-column
        prop="zvr"
        label="ZVR"
        sortable
        align="left"
        width="120"
      />
      <el-table-column
        prop="SSO"
        label="SSO"
        sortable
        align="left"
        width="90"
      />
    </el-table>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  data: () => {
    return {
      selectedNet: 0
    }
  },
  computed: mapGetters(['pmProjectsNetMode', 'visibleProjectsDetail', 'generateTemplateDialog']),
  methods: {
    ...mapActions(['openGenerateTemplateDialog', 'chooseProjects', 'fetchProjectsDetail']),
    generateTemplateTrigger(projData) {
      this.chooseProjects(projData)
      this.openGenerateTemplateDialog(true)
    },
    chnageProjectSelection(net_num, proj) {
      this.chooseProjects(proj.nets[net_num].net_info[0].task_info)
    }
  }
}
</script>

<style>
#myProjectsTable > div.el-table__body-wrapper.is-scrolling-none > table > tbody > tr:nth-child(2) > td > div > div.v-window > div > div:nth-child(1) > div > table > tr > td {
  background-color: transparent;
}
</style>