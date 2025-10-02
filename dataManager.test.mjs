import { addNewItem, loadItemsFromLocalStorage, setDataSource, getActiveItems, setActiveItems } from './src/data/dataManager.js';
import { jest } from '@jest/globals';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
let store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value; },
  clear: () => { store = {}; }
};

describe('dataManager with Cloud Function and Local Storage', () => { // テストスイート名を統合
  beforeEach(() => {
    fetch.mockClear(); // リモートの変更
    store = {};
    setActiveItems([]);
  });

  test('猫を学習し、保存・再ロード後も特定できる (Local Storage)', () => { // ローカルのテスト
    // 猫を追加
    const neko = { name: '猫', characteristics: { type: 'モノ', living: 'はい' } };
    addNewItem(neko);
    // 保存後に再ロード
    const items = loadItemsFromLocalStorage();
    const nekoItem = items.find(item => item.name === '猫');
    expect(nekoItem).toBeDefined();
    expect(nekoItem.characteristics.living).toBe('はい');
  });

  test('addNewItem should call fetch with correct data when dataSource is "spreadsheet"', async () => { // リモートのテスト
    // Arrange
    const cloudFunctionUrl = 'https://asia-northeast1-runchoma-oshiete-db.cloudfunctions.net/add-sheet-row';
    const newItem = { name: 'テスト', characteristics: { a: 'b' } };
    
    // Mock a successful response from the Cloud Function
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });

    // Act
    setDataSource('spreadsheet');
    await addNewItem(newItem);

    // Assert
    // Check if fetch was called once
    expect(fetch).toHaveBeenCalledTimes(1);

    // Check if fetch was called with the correct URL and options
    expect(fetch).toHaveBeenCalledWith(cloudFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newItem.name,
        characteristics: newItem.characteristics
      }),
    });

    // Check if the item was added to the local activeItems array as well
    const activeItems = getActiveItems();
    const addedItem = activeItems.find(item => item.name === 'テスト');
    expect(addedItem).toBeDefined();
    expect(addedItem.characteristics).toEqual({ a: 'b' });
  });
});
