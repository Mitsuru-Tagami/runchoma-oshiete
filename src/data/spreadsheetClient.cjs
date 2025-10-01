const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// Cloud FunctionのトリガーURL
const CLOUD_FUNCTION_URL = 'https://asia-northeast1-runchoma-oshiete-db.cloudfunctions.net/add-sheet-row';

// TODO: 実際に使用するスプレッドシートIDに置き換えてください
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID'; 

// サービスアカウントの認証情報を環境変数から取得
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const GOOGLE_PRIVATE_KEY_PATH = process.env.GOOGLE_PRIVATE_KEY_PATH;

let jwtClient = null;

async function getCredentials() {
  if (jwtClient) return jwtClient;

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PROJECT_ID || !GOOGLE_PRIVATE_KEY_PATH) {
    throw new Error('Google認証情報が不足しています。環境変数を確認してください。');
  }

  const privateKeyPath = path.resolve(process.cwd(), GOOGLE_PRIVATE_KEY_PATH);
  let privateKey;
  try {
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    // console.log('--- Private Key Content (for internal debug) ---');
    // console.log(privateKey.substring(0, 50) + '...' + privateKey.substring(privateKey.length - 50)); // 冒頭と末尾のみ表示
    // console.log('--- End Private Key Content ---');
  } catch (error) {
    console.error('プライベートキーファイルの読み込みに失敗しました:', error);
    throw new Error('プライベートキーファイルの読み込みに失敗しました。');
  }

  jwtClient = new JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return jwtClient;
}

async function getDoc() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
    throw new Error('スプレッドシートIDが設定されていません。spreadsheetClient.js を確認してください。');
  }

  const credentials = await getCredentials();

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, credentials);

  try {
    await doc.loadInfo(); // スプレッドシートの情報をロード
    return doc;
  } catch (error) {
    console.error('Googleスプレッドシートの認証またはロードに失敗しました:', error);
    throw new Error('Googleスプレッドシートへの接続に失敗しました。');
  }
}

async function loadItemsFromSpreadsheet() {
  console.log("スプレッドシートからデータを読み込み中...");
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0]; // 最初のシートを使用
    const rows = await sheet.getRows();
    console.log('--- Debugging row object ---');
    if (rows.length > 0) {
      console.log('First row object:', rows[0]);
      console.log('First row _rawData:', rows[0]._rawData);
      console.log('First row name:', rows[0].name);
      console.log('First row characteristics:', rows[0].characteristics);
    } else {
      console.log('No rows found in the spreadsheet.');
    }
    console.log('--- End Debugging row object ---');

    const items = rows.map(row => {
      try {
        return {
          name: row._rawData[0],
          type: row._rawData[1],
          characteristics: JSON.parse(row._rawData[2]) // JSON文字列をパース
        };
      } catch (e) {
        console.warn(`characteristics のパースに失敗しました (行: ${row.name}):`, e);
        return null; // パースできない行はスキップ
      }
    }).filter(item => item !== null); // nullを除外

    console.log("スプレッドシートから読み込んだアイテム:", items);
    return items;
  } catch (error) {
    console.error('スプレッドシートからのアイテム読み込みに失敗しました:', error);
    return []; // エラー時は空の配列を返す
  }
}

async function addNewItemToSpreadsheet(newItem) {
  console.log("Cloud Function経由でスプレッドシートに新しいアイテムを追加中...", newItem);

  // データを整形してCloud Functionに送信
  const dataToSend = {
    name: newItem.name,
    type: newItem.characteristics.type,
    characteristics: JSON.stringify(newItem.characteristics), // 全特性をJSON文字列として保存
    createdAt: new Date().toISOString() // データ作成日を追加
  };

  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloud Function returned an error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Success:', result);
    console.log(`アイテム「${newItem.name}」をCloud Function経由で追加リクエストしました。`);
    return true;

  } catch (error) {
    console.error('Cloud Functionへのアイテム追加リクエストに失敗しました:', error);
    return false;
  }
}

module.exports = {
  loadItemsFromSpreadsheet,
  addNewItemToSpreadsheet,
};