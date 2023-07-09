import * as VueRouter from "vue-router"
import websocketPage from '../components/WebsocketSetting.vue'
import adminObsConf from '../components/AdminMiniViewControl.vue'

const routes = [
    {
        path: "/",
        name:'ObserserStatus',
        component: websocketPage
    },
    {
        path: "/admin",
        name:'adminObsConf',
        component: adminObsConf
    }
]
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})

export default router