import { items as initialItems } from './data.js';

let activeItems = [];

// localStorageからアイテムを読み込む
export function loadItemsFromLocalStorage() {
    console.log("--- loadItemsFromLocalStorage 開始 ---");
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

    activeItems = combinedItems.map(item => ({ ...item, score: 0 }));
    console.log("初期アイテムと統合後のactiveItems:", activeItems);
    console.log("--- loadItemsFromLocalStorage 終了 ---");
    return activeItems;
}

// アイテムをlocalStorageに保存する
export function saveItemsToLocalStorage(itemsToSave) {
    console.log("--- saveItemsToLocalStorage 開始 ---");
    const items = itemsToSave.map(({ score, ...rest }) => rest);
    localStorage.setItem('runchomaItems', JSON.stringify(items));
    console.log("localStorageに保存したアイテム:", items);
    console.log("--- saveItemsToLocalStorage 終了 ---");
}

export function addNewItem(newItem) {
    const index = activeItems.findIndex(item => item.name === newItem.name);
    if (index !== -1) {
        activeItems[index] = { ...newItem, score: 0 };
        console.log(`アイテム「${newItem.name}」の情報を更新しました。`);
    } else {
        activeItems.push({ ...newItem, score: 0 });
        console.log(`新しいアイテム「${newItem.name}」を追加しました。`);
    }
    saveItemsToLocalStorage(activeItems);
}

export function getActiveItems() {
    return activeItems;
}

export function setActiveItems(newActiveItems) {
    activeItems = newActiveItems;
}
