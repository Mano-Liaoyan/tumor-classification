import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import axios from "axios";
import qs from "qs";
import vuescroll from 'vuescroll';
import VueLazyLoad from 'vue-lazyload'
import VideoPlayer from 'vue-video-player'
require('vue-video-player/node_modules/video.js/dist/video-js.css')
require('vue-video-player/src/custom-theme.css')

Vue.config.devtools = true;
Vue.config.productionTip = false
Vue.use(Antd)
Vue.use(VideoPlayer)
Vue.use(vuescroll);
Vue.use(VueLazyLoad, {
    // error: '../error.png',
    // 暂时将error图标换成loading
    error: '../loading.gif',
    loading: '../loading.gif'
})

Vue.prototype.$vuescrollConfig = {
    bar: {
        background: '#8c8686'
    }
};

axios.defaults.baseURL = "/api"
axios.interceptors.request.use(
    config => {
        if (localStorage.getItem('token')) {
            config.headers.Authorization = 'Bearer ';
            config.headers.Authorization += localStorage.getItem('token');
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

Vue.prototype.$axios = axios;

new Vue({
    router,
    store,
    render: function (h) {
        return h(App)
    }
}).$mount('#app')
