/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import {mergeBranch, sendMsg} from './helper'
import {ActionInputParams} from './helper/base'

export const getActionsFn = (key: string): Function => {
  const map: any = {
    sync: mergeBranch,
    send: sendMsg
  }
  return map[key]
}
export const getActions = (params: ActionInputParams): string[] => {
  const {syncBranches, wechatKey} = params
  const actions = []
  if (syncBranches) {
    actions.push('sync')
  }
  if (wechatKey) {
    actions.push('send')
  }
  return actions
}

export const action = async (params: ActionInputParams): Promise<void> => {
  const actions = getActions(params)
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < actions.length; i++) {
    const key = actions[i]
    try {
      const fn = getActionsFn(key)
      await fn(params)
    } catch (error) {
      console.error('执行action出错~')
      if (error instanceof Error) core.setFailed(error.message)
    }
  }
}
