/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as github from '@actions/github'
import {action} from './action'
import {getConfigPathRelative} from './helper/base'
// debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
const repoPath: any = process.env.GITHUB_WORKSPACE
const pushPayload: any = github.context.payload
const ref = github.context.ref

async function run(): Promise<void> {
  try {
    const configFilePath = getConfigPathRelative(repoPath, 'package.json')
    const configJson: any = await import(configFilePath)
    const {syncBranches: packageJson} = configJson || {}
    console.log('packageJson-----', packageJson)
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
    const branch = headBranch || refs[refs.length - 1]
    console.log('branch-----', branch)
    const params = {
      repository: full_name,
      githubToken,
      headBranch: branch,
      baseBranch: '',
      commits: commits.reverse(),
      syncBranches: `${syncBranches},${packageJson[branch]}`,
      wechatKey: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${wechatKey}`
    }
    await action(params)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
