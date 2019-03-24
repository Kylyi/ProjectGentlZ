<template>
  <div class="text-xs-center">
    <v-dialog v-model="generateTemplateDialog" width="500" persistent>
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Generate template
        </v-card-title>

        <v-card-text style="height: 250px;">
          <template-selector />
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="error" flat @click="openGenerateTemplateDialog(false)">Close</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" flat @click="generateTemplate('true')" > Generate </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import TemplateSelector from './TemplateSelector'
import { mapGetters, mapActions } from "vuex";
export default {
  components: { TemplateSelector },
  computed: mapGetters(['generateTemplateDialog']),
  methods: {
    ...mapActions(['generateTemplate', 'openGenerateTemplateDialog'])
  }
}
</script>

<style>

</style>
