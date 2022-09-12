import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore,  Store } from 'vuex'

const packageObj: any = require("./package.json");

const {app} = require('@electron/remote') as typeof import('@electron/remote');

// 为 store state 声明类型
export interface State {
    count: number,
    dataLoc: string,
    version: string
}

// 定义 injection key
export const key: InjectionKey<Store<State>> = Symbol()

// 创建一个新的 store 实例
export const store = createStore<State>({
    state: {
      count: 0,
      dataLoc: `${app.getPath('userData')}/eap-tools-store`,
      version: packageObj.version
    }
})

// 定义自己的 `useStore` 组合式函数
export function useStore () {
    return baseUseStore(key)
  }