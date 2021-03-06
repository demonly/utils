/**
 * @module number
 */

/**
 * 对比两个浮点数是否相等
 *
 * 参考 [https://zh.wikipedia.org/wiki/%E8%AF%AF%E5%B7%AE%E4%BC%A0%E6%92%AD](误差传递公式)
 * @param {Number} a 待对比数字
 * @param {Number} b 待对比数字
 * @param {Number} uncertainty 误差系数
 * @return {Boolean} 是否相等
 */
export function isEqual(a: number, b: number, uncertainty = 1): boolean {
  return Math.abs(a - b) < Number.EPSILON * uncertainty;
}
