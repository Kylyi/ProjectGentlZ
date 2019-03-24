import Vue from 'vue';
import Vuex from 'vuex';

import projects from './modules/projects';
import general from './modules/general';
import user from './modules/user';
import templates from './modules/templates';
import riskRegister from './modules/riskRegister';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    projects,
    general,
    user,
    templates,
    riskRegister
  }
})