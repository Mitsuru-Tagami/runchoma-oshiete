import { addNewItem, setDataSource, getActiveItems, setActiveItems } from './src/data/dataManager.js';
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

describe('dataManager with Cloud Function', () => {

  beforeEach(() => {
    // Reset mocks and data before each test
    fetch.mockClear();
    store = {};
    setActiveItems([]);
  });

  test('addNewItem should call fetch with correct data when dataSource is "spreadsheet"', async () => {
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