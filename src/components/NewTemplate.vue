<template>
  <v-layout column wrap>
    <v-layout row wrap style="background-color: #424242; height: 70px;">
      <!-- Title -->
      <v-flex column shrink style="height: 50px; padding: 10px 24px;">
        <h3 class="display-2 white--text">Manage templates</h3>
      </v-flex>
      <v-flex column grow>

      </v-flex>
    </v-layout>

    <v-container fluid>
      <v-layout row wrap>
        <!-- Left side -->
        <v-flex column xs5>
          <v-flex row wrap>
            <v-layout row wrap>
              <v-flex column xs4>
                <v-btn @click="switchPosition('new')" outline
                  :style="`width: 100%; margin: 0; background-color: ${position === 'new' ? 'black!important' : ''}; color: ${position === 'new' ? 'white!important' : ''};`"
                >
                  New template
                </v-btn>
              </v-flex>
              <v-flex column xs4>
                <v-btn @click="switchPosition('edit')" outline
                  :style="`width: 100%; margin: 0; background-color: ${position === 'edit' ? 'black!important' : ''}; color: ${position === 'edit' ? 'white!important' : ''};`"
                >
                  Edit template
                </v-btn>
              </v-flex>
            </v-layout>
          </v-flex>

          <v-flex v-if="position==='edit'" row wrap mt-3>
            <multiselect @input="setTemplateData" track-by="_id" label="_id" v-model="chosenTemplate" :options="allTemplatesBasic" placeholder="Select template"><span slot="noResult">No template found.</span></multiselect>
          </v-flex>

          <!-- Input for template name -->
          <v-flex row mt-3>
            <v-layout column wrap>
              <v-flex row wrap>
                <v-form v-model="valid" ref="addTemplateForm" v-on:submit.prevent>
                  <v-text-field
                    v-model="templateName"
                    :rules="tmplNameRules"
                    label="Template name"
                    required
                    :disabled="position==='edit'"
                  ></v-text-field>

                  <v-combobox
                    v-model="templateCategory"
                    :items="templateCategories"
                    label="Template category"
                    :rules="tmplNameRules"
                    required
                  ></v-combobox>

                  <v-text-field
                    v-model="files.doc.fileName"
                    :rules="fileNameRules"
                    required
                    style="display: none;"
                  ></v-text-field>

                  <v-text-field
                    v-model="files.preview.fileName"
                    :rules="fileNameRules"
                    required
                    style="display:none"
                  ></v-text-field>
                </v-form>
              </v-flex>

              <!-- TEMPLATE DESCRIPTION -->
              <v-flex row wrap mb-3 mt-2>
                <label for="templateDescriptionEditor"><b>Template description</b></label>
                <dx-html-editor
                  id="templateDescriptionEditor"
                  v-model="templateDescription"
                  style="width: 100%; min-height: 200px;"
                >
                  <dx-toolbar>
                    <dx-item format-name="bold"/>
                    <dx-item format-name="italic"/>
                    <dx-item format-name="strike"/>
                    <dx-item format-name="underline"/>
                    <dx-item format-name="separator"/>
                    <dx-item format-name="alignLeft"/>
                    <dx-item format-name="alignCenter"/>
                    <dx-item format-name="alignRight"/>
                    <dx-item format-name="alignJustify"/>
                    <dx-item format-name="separator"/>
                    <dx-item format-name="orderedList"/>
                    <dx-item format-name="bulletList"/>
                    <dx-item format-name="separator"/>
                    <dx-item format-name="color"/>
                    <dx-item format-name="background"/>
                  </dx-toolbar>
                </dx-html-editor>
              </v-flex>
            </v-layout> 
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
            <template v-if="position==='new'">
              <v-btn style="width:100%; margin:0; padding:0" :disabled="!valid || !userInfo.roles.includes('templatesAdmin')" @click="submit" depressed color="primary"> Insert template </v-btn>
            </template>
            <template v-else>
              <v-layout row wrap>
                <v-flex column xs6>
                  <v-btn style="margin:0" depressed color="accent" :disabled="!chosenTemplate || !userInfo.roles.includes('templatesAdmin')" @click="deleteTemplate"> Remove template </v-btn>
                </v-flex>
                <v-flex column xs6 text-xs-right>
                  <v-btn style="margin:0" depressed color="primary" :disabled="!valid || !userInfo.roles.includes('templatesAdmin')" @click="submit"> Edit template </v-btn>
                </v-flex>
              </v-layout>
            </template>
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
                  <li>Previews of templates support <b>.PNG</b> and <b>.JPG</b> formats.</li>
                  <li>Template name doesn't have to be the same as the file name but it's preferred.</li>
                  <li>If you want to properly use the power of template generator, you can add fields that will automatically
                    fill when template gets generated. These fields must be in following format:
                    <ul>
                      <li><b>{field_name}</b> for MS Word files</li>
                      <li><b>${field_name}</b> for MS Excel files</li>
                    </ul>
                    <br>
                    <i>There are many other features, such as iterating over objects in documents or IF->THEN clause. If you have any specific needs, contact your supervisor who will contact Gentl admin.</i>
                    <br><br>
                  </li>
                  <li>
                    Currently, templates support these fields to autofill: <br>
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
import { mapActions, mapGetters } from 'vuex';
import {
  DxHtmlEditor,
  DxToolbar,
  DxItem
} from 'devextreme-vue/html-editor';

export default {
  data: () => ({
    position: 'new',
    templateDescription: '',
    chosenTemplate: null,
    valid: false,
    templateName: '',
    templateCategory: '',
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
      v => !!v || 'This field is required',
      v => /^[^.]*$/.test(v) || 'This field mustn\'t contain dots'
    ],
    fileNameRules: [
      v => !!v || 'File name is required'
    ],
    templateExample: require('../renderer/assets/templateExample.png')
  }),
  computed: {
    ...mapGetters(['allTemplatesBasic', 'userInfo', 'templateCategories'])
  },
  methods: {
    ...mapActions(['addTemplate', 'notify', 'removeTemplate']),
    clear () {
      this.$refs.addTemplateForm.reset()
    },
    async submit() {
      if (this.$refs.addTemplateForm.validate()) {
        this.addTemplate({
          templateName: this.templateName,
          templateDescription: this.templateDescription,
          templateCategory: this.templateCategory,
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
    setTemplateData(e) {
      this.templateDescription = e ? e.templateDescription : ''
      this.templateName = e ? e._id : ''
      this.files.doc.fileName = e ? e.template_name : null
      this.files.preview.fileName = e ? e.template_preview_name : null
      this.templateCategory = e ? e.templateCategory : ''
    },
    async deleteTemplate(e) {
      await this.removeTemplate(this.chosenTemplate._id)
      this.chosenTemplate = null

      this.templateDescription = ''
      this.templateName = ''
      this.files.doc.fileName = null
      this.files.preview.fileName = null
    },
    switchPosition(position) {
      this.chosenTemplate = null
      this.templateDescription = ''
      this.templateName = ''
      this.files.doc.fileName = null
      this.files.preview.fileName = null
      this.templateCategory = ''

      this.position = position
    }
  },
  components: {
    vueDropzone,
    DxHtmlEditor,
    DxToolbar,
    DxItem
  }
}
</script>
