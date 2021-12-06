/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as github from '@actions/github'
import {
  getBranchByHead,
  getBranchByTag,
  getConfigPathRelative,
  getSyncBranches
} from './helper/base'
import {action} from './action'
// debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
const repoPath: any = process.env.GITHUB_WORKSPACE
const pushPayload: any = github.context.payload
const ref = github.context.ref
console.log('github.context', github.context)

async function run(): Promise<void> {
  try {
    const configFilePath = getConfigPathRelative(repoPath, 'package.json')
    console.log('configFilePath-----', configFilePath)
    const configJson: any = await import(configFilePath)
    const {syncBranches: packageJson} = configJson || {}
    console.log('packageJson-----', packageJson)
    const githubToken: string = core.getInput('githubToken')
    const headBranch: string = core.getInput('headBranch')
    const syncBranches: string = core.getInput('syncBranches')
    const wechatKey: string = core.getInput('wechatKey')

    const resultHeadBranch =
      headBranch || getBranchByHead(ref) || getBranchByTag(ref)

    console.log('resultHeadBranch-----', resultHeadBranch)
    core.debug(`githubToken:${githubToken}`)
    core.debug(`headBranch:${headBranch}`)
    core.debug(`syncBranches:${syncBranches}`)
    core.debug(`wechatKey:${wechatKey}`)

    const {repository, commits} = pushPayload || {}
    const params = {
      repository: repository?.full_name,
      githubToken,
      headBranch: resultHeadBranch,
      commits: commits.reverse(),
      syncBranches: getSyncBranches({
        syncBranches,
        packageJson,
        branch: resultHeadBranch
      }),
      wechatKey: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${wechatKey}`
    }
    await action(params)

    // const {full_name} = repository || {}
    // const [, outRepository] = full_name.split('/')
    console.log('resultHeadBranch-----', resultHeadBranch)

    // const exportBranch = getExportBranch({headBranch, ref})
    // console.log('exportBranch----', exportBranch)
    // console.log('outRepository----', outRepository)

    // core.exportVariable('BRANCH', resultHeadBranch)
    // core.exportVariable('TAGBRANCH', exportBranch)
    // core.exportVariable('REPOSITORY', outRepository)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
