import { Module } from "vuex"
import { State } from "../index"

export interface SettingState{
    token: string,
    userName: string,
    eapLogPath: string,
}
export const settings: Module<SettingState, State> = {
    namespaced: true,
    state: () => ({
        token: localStorage.getItem('token') || '',
        userName: localStorage.getItem('userName') || '',
        menu: JSON.parse(localStorage.getItem('menu') || '[]'),
        eapLogPath:  localStorage.getItem('settings/eapLogPath') || '',
    }),
    mutations: {
        updateToken(state: SettingState, token: string) {
            // 变更状态
            state.token = token
            localStorage.setItem('token', token)
        },
        updateUserName(state: SettingState, userName: string){
            state.userName = userName
            localStorage.setItem('userName', userName)
        },
        updateEapLogPath(state: SettingState, eapLogPath: string){
            state.eapLogPath = eapLogPath
            localStorage.setItem('settings/eapLogPath', eapLogPath)
        },
    },
    actions: { 
        
    },
    getters: {
        token(state: SettingState){
            return state.token
        },
        userName(state: SettingState){
            return state.userName
        },
        eapLogPath(state: SettingState){
            return state.eapLogPath
        },
    }
}
