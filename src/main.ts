/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as github from '@actions/github'
import {action} from './action'
const pushPayload: any = github.context.payload
const ref = github.context.ref
// debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

async function run(): Promise<void> {
  try {
    const githubToken: string = core.getInput('githubToken')
    const headBranch: string = core.getInput('headBranch')
    const syncBranches: string = core.getInput('syncBranches')
    const wechatKey: string = core.getInput('wechatKey')

    core.debug(`githubToken:${githubToken}`)
    core.debug(`headBranch:${headBranch}`)
    core.debug(`syncBranches:${syncBranches}`)
    core.debug(`wechatKey:${wechatKey}`)
    const {repository, commits} = pushPayload || {}
    const {full_name} = repository || {}
    const refs = ref.split('/')
    const branch = refs[refs.length - 1]
    const params = {
      repository: full_name,
      githubToken,
      headBranch: headBranch || branch,
      baseBranch: '',
      commits,
      syncBranches,
      wechatKey: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${wechatKey}`
    }
    await action(params)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
