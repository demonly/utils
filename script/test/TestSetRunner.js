/* eslint-disable no-await-in-loop */
const fs = require('fs').promises;
const path = require('path');
const puppeter = require('puppeteer');
const Mocha = require('mocha');
const Server = require('./server');
const TestRunner = require('./TestRunner');
const { unentriesReducer } = require('../utils');

class TestSetRunner {
  constructor({ debug } = {}) {
    this.debug = debug;
  }

  async run(testSet) {
    const { debug } = this;
    // 启动 server
    const server = new Server();
    // 启动浏览器
    let browser;
    if (debug) {
      browser = await puppeter.launch({
        headless: false,
        devtools: true,
        slowMo: 250,
      });
    } else {
      browser = await puppeter.launch({});
    }

    const results = await Promise.all(testSet.map(async (file) => {
      const dir = path.dirname(file);
      const html = `${dir}/index.html`;
      const htmlStat = await fs.stat(html);
      if (!htmlStat || htmlStat.isDirectory()) {
        throw new Error(`${html} 不存在`);
      }
      const runner = new TestRunner({ browser, debug });
      await runner.init(file, html);
      return runner.run();
    }));

    await Promise.all([
      // 关闭 server
      server.stop(),
      // 关闭浏览器
      browser.close(),
    ]);

    // 统计
    const stats = results
      .map((item) => item.stats)
      .reduce((prev, cur) => {
        const keys = ['suites', 'tests', 'passes', 'pending', 'failures'];
        const result = keys
          .map((key) => [key, prev[key] + cur[key]])
          .reduce(unentriesReducer);
        result.start = prev.start > cur.start ? cur.start : prev.start;
        result.end = prev.end < cur.end ? cur.end : prev.end;
        result.duration = new Date(result.end) - new Date(result.start);
        return result;
      });

    // 打印测试统计
    Mocha.reporters.Spec.prototype.epilogue.call({ stats });

    return results.every(({ passed }) => passed);
  }
}

module.exports = TestSetRunner;
