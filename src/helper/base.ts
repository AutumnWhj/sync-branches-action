/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import path from 'path'
export interface ActionInputParams {
  githubToken: string
  syncBranches: string
  repository?: any
  headBranch?: string
  baseBranch?: string
  commits?: any
  wechatKey?: string
}
export const getMergeUrl = (repository: string): string => {
  return `https://api.github.com/repos/${repository}/merges`
}
const getPrUrl = (repository: string): string => {
  return `https://api.github.com/repos/${repository}/pulls`
}

export const formatCommits = (commits: any[]): any[] => {
  return commits
    .map(item => {
      const {message, committer, id, url} = item || {}
      const {name} = committer
      return {
        commitId: id,
        committer: name,
        commitMessage: message,
        commitUrl: url
      }
    })
    .filter(item => item?.committer !== 'GitHub')
}

export const composeMsg = (info: any): string => {
  const {commitsList, head, repository} = info || {}
  if (!commitsList.length) {
    return `🤔项目${repository}，分支${head}环境正在部署~~,无新commit`
  }
  const commitsString: string = commitsList
    .map((item: any) => {
      const {committer, commitMessage, commitUrl} = item || {}
      const message = commitMessage && commitMessage.replace(/\n\n/g, 'good')
      return ` > **${committer}**: [${message}](${commitUrl}) \n`
    })
    .join('')
    .replace(/"/g, '')

  return `#### 🤔项目${repository}，分支${head}环境正在部署~~\n
  <font color="warning">本次构建commit如下：</font>\n
  ${commitsString}`
}

export const sendMsgToWeChat = async (info: any): Promise<void> => {
  const {result, webHook} = info || {}
  try {
    await axios({
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      url: webHook,
      data: result
    })
  } catch (error) {
    console.error('sendMsgToWeChat----', error)
  }
}
export const createPullRequest = async (
  params: ActionInputParams
): Promise<void> => {
  const {repository, githubToken, headBranch, baseBranch, wechatKey} = params

  try {
    await axios({
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'content-type': 'application/json',
        Authorization: `Bearer ${githubToken}`
      },
      url: getPrUrl(repository),
      data: {
        title: `🤔项目${repository}PR：【${headBranch}】分支合并到【${baseBranch}】`,
        base: baseBranch,
        head: headBranch
      }
    })
    const result = {
      msgtype: 'text',
      text: {
        content: `🤔项目${repository}：【${headBranch}】分支合并到【${baseBranch}】有新PR，请及时处理~`,
        mentioned_mobile_list: ['@all']
      }
    }
    await sendMsgToWeChat({result, webHook: wechatKey})
  } catch (error) {
    console.error('createPullRequest--error', error)
  }
}
export const getConfigPathRelative = (
  repoPath: string,
  location: string
): string => {
  return path.resolve(repoPath, location)
}

export const getSyncBranches = (info: any): string => {
  const {syncBranches, packageJson, branch} = info || {}
  if (packageJson[branch]) {
    return `${syncBranches},${packageJson[branch]}`
  }
  return syncBranches
}
export const getTiggerBranches = (info: any): string => {
  const {headBranch, ref} = info || {}
  if (ref.includes('refs/heads/')) {
    return ref.replace('refs/heads/', '')
  }
  if (ref.includes('refs/tags/release/')) {
    const commitMsg = ref.replace('refs/tags/release/', '')
    const index = commitMsg.lastIndexOf('-v')
    return commitMsg.slice(0, index)
  }
  return headBranch
}
