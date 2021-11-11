import {expect, test} from '@jest/globals'
import {getActions} from '../action'

test('getActions unit test', () => {
  const mock1 = {
    githubToken: 'token',
    syncBranches: 'develop',
    wechatKey: '1234'
  }
  expect(getActions(mock1)).toEqual(['sync', 'send'])
})
