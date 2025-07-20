# るんちょまの『教えて下さい、お人間さん』 - main.js モジュール化タスクリスト

## 目標
- `main.js`の肥大化を解消し、コードの可読性、保守性、再利用性を向上させる。
- 機能ごとにファイルを分割し、モジュールとして管理する。
- 現在発生しているJavaScriptのエラー（SyntaxError, ReferenceErrorなど）を、リファクタリングの過程で解消する。

## フェーズ1: ファイル分割と基本構造の確立

1.  **`utils.js`の作成:**
    *   [x] 汎用的なヘルパー関数（例: `setButtonsEnabled`, `restartGame`など）を格納する。
    *   [x] `calculateEntropy`関数もここに移動する。
2.  **`ui.js`の作成:**
    *   [x] DOM要素の取得、メッセージ表示、ボタンの表示/非表示切り替えなど、UI操作に関する関数を格納する。
    *   [x] `messageElement`, `initialSelectionButtons`などのDOM要素の定数をここに移動する。
    *   [x] `askQuestion`, `displayFinalResult`, `promptForAnswer`, `displayCandidates`関数をここに移動する。
3.  **`dataManager.js`の作成:**
    *   [x] `items`データ、`localStorage`からの読み込み/保存に関する関数を格納する。
    *   [x] `items`定数、`loadItemsFromLocalStorage`, `saveItemsToLocalStorage`関数をここに移動する。
4.  **`questionSelector.js`の作成:**
    *   [x] 質問の定義、最適な質問を選択するロジックを格納する。
    *   [x] `questions`定数、`usedQuestionIndices`, `findNextQuestion`関数をここに移動する。
5.  **`gameCore.js`の作成:**
    *   [x] ゲームの主要なロジック（初期化、回答処理、ゲーム進行管理）を格納する。
    *   [x] `questionCount`, `activeItems`, `isProcessing`, `selectedInitialType`, `inputPhase`, `tempNewItem`, `currentQuestion`などのゲーム状態変数をここに移動する。
    *   [x] `handleAnswer`, `handleInitialAnswer`, `handleSubmitAnswer`関数をここに移動する。
6.  **`index.html`の更新:**
    *   [x] `<script type="module" src="main.js"></script>`を`<script type="module" src="gameCore.js"></script>`に変更する。

## フェーズ2: モジュール間の連携とエラー解消

1.  **`import`/`export`の追加:**
    *   [x] 各モジュールで必要な関数や変数を`export`し、利用する側で`import`する。
    *   [x] 特に、`gameCore.js`が他のすべてのモジュールから関数を`import`することになる。
2.  **エラーの確認と修正:**
    *   [x] モジュール化によって発生する可能性のある`ReferenceError`や`SyntaxError`を解消する。
    *   [x] 特に、`messageElement.textContent`内の改行エラーや、`currentQ`の参照エラーが解消されているか確認する。

## フェーズ3: 動作確認と最終調整

1.  **アプリケーション全体の動作確認:**
    *   [ ] ゲームが正常に開始し、質問選択、回答、スコアリング、候補表示、学習機能が期待通りに動作するか確認する。
    *   [ ] 「馬」の学習と特定が正しく行われるか、再度テストする。
2.  **コンソールログの整理:**
    *   [ ] デバッグ用の`console.log`を整理し、必要最低限にする。