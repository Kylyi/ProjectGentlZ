<template>
  <v-layout row>

    <!-- DATA MAPPING -->
    <v-form v-model="forms.userInfoForm">
      <v-flex column shrink>

        <v-layout row>
          <v-flex column grow justify-center>
            <b class="primary--text">Data-mapping</b>
          </v-flex>
          <v-flex column shrink>
            <!-- <v-btn @click="changeUser(sapUsername, sapUsernumber)" flat icon style="margin: 0;"><v-icon>save</v-icon></v-btn> -->
          </v-flex>
        </v-layout>
        <v-divider></v-divider>

        <v-layout column pt-2>
          <v-flex row wrap>
            <v-combobox
              v-model="userInfoLocal.sapUsername"
              label="SAP username"
              :items="uniquePms"
              persistent-hint
              hint="If you can't find your name, you can just add it."
              :rules="[v => (v && v.length > 0) || 'Nothing selected']"
            />
          </v-flex>
          <v-flex row wrap style="padding-top: 6px;">
            <v-text-field
              v-model="userInfoLocal.sapUsernumber"
              label="ABB personal number"
              placeholder="0XXXXXXXX"
              :rules="[v => (v && v.length === 8) || 'Wrong format (must start with 0).']"
            />
          </v-flex>
        </v-layout>

      </v-flex>
    </v-form>

    <!-- SAP LOGIN -->
    <v-form v-model="forms.sapLoginForm" >
      <v-flex column shrink pl-3>
        <v-layout row>
          <v-flex column grow justify-center>
            <b class="primary--text">SAP login</b>
          </v-flex>
          <v-flex column shrink>
            <!-- <v-btn @click="changeSapLogin" flat icon style="margin: 0;"><v-icon>save</v-icon></v-btn> -->
          </v-flex>
        </v-layout>
        <v-divider></v-divider>

        <v-layout column pt-2>
          <v-flex row wrap>
            <v-text-field v-model="sapLogin.username" label="SAP login" required :rules="[v => (v && v.length > 0) || 'Empty.']"></v-text-field>
          </v-flex>
          <v-flex row wrap pt-2>
            <v-text-field
              v-model="sapLogin.password"
              label="SAP password" required
              :rules="[v => (v && v.length > 0) || 'Empty.']"
              :type="sapLogin.passwordType ? 'password' : 'text'"
              @click:append="sapLogin.passwordType = !sapLogin.passwordType"
              :append-icon="sapLogin.passwordType ? 'visibility_off' : 'visibility'"  
            >
            </v-text-field>
          </v-flex>
        </v-layout>  
      </v-flex>
    </v-form>

    <!-- CONTACT -->
    <v-form v-model="forms.contactForm">
      <v-flex column shrink pl-3>
        <v-layout row>
          <v-flex column grow justify-center>
            <b class="primary--text">Contact</b>
          </v-flex>
          <v-flex column shrink>
            <!-- <v-btn @click="changeContactInfo(userEmail, userPhone)" flat icon style="margin: 0;"><v-icon>save</v-icon></v-btn> -->
          </v-flex>
        </v-layout>
        <v-divider></v-divider>

        <v-layout column pt-2>
          <v-flex row>
            <v-text-field suffix="@cz.abb.com" label="Email address" v-model="userInfoLocal.email" validate-on-blur :rules="[v => (v && v.length > 0) || 'Empty']" />
          </v-flex>
          <v-flex row pt-2>
            <v-text-field prefix="+420" mask="###-###-###" label="Phone" v-model="userInfoLocal.phone" validate-on-blur :rules="[v => (v && v.length === 9) || 'Bad format']"/>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-form>

    <!-- PASSWORD CHANGE -->
    <!-- <v-flex column shrink pl-5>
      <v-flex row wrap>
        <v-layout row wrap>
          <v-layout column grow justify-center>
            <b class="primary--text">Change password</b>
          </v-layout>
          <v-layout column shrink>
            <v-btn @click="changePwd" flat icon style="margin: 0;"><v-icon>save</v-icon></v-btn>
          </v-layout>
        </v-layout>
      </v-flex>
      <v-form v-model="changePasswordForm" @submit.prevent="changePwd" ref="changePasswordForm">
        <v-flex row wrap mt-2>
          <v-text-field v-model="oldPassword" type="password" hide-details style="width: 300px;" validate-on-blur :rules="[checkPwd]" required label="Old password"></v-text-field>
        </v-flex>
        <v-flex row wrap mt-2>
          <v-text-field v-model="newPassword" type="password" hide-details style="width: 300px;" validate-on-blur :rules="[pwdLengthRule]" required label="New password"></v-text-field>
        </v-flex>
        <v-flex row wrap mt-2>
          <v-text-field v-model="newPasswordAgain" type="password" hide-details style="width: 300px;" validate-on-blur :rules="[pwdSameRule]" required label="New password again"></v-text-field>
        </v-flex>
      </v-form>
    </v-flex> -->

  </v-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
export default {
  name: 'UserSettings',
  created() {
    this.userInfoLocal = JSON.parse(JSON.stringify(this.$store.getters['userInfo']))
  },
  data: function() {
    return {
      userInfoLocal: {
        sapUsername: '',
        sapUsernumber: '',
        email: '',
        phone: ''
      },
      sapLogin: {
        username: '',
        password: '',
        passwordType: true
      },
      forms: {
        userInfoForm: false,
        sapLoginForm: false,
        contactForm: false,
        changePasswordForm: false
      },
      pwdLengthRule: v => (v && v.length >= 5) || 'Not long enough.',
    }
  },
  computed: {
    ...mapGetters(['uniquePms']),
    pwdSameRule() {
      return (this.newPasswordAgain === this.newPassword) || 'Not the same password.'
    }
  },
  methods: {
    ...mapActions(['partialOverwriteUserLocal', 'setSapLogin']),
    setUserSettings() {
      for (let [key, val] of Object.entries(this.forms)) {
        if (val) {
          if (key === 'userInfoForm') {
            this.partialOverwriteUserLocal({
              sapUsername: this.userInfoLocal.sapUsername,
              sapUsernumber: this.userInfoLocal.sapUsernumber
            })
          } else if (key === 'sapLoginForm') {
            this.setSapLogin(`${this.sapLogin.username}:${this.sapLogin.password}`)
          } else if (key === 'contactForm') {
            this.partialOverwriteUserLocal({
              email: this.userInfoLocal.email,
              phone: this.userInfoLocal.phone
            })
          } else if (key === 'changePasswordForm') {

          }
        }
      }
    }
    // changePwd() {
    //   if (this.forms.changePasswordForm) {
    //     this.changePassword(this.newPassword)
    //     this.$refs.changePasswordForm.reset()
    //   } else {
    //     this.notify({
    //       text: 'Passwords don\'t match',
    //       color: 'error',
    //       state: true,
    //       timeout: 3000
    //     })
    //   }
    // }
  }
}
</script>

<style>

</style>
