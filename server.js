import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { setDataSource, getDataSource } from './src/data/dataManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 認証用のミドルウェア (簡易版)
const authenticate = (req, res, next) => {
  const password = req.query.password; // 例: ?password=your_secret_password
  // TODO: 実際のパスワードは環境変数などから取得し、よりセキュアな認証方法を実装する
  if (password === 'your_secret_password') {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// 静的ファイルの提供 (runchoma-oshieteディレクトリ全体)
const staticPath = __dirname;
console.log(`Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));

// ルートパスへのアクセス時に public/index.html を提供
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// admin.html の提供と認証
app.get('/admin', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// APIエンドポイントの例 (今後実装)
app.get('/api/data', (req, res) => {
  res.json({ message: 'Data from backend API' });
});

// 現在のデータソースを取得するAPI
app.get('/api/config/dataSource', authenticate, (req, res) => {
  res.json({ dataSource: getDataSource() });
});

// データソースを切り替えるAPI
app.post('/api/config/setDataSource', authenticate, (req, res) => {
  const type = req.query.type;
  if (type === 'local' || type === 'spreadsheet') {
    setDataSource(type);
    res.json({ success: true, dataSource: getDataSource() });
  } else {
    res.status(400).json({ success: false, message: 'Invalid data source type' });
  }
});

// スプレッドシート設定を保存するAPI
let spreadsheetConfig = { // 一時的にメモリに保存
  spreadsheetId: '',
  jsonCredentials: ''
};

app.use(express.json()); // JSONボディをパースするために必要

app.post('/api/config/setSpreadsheetSettings', authenticate, (req, res) => {
  const { spreadsheetId, jsonCredentials } = req.body;
  if (spreadsheetId && jsonCredentials) {
    spreadsheetConfig.spreadsheetId = spreadsheetId;
    spreadsheetConfig.jsonCredentials = jsonCredentials;
    // TODO: ここでspreadsheetClient.jsに設定を渡す、または環境変数として設定する
    // 現時点ではメモリに保存するだけ
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = jsonCredentials; // 環境変数に設定
    // SPREADSHEET_ID も同様に設定する必要があるが、spreadsheetClient.js内でconstで定義されているため、
    // ここで直接変更することはできない。再起動時に読み込まれるようにするか、
    // spreadsheetClient.jsを関数としてexportし、設定を引数で渡すように変更する必要がある。
    res.json({ success: true, message: 'スプレッドシート設定を保存しました。' });
  } else {
    res.status(400).json({ success: false, message: 'スプレッドシートIDとJSON認証情報が必要です。' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});