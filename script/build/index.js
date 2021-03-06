const path = require('path');
const rimraf = require('rimraf');
const { promisify } = require('util');

const compile = require('./compile');
const parseDeps = require('./parseDeps');

const rimrafAsync = promisify(rimraf);

const baseDir = path.resolve(__dirname, '../../');
const sourceDir = path.join(baseDir, '/src');
const distDir = path.join(baseDir, '/dist');

async function processFile(file, type) {
  const dirname = path.dirname(file);
  const extname = path.extname(file);
  const basename = path.basename(file).replace(extname, '');
  const isReact = extname === '.jsx' || extname === '.tsx';
  const isVue = extname === '.vue';
  if (!dirname.startsWith(sourceDir)) {
    throw new Error('引用了 src 以外目录的文件');
  }
  const innerDirname = dirname.replace(sourceDir, '');
  let targetExtname = extname;
  if (type !== 'raw') {
    if (isReact) {
      targetExtname = '.jsx';
    } else if (isVue) {
      targetExtname = '.vue';
    } else {
      targetExtname = '.js';
    }
  }
  const target = `${distDir}/${type}${innerDirname}/${basename}${targetExtname}`;

  try {
    await compile({
      input: file,
      output: target,
      type,
      isReact,
    });
    console.log(`src${innerDirname}/${basename}${extname}`, '=>', `dist${innerDirname}/${basename}${targetExtname}`);
  } catch (e) {
    console.log(`src${innerDirname}/${basename}${extname} compile to ${type} error:`);
    console.error(e);
  }
}

async function main({ modules, types }) {
  // 分析依赖，找到所有依赖文件及外部库
  const { files, externals } = await parseDeps(modules);
  // 清理 dist 目录
  await rimrafAsync(distDir);
  // 编译
  await Promise.all(
    files.map((file) =>
      Promise.all(types.map((type) => processFile(file, type)))),
  );

  console.log('\n');
  console.log('编译完成');
  console.log('\n');

  if (externals.size) {
    console.log(
      '请在使用的库中运行以下命令: \n',
      'npm install --save',
      [...externals].join(' '),
    );
  }
}

module.exports = main;
