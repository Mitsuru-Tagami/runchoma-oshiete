import { calculateEntropy } from './utils.js';

describe('calculateEntropy', () => {
  test('空の配列を渡すと0が返ること', () => {
    const items = [];
    expect(calculateEntropy(items)).toBe(0);
  });

  test('すべての要素が同じ場合、エントロピーは0になること', () => {
    const items = [{ name: 'A' }, { name: 'A' }, { name: 'A' }];
    expect(calculateEntropy(items)).toBe(0);
  });

  test('要素が2種類で数が均等な場合、エントロピーは1になること', () => {
    const items = [{ name: 'A' }, { name: 'B' }];
    expect(calculateEntropy(items)).toBe(1);
  });

  test('要素が4種類で数が均等な場合、エントロピーは2になること', () => {
    const items = [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }];
    expect(calculateEntropy(items)).toBe(2);
  });

  test('要素の分布が不均等な場合、正しくエントロピーが計算されること', () => {
    const items = [{ name: 'A' }, { name: 'A' }, { name: 'B' }, { name: 'C' }];
    // P(A) = 0.5, P(B) = 0.25, P(C) = 0.25
    // Entropy = - (0.5 * log2(0.5) + 0.25 * log2(0.25) + 0.25 * log2(0.25))
    //         = - (0.5 * -1 + 0.25 * -2 + 0.25 * -2)
    //         = - (-0.5 - 0.5 - 0.5) = 1.5
    expect(calculateEntropy(items)).toBe(1.5);
  });
});
