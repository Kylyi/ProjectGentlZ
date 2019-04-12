<template>
  <v-layout column wrap>
    <v-layout row wrap style="padding: 28px 24px; background-color: #424242;">
      <v-flex column shrink>
        <h3 class="display-2 white--text">Import template</h3>
      </v-flex>
      <v-flex column grow>

      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <!-- // Left side -->
        <v-flex column xs5>
          
          <!-- // Input for template name -->
          <v-flex row xs7>
            <v-form v-model="valid" ref="addTemplateForm" v-on:submit.prevent>
                <v-text-field
                  v-model="templateName"
                  :rules="tmplNameRules"
                  label="Template name"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="files.doc.fileName"
                  :rules="fileNameRules"
                  required
                  style="display:none"
                ></v-text-field>

                <v-text-field
                  v-model="files.preview.fileName"
                  :rules="fileNameRules"
                  required
                  style="display:none"
                ></v-text-field>

              </v-form>
          </v-flex>

          <!-- DROPZONE DOC -->
          <v-layout row>
            <v-flex column xs4 @click="getDoc('doc')" style="cursor:pointer">
              <table style=" width: 100%; border: 1px dashed darkgrey" @dragover.prevent @drop="onDrop($event, 'doc')">
                

                <tr v-if="files.doc.fileName" style="height: 45px; vertical-align:middle; text-align:center;">
                  <td><img :src="files.doc.thumbnail"></td>
                </tr>
                <tr v-if="files.doc.fileName" style="height: 15px; vertical-align:middle; text-align:center">
                  <td><span>{{files.doc.fileName}}</span></td>
                </tr>

                <tr v-else style="height: 60px; vertical-align:middle; text-align:center;">
                  <td>Click me or drop a file to import template</td>
                </tr>
              </table>
            </v-flex>

            <v-flex xs8 column ml-3>
              <table style="height:100%; width: 100%">
                <tr v-if="files.doc.filePath" style="vertical-align:middle; text-align:left">
                  <td><span>Filepath: {{files.doc.filePath}}</span></td>
                </tr>
                <tr v-if="files.doc.fileType" style="vertical-align:middle; text-align:left">
                  <td><span>Filetype: {{files.doc.fileType}}</span></td>
                </tr>
              </table>
            </v-flex>
          </v-layout>

          <!-- DROPZONE PREVIEW -->
          <v-layout row mt-3>
            <v-flex column xs4 @click="getDoc('preview')" style="cursor:pointer">
              <table style=" width: 100%; border: 1px dashed darkgrey" @dragover.prevent @drop="onDrop($event, 'preview')">
                

                <tr v-if="files.preview.fileName" style="height: 45px; vertical-align:middle; text-align:center;">
                  <td><img :src="files.preview.thumbnail"></td>
                </tr>
                <tr v-if="files.preview.fileName" style="height: 15px; vertical-align:middle; text-align:center">
                  <td><span>{{files.preview.fileName}}</span></td>
                </tr>

                <tr v-else style="height: 60px; vertical-align:middle; text-align:center;">
                  <td>Click me or drop a file to import template <b>PREVIEW</b></td>
                </tr>
              </table>
            </v-flex>

            <v-flex xs8 column ml-3>
              <table style="height:100%; width: 100%">
                <tr v-if="files.preview.filePath" style="vertical-align:middle; text-align:left">
                  <td><span>Filepath: {{files.preview.filePath}}</span></td>
                </tr>
                <tr v-if="files.preview.fileType" style="vertical-align:middle; text-align:left">
                  <td><span>Filetype: {{files.preview.fileType}}</span></td>
                </tr>
              </table>
            </v-flex>
          </v-layout>

          <!-- BUTTON -->
          <v-flex row mt-3>
            <v-btn style="width:100%; margin:0; padding:0" :disabled="!valid" @click="submit" depressed color="primary"> Insert template </v-btn>
          </v-flex>

          <!-- HOWTO -->
          <v-flex xs12 row mt-4>
            <v-flex row>
              <h5 class="headline primary--text"><b>How to</b></h5>
            </v-flex>
            <v-flex row>
              <p>Basic guidelines and rules to add new templates:
                <ul>
                  <li>Template generator supports <b>.docx</b> and <b>.xlsx</b> formats.</li>
                  <li>Previews of templates support <b>.PNG</b> and <b>JPG</b> formats.</li>
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
                      <b>[Plant], [Network Num], [Network Description], [Project Definition], [Project Manager], [Net Statuts - Engineering Phase], [Net Status from Tasks], [SSO], [Switchgear Type], [Number of Panels], [Packaging], [Project Support Center], [INCO Type], [Buffer Size - Overall Project], [Buffer Size - Enginnering Phase], [Project Progress - Overal Project], [Project Progress - Engineering Phase], [Protections], [Interlocking], [Communication], [Electrical Engineer], [Mechanical Engineer], [Foreman], [Testing], [IED Programmer], [LV Pannel Installation], [FAT Fixed Date], [FAT Actual Date], [Expedition Fixed], [Delivery Date], [Contractual Expedition Date], [Network Note], [Initial BPO], [Initial BPE], [Delivery Date Probability], [Packing fixed], [Contractual Delivery Date], [Invoicing Period], [Tolerated delay], [Actual Delivery Date], [PSD], [ZVR], [ZVL], [Number of Modules], [Project Name], [Customer Name], [Customer Country], [Project Revenues], [Project OB], [Project Panels] </b>
                  </li>
                </ul>
              </p>
            </v-flex>
            
          </v-flex>
        </v-flex>
        
        <!-- RIGHT SIDE -->
        <v-flex column xs7 pl-5>
          <v-flex row><h5 class="headline primary--text"><b>Template example</b></h5></v-flex>
          <v-flex row>
            <v-img style="border: 1px solid black" :contain="true" :src="templateExample"></v-img>
          </v-flex>
        </v-flex>

      </v-layout>     
    </v-container>
  </v-layout>
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
import { mapActions } from 'vuex';

