import {  createRouter  , createWebHistory , RouteRecordRaw } from 'vue-router'

const routes:Array<RouteRecordRaw> = [
    {
        path:'/',
        component: ()=> import ('../components/Mines.vue')
    }
]

const route = createRouter({
    routes,
    history:createWebHistory()
})
export default route