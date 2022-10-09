import { Module } from "vuex"
import { State } from "../index"

export interface ServerState{
    sharePath: string,
    uploadPath: string,
    port: number,
}
export const server: Module<ServerState, State> = {
    namespaced: true,
    state: () => ({
        sharePath: localStorage.getItem('server/sharePath') || '',
        uploadPath: localStorage.getItem('server/uploadPath') || '',
        port: parseInt(localStorage.getItem('server/port') || '8081'),
    }),
    mutations: {
        updateSharePath(state: ServerState, sharePath: string){
            state.sharePath = sharePath
            localStorage.setItem('server/sharePath', sharePath)
        },
        updateUploadPath(state: ServerState, uploadPath: string){
            state.uploadPath = uploadPath
            localStorage.setItem('server/uploadPath', uploadPath)
        },
        updatePort(state: ServerState, port: number){
            state.port = port
            localStorage.setItem('server/port', port + '')
        },
    },
    actions: {
        
    },
    getters: {
        sharePath(state: ServerState){
            return state.sharePath
        },
        uploadPath(state: ServerState){
            return state.uploadPath
        },
        port(state: ServerState){
            return state.port
        },
    }
}
