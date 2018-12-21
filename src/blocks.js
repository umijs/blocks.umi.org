const { join } = require('path');
const Github = require('github-api');
const debug = require('debug')(`umi:blocks`);
const { token } = require('../config.local');

const gh = new Github({
  token,
});
const repo = gh.getRepo('umijs', 'umi-blocks');

exports.getBlocks = async function getBlocks(path = '') {
  debug(`get block ${path}`);
  const { data } = await repo.getContents('master', path);

  const havePackageJson = data.filter(item => item.name === 'package.json').length > 0;
  if (path !== '' && havePackageJson) {
    return {
      type: 'block',
      path,
    };
  }

  const blocks = [];
  const dirs = data.filter(item => item.type === 'dir' && !item.name.startsWith('_'));
  for (const dir of dirs) {
    debug(`get child block, dirname: ${dir.name}, path: ${path}`);
    if (path !== '') {
      blocks.push({
        type: 'block',
        path: dir.name,
      });
    } else {
      const block = await getBlocks(join(path, dir.name));
      if (block) {
        blocks.push(block);
      }
    }
  }

  if (path === '') {
    return blocks;
  } else {
    return {
      type: 'dir',
      path,
      blocks,
    };
  }
}
