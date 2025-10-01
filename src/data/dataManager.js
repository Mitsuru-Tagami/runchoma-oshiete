// src/data/dataManager.js

import { items as initialItems } from './localData.js';
import * as spreadsheetClient from './spreadsheetClient.cjs';

let activeItems = [];

// Determine the data source based on environment variable
// TODO: 環境変数の設定方法を検討し、server.jsから設定できるようにする
let currentDataSourceType = process.env.DATA_SOURCE || 'local'; // Default to 'local'

export function setDataSource(type) {
  if (type === 'local' || type === 'spreadsheet') {
    currentDataSourceType = type;
    console.log(`データソースが ${currentDataSourceType} に設定されました。`);
  } else {
    console.warn(`無効なデータソースタイプ: ${type}`);
  }
}

export function getDataSource() {
  return currentDataSourceType;
}

// Load items based on the selected data source
export async function loadItems() {
    console.log(`--- loadItems 開始 (データソース: ${currentDataSourceType}) ---`);
    let loadedItems = [];

    if (currentDataSourceType === 'spreadsheet') {
        loadedItems = await spreadsheetClient.loadItemsFromSpreadsheet();
    } else { // Default to local
        const storedItems = localStorage.getItem('runchomaItems');
        const combinedItems = [...initialItems];
        const existingNames = new Set(initialItems.map(item => item.name));

        if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            console.log("localStorageから読み込んだアイテム:", parsedItems);

            parsedItems.forEach(storedItem => {
                if (!existingNames.has(storedItem.name)) {
                    combinedItems.push(storedItem);
                    existingNames.add(storedItem.name);
                }
            });
        }
        loadedItems = combinedItems;
    }

    activeItems = loadedItems.map(item => ({ ...item, score: 0 }));
    console.log("統合後のactiveItems:", activeItems);
    console.log("--- loadItems 終了 ---");
    return activeItems;
}

// Save items based on the selected data source
export async function saveItems(itemsToSave) {
    console.log(`--- saveItems 開始 (データソース: ${currentDataSourceType}) ---`);
    const items = itemsToSave.map(({ score, ...rest }) => rest);

    if (currentDataSourceType === 'spreadsheet') {
        // スプレッドシートへの保存は、新しいアイテムの追加時のみを想定
        // ここでは、最後にactiveItemsに追加されたアイテムを保存する
        await spreadsheetClient.addNewItemToSpreadsheet(items[items.length - 1]); 
    } else { // Default to local
        localStorage.setItem('runchomaItems', JSON.stringify(items));
    }
    console.log("保存したアイテム:", items);
    console.log("--- saveItems 終了 ---");
}

export async function addNewItem(newItem) {
    const index = activeItems.findIndex(item => item.name === newItem.name);
    if (index !== -1) {
        activeItems[index] = { ...newItem, score: 0 };
        console.log(`アイテム「${newItem.name}」の情報を更新しました。`);
    } else {
        activeItems.push({ ...newItem, score: 0 });
        console.log(`新しいアイテム「${newItem.name}」を追加しました。`);
    }
    await saveItems(activeItems);
}

export function getActiveItems() {
    return activeItems;
}

export function setActiveItems(newActiveItems) {
    activeItems = newActiveItems;
}