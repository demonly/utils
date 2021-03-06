/**
 * @module array
 */

import { EleType } from '../typescript/utilityTypes';

/**
 * 分页
 * @param {Array} array 待排序数组
 * @param {Number} page 页码
 * @param {Number} size 分页数
 * @return {Array} 结果数组
 */
export function paging<T>(array: T[], page = 0, size = 15): T[] {
  return array.slice(page * size, (page + 1) * size);
}

/**
 * 排序
 * @param {Array} array 待排序数组
 * @param {"asc"|"desc"} order 顺序
 * @param {String} identity 排序字段
 * @return {Array} 结果数组
 */
export function sort<T>(
  array: T[],
  order: 'asc' | 'desc' = 'asc',
  identity: string,
): T[] {
  const coefficient = order === 'desc' ? -1 : 1;
  return [...array].sort((a, b) => {
    let valueA;
    let valueB;
    if (identity) {
      valueA = a[identity];
      valueB = b[identity];
    } else {
      valueA = a;
      valueB = b;
    }

    return (valueA > valueB ? 1 : -1) * coefficient;
  });
}

/**
 * 浅对比数组
 * @param {Array} a 对比数组
 * @param {Array} b 对比数组
 * @return {Array} 结果数组
 */
export function shallowEqual(a: Array<any>, b: Array<any>): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

/**
 * 对数组元素进行分类
 * @param {Any[]} array 待分类数组
 * @param {String[]|function[]} keys 分类字段或方法，如果参数类型不为数组会转为单元素数组
 * @return {Object[]} result 分类后的数组
 * @return {Any[]} result.keys 分类后的数组
 * @return {Any[]} result.items 分类后的数组
 */
export function classify<T>(
  array: T[],
  keys: ((item: T) => string | string)[],
): { keys: string[]; items: T[] }[] {
  // 如果参数类型不为数组转为单元素数组
  if (!(keys instanceof Array)) {
    keys = [keys];
  }

  // 创建获取分类值的方法
  const [key, ...restKeys] = keys;
  let getValue: (item: T) => string;
  if (key instanceof Function) {
    getValue = key;
  } else {
    getValue = (item) => item[key];
  }

  // 分类
  const map = new Map<string, T[]>();

  array.forEach((item) => {
    const value = getValue(item);
    if (!map.has(value)) {
      map.set(value, []);
    }

    map.get(value).push(item);
  });

  // 将结果转换为数组
  let result = [...map.entries()].map(([value, items]) => ({
    keys: [value],
    items,
  }));

  // 递归分类
  if (restKeys[0]) {
    const nestedResult = result.map((data) =>
      classify(data.items, restKeys).map((child) => ({
        // 将子分类的 keys 和父分类的 keys 合并
        keys: [...data.keys, ...child.keys],
        items: child.items,
      })));
    result = [].concat(...nestedResult);
  }

  return result;
}

type MultiArray<T> = (T | MultiArray<T>)[];
/**
 * 多维数组转一维数组
 * @param {Array} array 多维数组
 * @return {Array} 一维数组
 */
export function deepFlatten<T>(array: MultiArray<T>): T[] {
  return [].concat(
    ...array.map((v) => (Array.isArray(v) ? deepFlatten(v) : v)),
  );
}

/**
 * 数组取交集
 * @param {Array} array 第一个数组
 * @param {Array} other 第二个数组
 * @return {Array} 交集数组
 */
export function unite<T>(array: T[], other: T[]): T[] {
  return array.filter((v) => other.includes(v));
}

/**
 * 取倒数第 lastIndex 个元素
 * @param array 数组
 * @param lastIndex 从后向前计的 index
 */
export function lastItem<T extends any[]>(array: T, lastIndex = 0): EleType<T> {
  return array?.[array.length - 1 - lastIndex];
}

/**
 * 取随机一个元素
 * @param array 数组
 */
export function randomItem<T extends any[]>(array: T): EleType<T> {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
