import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatedArray } from '../../scripts/build-route-index.mjs';

test('extracts only literal generated JSON despite nested arrays, brackets and escaped quotes in copy',()=>{
  const text='export const pages: SitePage[] = [{"locale":"en","legacyPath":"/FAQ","copy":"A ] [ \\\" quote","blocks":[[1,2]]}];\nexport const extra = doNotExecute();';
  assert.deepEqual(generatedArray(text,'pages'),[{locale:'en',legacyPath:'/FAQ',copy:'A ] [ " quote',blocks:[[1,2]]}]);
});
test('rejects missing, unterminated and executable arrays instead of evaluating content',()=>{
  for(const text of ['const data = [];','export const pages: SitePage[] = [','export const pages: SitePage[] = [doNotExecute()];'])
    assert.throws(()=>generatedArray(text,'pages'));
});
