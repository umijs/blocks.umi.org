const express = require('express');
const { getBlocks } = require('./blocks');
const debug = require('debug')(`umi:index`);

let blocks = null;
let cachedTime = 0;
const TEN_MINITE = 10*60*1000;

async function getBlocksWithCache() {
  if (!blocks || (new Date() - cachedTime) > TEN_MINITE) {
    debug(`fetch blocks from remote`);
    blocks = await getBlocks();
    cachedTime = new Date();
  }
  return blocks;
}

const PORT = 3000;
const app = express();

app.get(`/`, (req, res) => {
  res.json({
    status: 'success',
    data: `Checkout /api/blocks`,
  });
});

app.get(`/api/cache/clean`, (req, res) => {
  blocks = null;
  res.json({
    status: 'success',
    data: `Reset blocks to null`,
  });
});

app.get(`/api/blocks`, (req, res) => {
  getBlocksWithCache().then(blocks => {
    res.json({
      status: 'success',
      data: blocks,
    });
  }).catch((e) => {
    res.json({
      status: 'failure',
      error: e.message,
    });
  });
});

app.listen(PORT, () => {
  console.log(`app started on ${PORT}`);
});
