<template>
  <v-dialog
    v-model="sapCommentDialog"
    scrollable 
    persistent
    max-width="500px"
    transition="dialog-transition"
  >
    <v-container fluid style="background-color: white;">
      <v-layout column>
        <v-flex row>
          <b>New comment</b>
          <v-textarea v-model="comment" rows="2" placeholder="Comment" hide-details />
        </v-flex>
        <v-flex row pt-3>
          <v-layout row>
            <v-flex column xs6><v-btn style="margin: 0;" color="accent" @click="sapCommentDialog = false">close</v-btn></v-flex>
            <v-flex column xs6 text-xs-right><v-btn style="margin: 0;" color="primary" @click="sendNewComment">submit</v-btn></v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';
export default {
  name: 'SapComment',
  props: ['netNum'],
  data() {
    return {
      sapCommentDialog: false,
      comment: ''
    }
  },
  methods: {
    ...mapActions(['addPccComment']),
    sendNewComment() {
      this.addPccComment({
        netNum: this.netNum,
        comment: this.comment
      })
      this.sapCommentDialog = false
    }
  }
}
</script>

<style>

</style>
