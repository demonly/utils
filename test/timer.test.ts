import assert from 'power-assert';
import Timer from '../src/timer'
import { wait } from '../src/promise'
import { slow as defaultSlow } from './.mocharc';

describe('timer', () => {
  describe('timer', () => {
    it('正常计时', async function () {
      this.slow(defaultSlow + 100);
      const timer = new Timer();
      timer.start();
      await wait(100);
      const time = timer.getTime();
      assert(time > 90 && time < 110);
    });

    it('暂停计时', async function() {
      this.slow(defaultSlow + 150);
      const timer = new Timer();
      timer.start();
      await wait(100);
      timer.pause();
      await wait(50)
      const time = timer.getTime();
      assert(time > 90 && time < 110);
    });

    it('恢复计时', async function() {
      this.slow(defaultSlow + 200);
      const timer = new Timer();
      timer.start();
      await wait(100);
      timer.pause();
      await wait(50)
      timer.start();
      await wait(50)
      const time = timer.getTime();
      assert(time > 140 && time < 170);
    });

    it('重置', async function() {
      this.slow(defaultSlow + 50);
      const timer = new Timer();
      timer.start();
      await wait(50)
      timer.reset();
      const time = timer.getTime();
      assert(time === 0);
    });

    it('重置后计时正常', async function() {
      this.slow(defaultSlow + 150);
      const timer = new Timer();
      timer.start();
      await wait(50)
      timer.reset();
      timer.start();
      await wait(100);
      const time = timer.getTime();
      assert(time > 90 && time < 110);
    });

    it('重新计时', async function() {
      this.slow(defaultSlow + 150);
      const timer = new Timer();
      timer.start();
      await wait(50)
      timer.restart();
      await wait(100);
      const time = timer.getTime();
      assert(time > 90 && time < 110);
    });

    it('暂停状态下重新计时', async function() {
      this.slow(defaultSlow + 150);
      const timer = new Timer();
      timer.start();
      await wait(50)
      timer.pause();
      timer.restart();
      await wait(100);
      const time = timer.getTime();
      assert(time > 90 && time < 110);
    });

    it('setTimeout', function(done) {
      this.slow(defaultSlow + 150);
      const timer = new Timer();
      const startTime = Date.now();
      timer.setTimeout((innerTime) => {
        const time = Date.now() - startTime
        assert(time > 140 && time < 160);
        assert(innerTime > 90 && innerTime < 110);
        done();
      }, 100)
      timer.start();
      wait(50).then(timer.pause.bind(timer));
      wait(100).then(timer.start.bind(timer));
    })

    it('setInterval', function(done) {
      this.slow(defaultSlow + 250);
      const timer = new Timer();
      const startTime = Date.now();
      let n = 0;
      const t = timer.setInterval((innerTime) => {
        const time = Date.now() - startTime
        switch(n) {
          case 0:
            assert(time > 140 && time < 160);
            assert(innerTime > 90 && innerTime < 110);
            break;
          default:
            assert(time > 240 && time < 260);
            assert(innerTime > 190 && innerTime < 210);
            done()
        }
        n++
      }, 100)
      timer.start();
      wait(50).then(timer.pause.bind(timer));
      wait(100).then(timer.start.bind(timer));
      wait(300).then(() => timer.clearInterval(t))
    })
  });
});
