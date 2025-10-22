require('ts-node').register({
  transpileOnly: true,
  project: 'tsconfig.json',
})
module.exports = require('./datasource.ts').default
