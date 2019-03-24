<template>
  <v-layout>
    <el-table
      ref="myProjectsTable"
      id="myProjectsTable"
      :data="pmProjectsBasic"
      :default-sort="{prop:'_id', order: 'ascending'}"
      style="width: 100%;"
      max-height="550"
      @expand-change="chooseProjects"
      >
      <el-table-column type="expand">
        <template slot-scope="props">
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
                        <td style="width:60%;">{{((field.dataType === 'date') && (props.row[field.value])) ?  props.row[field.value].substr(0, 10) : props.row[field.value]}}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                <!-- RIGHT SIDE -->
                <td style="width: 96px; max-width: 96px; vertical-align: top; text-align: center;">
                  <v-flex row style="color: #909399;"><b>Actions</b></v-flex>
                  <v-layout id="generateTemplate" wrap @click="generateTemplateTrigger(props.row)"
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
        </template>
      </el-table-column>
      <el-table-column
        prop="Project Definition"
        label="Project #"
        sortable
        align="center"
        width="110"
      />
      <el-table-column
        prop="_id"
        label="Network #"
        sortable
        align="center"
        width="130"
      />
      <el-table-column
        prop="Network Description"
        label="Network description"
        sortable
        min-width="375"
      />
      <el-table-column
        fixed="right"
        label="Info"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          <v-btn v-show="scope.row['FAT Fixed Date']" title="FAT is fixed." icon small style="margin: 0;"><v-icon color="red">whatshot</v-icon></v-btn>
          <v-btn v-show="scope.row['Packing fixed']" title="Packing is fixed." icon small style="margin: 0;"><v-icon color="primary">all_inbox</v-icon></v-btn>
        </template>
      </el-table-column>
    </el-table>
  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  computed: mapGetters(['pmProjectsBasic', 'visibleProjectsDetail', 'generateTemplateDialog']),
  methods: {
    ...mapActions(['openGenerateTemplateDialog', 'chooseProjects', 'fetchProjectsDetail']),
    generateTemplateTrigger(projData) {
      this.chooseProjects(projData)
      this.openGenerateTemplateDialog(true)
    }
  }
}
</script>

<style>

</style>