export default {
  data: () => ({
    valid: false,
    templateName: '',
    files: {
      doc: {
        thumbnail: null,
        fileName: null,
        filePath: null,
        fileType: null
      },
      preview: {
        thumbnail: null,
        fileName: null,
        filePath: null,
        fileType: null
      },
    },
    tmplNameRules: [
      v => !!v || 'Template name is required',
      v => /^[^.]*$/.test(v) || 'Template name mustn\'t contain dots'
    ],
    fileNameRules: [
      v => !!v || 'Template name is required'
    ],
    templateExample: require('../renderer/assets/templateExample.png')
  }),
  methods: {
    ...mapActions(['addTemplate', 'notify']),
    clear () {
      this.$refs.addTemplateForm.reset()
    },
    async submit() {
      if (this.$refs.addTemplateForm.validate()) {
        this.addTemplate({
          templateName: this.templateName,
          doc: {
            filePath: this.files.doc.filePath,
            fileName: this.files.doc.fileName,
            fileType: this.files.doc.fileType
          },
          preview: {
            filePath: this.files.preview.filePath,
            fileName: this.files.preview.fileName,
            fileType: this.files.preview.fileType
          }
        })
      }
    },
    async onDrop (e, type) {
      e.stopPropagation()
      e.preventDefault()
      const allowedFiles = type === 'doc' ? ['xlsx', 'docx'] : ['png', 'jpg']

      const files = e.dataTransfer.files
      const fileType = files[0].path.split('.')[1]
      if (!allowedFiles.includes(fileType)) {
        this.notify({
          text: 'This format is unsupported.',
          color: 'error',
          timouet: 3000,
          state: true
        })

        return
      }
      app.getFileIcon(files[0].path, (err, res) => {
        this.files[type].thumbnail = res.toDataURL()
        this.files[type].fileName = files[0].name
        this.files[type].filePath = files[0].path
        this.files[type].fileType = fileType
      })
    },
    getDoc (type) {
      const allowedFiles = type === 'doc' ? ['xlsx', 'docx'] : ['png', 'jpg']

      dialog.showOpenDialog(null, {
          title: 'Get template',
          defaultPath: 'desktop',
          filters: [
            {name: 'Supported formats ' + String(allowedFiles), extensions: allowedFiles}
          ],
          buttonLabel: 'Import template'
        }, (p) => {
          if (p) {

            const icon = app.getFileIcon(p[0], (err, res) => {
              this.files[type].thumbnail = res.toDataURL()
              const len = p[0].split('\\').length
              this.files[type].fileName =  p[0].split('\\')[len-1]
              this.files[type].filePath = p[0]
              this.files[type].fileType = p[0].split('.')[1]

            })
          }
        })
    },
    
  },
  components: { vueDropzone }
}
</script>
