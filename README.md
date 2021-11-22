# 自动分支同步Action

在Github Actions使用此Action，目标分支更新之后，会把代码自动同步到对应分支，若对应分支有规则限制，则会自动生成一条PR；

- 支持传参方式进行同步。
- 支持在package.json配置进行同步。
- 支持企业微信消息提醒，当前同步的分支以及commit。

## 参数

### githubToken

必填！
用于Github Rest API 的调用。

### headBranch

可选！默认为当前更新的分支
作为合并中的head分支。

### syncBranches

可选！head分支更新需要同步到的分支
可填多个分支，如`"develop,pre-master,pre-master2"`

### wechatKey

企业微信机器人的key

## 例子

.yml

```javascript
- name: Sync Branches and notify WeChat message start
  uses: AutumnWhj/sync-branches-action@master
  with:
  githubToken: ${{ secrets.ACCESS_TOKEN }}
  wechatKey: ${{ secrets.WORK_WECHAT_GITHUB_ROBOT_KEY }}
```

package.json

```bash
"syncBranches": {
  "master": "pre-master",
  "pre-master": "pre-master2, pre-master3",
  "pre-master2": "develop"
}
```
