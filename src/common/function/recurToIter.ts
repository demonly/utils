/**
 * @module function
 */

const RECURSOR = Symbol('recursor');
const UNYIELD = Symbol('unyield');

/**
 * @static
 * @tutorial recurToIter
 * @summary 将递归函数转化为迭代函数
 * @param {Function} func 递归函数
 * @return {Function} 迭代函数
 */
export default function recurToIter<Param extends any[], Result, Context>(
  func: (...args: Param) => Result,
): (...args: Param) => Result {
  type Iter =
    | Iterator<Result | symbol, Result, Result> // 真实 iterator
    | { next: (result?: Result) => { done: boolean; value: symbol } }; // 伪造 iterator

  const tasks: Param[] = []; // 递归任务队列
  const results: Result[] = []; // 结果栈
  const iterators: Iter[] = []; // 正在等待返回的任务栈
  let context: Context | undefined;

  // 当用户在没有 yield 关键字的情况下调用 recursor
  // 它的 task 应该被执行，但是它的结果不应该被推入 results 中
  const unyieldIterator: Iter = {
    next() {
      return { done: true, value: UNYIELD };
    },
  };

  // 传入函数中作为迭代函数的替代
  const recursor = (...task: Param) => {
    // 为了保持 task、results 和 iterators 的数量关系
    // 在推入 task 的同时，推入一个占位的 iterator
    tasks.push(task);
    iterators.push(unyieldIterator);
    return RECURSOR;
  };

  // 执行 iterator 的 next 方法并处理结果
  const next = (
    iterator: Iter,
    preResult?: Result,
  ) => {
    while (true) {
      const result = iterator.next(preResult);

      // 内部函数调用了 recursor，暂停执行并将 iterator 推入 iterators
      if (result.value === RECURSOR) {
        iterators[iterators.length - 1] = iterator;
        break;
      }

      // 这是一次没有 yield 的情况下产生的调用
      // 它的 result 不会被消费
      if (result.value === UNYIELD) {
        break;
      }

      // 内部函数返回了最终结果，将结果推入 results
      if (result.done) {
        results.push(result.value as Result);
        break;
      }

      // 内部函数进行了一次没有意义的 yield，继续 next
      // eslint-disable-next-line no-param-reassign
      preResult = result.value as Result;
    }
  };

  return function (...params: Param) {
    // 初始化任务
    tasks.push(params);
    context = this;

    while (tasks.length) {
      // 处理 tasks 中的任务，直到处理完成
      while (tasks.length) {
        const task = tasks.pop();
        const iterator = func.call(context, recursor, ...task);
        next(iterator);
      }

      // 处理 iterators 中的任务
      // 直到 tasks 中出现新任务，优先执行 tasks
      // 直到 iterators 执行完毕，返回结果
      while (!tasks.length && iterators.length) {
        const iterator = iterators.pop();
        if (!iterator) break;
        const preResult = results.pop();
        next(iterator, preResult);
      }
    }

    return results.pop();
  };
}
