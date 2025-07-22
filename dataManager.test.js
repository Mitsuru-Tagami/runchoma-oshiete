import { addNewItem, loadItemsFromLocalStorage, setActiveItems } from './dataManager.js';

// モック: localStorage
let store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value; },
  clear: () => { store = {}; }
};

describe('dataManager 学習・特定テスト', () => {
  beforeEach(() => {
    store = {};
    setActiveItems([]);
  });

  test('猫を学習し、保存・再ロード後も特定できる', () => {
    // 猫を追加
    const neko = { name: '猫', characteristics: { type: 'モノ', living: 'はい' } };
    addNewItem(neko);
    // 保存後に再ロード
    const items = loadItemsFromLocalStorage();
    const nekoItem = items.find(item => item.name === '猫');
    expect(nekoItem).toBeDefined();
    expect(nekoItem.characteristics.living).toBe('はい');
  });
});
