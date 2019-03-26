<template>
  <v-container fluid grid-list-sm>
    <v-layout row wrap>
      <v-flex xs12>
        <h3  class="display-2 primary--text"><span class="tit">New template</span></h3>
      </v-flex>
    </v-layout>

    <v-layout row wrap mt-3>

        <!-- // Left side -->
        <v-flex column xs5>
          
          <!-- // Input for template name -->
          <v-flex row xs7>
            <v-form v-model="valid" ref="addTemplateForm" v-on:submit.prevent>
                <v-text-field
                  v-model="template_name"
                  :rules="tmplNameRules"
                  label="Template name"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="fileName"
                  :rules="fileNameRules"
                  required
                  style="display:none"
                ></v-text-field>

              </v-form>
          </v-flex>

          <!-- // Dropzone -->
          <v-layout row>
            <v-flex column xs4 @click="getDoc" style="cursor:pointer">
              <table style=" width: 100%; border: 1px dashed darkgrey" @dragover.prevent @drop="onDrop">
                

                <tr v-if="fileName" style="height: 45px; vertical-align:middle; text-align:center;">
                  <td><img :src="thumbnail"></td>
                </tr>
                <tr v-if="fileName" style="height: 15px; vertical-align:middle; text-align:center">
                  <td><span>{{fileName}}</span></td>
                </tr>

                <tr v-else style="height: 60px; vertical-align:middle; text-align:center;">
                  <td>Click me or drop a file to import template</td>
                </tr>
              </table>
            </v-flex>

            <v-flex xs8 column ml-3>
              <table style="height:100%; width: 100%">
                <tr v-if="filePath" style="vertical-align:middle; text-align:left">
                  <td><span>Filepath: {{filePath}}</span></td>
                </tr>
                <tr v-if="fileType" style="vertical-align:middle; text-align:left">
                  <td><span>Filetype: {{fileType}}</span></td>
                </tr>
              </table>
            </v-flex>
          </v-layout>

          <!-- // Button -->
          <v-flex row>
            <v-btn style="width:100%; margin:0; padding:0" :disabled="!valid" @click="submit" depressed color="primary"> Insert template </v-btn>
          </v-flex>

          <!-- // How to add new template -->
          <v-flex xs12 row mt-4>
            <v-flex row>
              <h4 class="display-5 primary--text"><span class="tit">How to add new template</span></h4>
            </v-flex>
            <v-flex row>
              <p>Basic guidelines and rules to add new templates:
                <ul>
                  <li>Template generator supports <b>.docx</b> and <b>.xlsx</b> formats.</li>
                  <li>Template name doesn't have to be the same as the file name.</li>
                  <li>If you want to properly use the power of template generator, you can add fields that will automatically
                    fill when generated. These fields must be in following format:
                    <ul>
                      <li><b>{field_name}</b> for MS Word files</li>
                      <li><b>${field_name}</b> for MS Excel files</li>
                    </ul>
                    <br>
                  </li>
                  <li>
                    Currently, templates have these fields to autofill: <br>
                      <b>[Plant], [Network Num], [Network Description], [Project Definition], [Project Manager], [Net Statuts - Engineering Phase], [Net Status from Tasks], [SSO], [Switchgear Type], [Number of Panels], [Packaging], [Project Support Center], [INCO Type], [Buffer Size - Overall Project], [Buffer Size - Enginnering Phase], [Project Progress - Overal Project], [Project Progress - Engineering Phase], [Protections], [Interlocking], [Communication], [Electrical Engineer], [Mechanical Engineer], [Foreman], [Testing], [IED Programmer], [LV Pannel Installation], [FAT Fixed Date], [FAT Actual Date], [Expedition Fixed], [Delivery Date], [Contractual Expedition Date], [Network Note], [Initial BPO], [Initial BPE], [Delivery Date Probability], [Packing fixed], [Contractual Delivery Date], [Invoicing Period], [Tolerated delay], [Actual Delivery Date], [PSD], [ZVR], [ZVL], [Number of Modules] </b>
                  </li>
                </ul>
              </p>
            </v-flex>
            
          </v-flex>
        </v-flex>

        <!-- Right side -->
        <v-layout column xs7 ml-4>
          <v-flex row><h3 class="display-1 primary--text"><span class="tit">Template example</span></h3></v-flex>
          <v-flex row>
            <v-img :contain="true" :src="templateExample"></v-img>
          </v-flex>
        </v-layout>

      <v-snackbar v-model="snackbar" :top="true" :right="true" :color="color" :timeout=2000>
        {{snackText}}
        <v-btn dark flat @click="snackbar = false" > Close </v-btn>
      </v-snackbar>

    </v-layout>
  </v-container>
</template>


<style>
.container.grid-list-sm .layout:not(:only-child) {
  margin: 0
}
</style>


<script>
import vueDropzone from "vue2-dropzone"
const {app, dialog} = require('electron').remote
const fs = require('fs')
const path = require('path')
import db from '../main/scripts/database'
import { mapActions } from 'vuex';

export default {
  data: () => ({
    valid: false,
    template_name: '',
    thumbnail: '',
    fileName: null,
    filePath: null,
    fileType:null,
    snackText: null,
    color: null,
    snackbar: false,
    tmplNameRules: [
      v => !!v || 'Template name is required',
      v => /^[^.]*$/.test(v) || 'Template name mustn\'t contain dots'
    ],
    fileNameRules: [
      v => !!v || 'Template name is required'
    ],
    dropOptions: {
      url: 'https://httpbin.org/post'
    },
    templateExample: require('../renderer/assets/template_example.jpg')
  }),
  methods: {
    ...mapActions(['addTemplate']),
    clear () {
      this.$refs.addTemplateForm.reset()
    },
    async submit() {
      if (this.$refs.addTemplateForm.validate()) {
        this.addTemplate({filePath: this.filePath, fileType: this.fileType, fileName: this.fileName, template_name: this.template_name})
      }
    },
    async onDrop (e) {
      e.stopPropagation()
      e.preventDefault()
      const files = e.dataTransfer.files


      const icon = app.getFileIcon(files[0].path, (err, res) => {
        this.thumbnail = res.toDataURL()
        this.fileName = files[0].name
        this.filePath = files[0].path
        this.fileType = files[0].path.split('.')[1]
      })
    },
    getDoc () {
      dialog.showOpenDialog(null, {
          title: 'Get template',
          defaultPath: 'desktop',
          filters: [
            {name: 'Microsoft word', extensions: ['docx']},
            {name: 'Excel', extensions: ['xlsx']}
          ],
          buttonLabel: 'Import template'
        }, (p) => {
          if (p) {
            const icon = app.getFileIcon(p[0], (err, res) => {
              this.thumbnail = res.toDataURL()
              const len = p[0].split('\\').length
              this.fileName =  p[0].split('\\')[len-1]
              this.filePath = p[0]
              this.fileType = p[0].split('.')[1]

            })
          }
        })
    },
    
  },
  components: { vueDropzone }
}
</script>
