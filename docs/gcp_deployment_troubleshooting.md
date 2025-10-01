# GCPデプロイ時のトラブルシューティングガイド

## 1. 発生した問題

*   **事象:** Cloud Runサービスが正常に起動せず、ログに `SyntaxError: "undefined" is not valid JSON` というエラーが出力される。
*   **状況:** Node.jsプログラムからGoogleスプレッドシートに接続するため、サービスアカウントの認証情報（JSON）を環境変数 `GOOGLE_APPLICATION_CREDENTIALS_JSON` に設定してデプロイした際に発生。

## 2. 原因分析

*   エラーメッセージから、プログラムが環境変数 `GOOGLE_APPLICATION_CREDENTIALS_JSON` を `undefined` として受け取ってしまい、JSONとして解析できずに失敗した可能性が極めて高いです。
*   考えられる主な原因は以下の通りです。
    *   **設定ミス:** Cloud Runのコンソール画面や`gcloud`コマンドで、環境変数の設定が正しく保存・反映されなかった。
    *   **内容の不備:** コピー＆ペーストしたJSONキーの文字列が破損しており、GCP側が値として受け付けなかった。
    *   **参照ミス:** コード内で環境変数を参照する際の変数名（`process.env.XXX`）のタイポ。（可能性は低いがゼロではない）

## 3. 今後の推奨対策

### 対策A: サービスアカウントの権限借用（根本対策・推奨）

*   **概要:** 認証情報JSONを環境変数に設定する方法を止め、Cloud Runサービス自体にサービスアカウントの権限を直接割り当てます。
*   **メリット:**
    *   認証情報のコピー＆ペースト作業が不要になり、設定ミスが劇的に減少します。
    *   認証情報が外部に漏れるリスクが低減し、セキュリティが向上します。
    *   コードがシンプルになる可能性があります（ライブラリが自動で認証を検知するため）。
*   **手順:**
    1.  GCPでサービスアカウントを作成します。（完了済み）
    2.  そのサービスアカウントに「Google Drive API」および「Google Sheets API」へのアクセス権限を持つIAMロール（例: `編集者`など）を付与します。
    3.  Cloud Runのサービス設定（新規リビジョンのデプロイ時）で、「セキュリティ」>「サービスアカウント」の項目で、上記で作成したものを指定します。

### 対策B: 起動時ログによるデバッグ（補助対策）

*   **概要:** アプリケーションの起動直後に、読み込んだ環境変数の状態を出力するログを仕込みます。
*   **目的:** 問題発生時に、環境変数が正しく設定されているかをCloud Runのログから即座に確認できるようにします。
*   **コード例 (`index.js` or `server.js` の冒頭):**
    ```javascript
    console.log('--- Checking Environment Variables ---');
    console.log('DATA_SOURCE:', process.env.DATA_SOURCE || 'Not Set');
    console.log('GOOGLE_APPLICATION_CREDENTIALS_JSON is set:', !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log('------------------------------------');
    ```

### 対策C: `dotenv`によるローカル環境の再現（開発効率化）

*   **概要:** `dotenv`ライブラリを導入し、プロジェクトルートに`.env`ファイルを作成してローカル用の環境変数を管理します。
*   **目的:** ローカル環境でCloud Runに近い環境を簡単に再現し、デプロイ前に認証周りの問題を検出できるようにします。
*   **手順:**
    1.  `npm install dotenv` を実行します。
    2.  プロジェクトルートに `.gitignore` で無視される `.env` ファイルを作成します。
    3.  `.env` ファイル内に、`DATA_SOURCE=spreadsheet` や `GOOGLE_APPLICATION_CREDENTIALS_JSON={...}` のような形式で環境変数を記述します。
    4.  アプリケーションの起動スクリプトの冒頭で `require('dotenv').config();` を呼び出します。
