import { GoogleSpreadsheet } from 'google-spreadsheet';

// Cloud FunctionのトリガーURL
const CLOUD_FUNCTION_URL = 'https://asia-northeast1-runchoma-oshiete-db.cloudfunctions.net/add-sheet-row';

// TODO: 実際に使用するスプレッドシートIDに置き換えてください
const SPREADSHEET_ID = '1Ie75FAEVzIP8w6nnRVk9stfcnUpzkoT-zfkYC549eXU'; 

// サービスアカウントの認証情報を環境変数から取得
const GOOGLE_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

async function getDoc() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID') {
    throw new Error('スプレッドシートIDが設定されていません。spreadsheetClient.js を確認してください。');
  }
  if (!GOOGLE_CREDENTIALS) {
    throw new Error('環境変数 GOOGLE_APPLICATION_CREDENTIALS_JSON が設定されていません。');
  }

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
  try {
    // 認証
    await doc.useServiceAccountAuth(JSON.parse(GOOGLE_CREDENTIALS));
    await doc.loadInfo(); // スプレッドシートの情報をロード
    return doc;
  } catch (error) {
    console.error('Googleスプレッドシートの認証またはロードに失敗しました:', error);
    throw new Error('Googleスプレッドシートへの接続に失敗しました。');
  }
}

export async function loadItemsFromSpreadsheet() {
  console.log("スプレッドシートからデータを読み込み中...");
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0]; // 最初のシートを使用
    const rows = await sheet.getRows();

    const items = rows.map(row => {
      try {
        return {
          name: row.name,
          characteristics: JSON.parse(row.characteristics) // JSON文字列をパース
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

export async function addNewItemToSpreadsheet(newItem) {
  console.log("Cloud Function経由でスプレッドシートに新しいアイテムを追加中...", newItem);

  const dataToSend = {
    name: newItem.name,
    characteristics: newItem.characteristics
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