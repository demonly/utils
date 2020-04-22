const assert = require('assert');
const { wait, timeout, retry } = require('../src/promise');

describe('promise', () => {
  describe('wait', () => {
    it('调用成功', (done) => {
      wait(1)().then(done);
    });

    it('等待时间正确', (done) => {
      const start = Date.now();
      wait(100)()
        .then(() => {
          const time = Date.now() - start;
          assert(time > 80 && time < 120);
          done();
        })
        .catch(done);
    });
  });

  describe('timeout', () => {
    it('应该未超时', (done) => {
      timeout(100)(wait(80))().then(done).catch(done);
    });

    it('应该超时', (done) => {
      timeout(80)(wait(100))()
        .then(() => done(new Error()))
        .catch(() => done());
    });
  });

  describe('retry', () => {
    it('函数应该被调用', (done) => {
      retry()(done)();
    });

    it('异步函数成功', (done) => {
      const func = () => Promise.resolve();
      retry()(func)()
        .then(() => done())
        .catch(() => done(new Error('失败')));
    });

    it('同步函数成功', (done) => {
      const func = () => null;
      retry()(func)()
        .then(() => done())
        .catch(() => done(new Error('失败')));
    });

    it('异步函数失败', (done) => {
      const func = Promise.resolve;
      retry()(func)()
        .then(() => done(new Error('成功')))
        .catch(() => done());
    });

    it('同步函数失败', (done) => {
      const func = () => {
        throw new Error();
      };
      retry()(func)()
        .then(() => done(new Error('成功')))
        .catch(() => done());
    });

    it('异步函数重试次数正确', (done) => {
      let index = 0;
      const func = () => {
        index++;
        return Promise.reject();
      };
      retry(10)(func)()
        .then(() => done(new Error('成功')))
        .catch(() => done(assert(index === 11)));
    });

    it('同步函数重试次数正确', (done) => {
      let index = 0;
      const func = () => {
        index++;
        throw new Error();
      };
      retry(10)(func)()
        .then(() => done(new Error('成功')))
        .catch(() => done(assert(index === 11)));
    });

    it('等待时间正确', (done) => {
      let index = 0;
      const func = () => {
        index++;
        return index === 1 ? Promise.reject() : Promise.resolve();
      };
      const start = Date.now();
      retry(
        1,
        100,
      )(func)()
        .then(() => {
          const time = Date.now() - start;
          done(assert(time > 80 && time < 120));
        })
        .catch(done);
    });
  });
});
