import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore,  Store } from 'vuex'
import { settings } from './modules/settings'
const {app} = require('@electron/remote') as typeof import('@electron/remote');

const isDev = process.env.IS_DEV == "true" ? true : false;
const packageObj: any = require(`${!isDev ? app.getAppPath() : '.'}/package.json`);

// 为 store state 声明类型
export interface State {
    dataLoc: string,
    version: string,
}

// 定义 injection key
export const key: InjectionKey<Store<State>> = Symbol()

// 创建一个新的 store 实例
export const store = createStore<State>({
    state: {
      dataLoc: `${app.getPath('userData')}/eap-tools-store`,
      version: packageObj.version
    },
    modules: {
      settings
    }
})

// 定义自己的 `useStore` 组合式函数
export function useCustomStore () {
  return baseUseStore(key)
}