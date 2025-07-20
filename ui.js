import { restartGame } from './utils.js';

// --- DOM要素の取得 ---
export const uiElements = {
    messageElement: document.getElementById('message'),
    initialSelectionButtons: document.getElementById('initial-selection-buttons'),
    mainQuestionButtons: document.getElementById('main-question-buttons'),
    candidateSelectionArea: document.getElementById('candidate-selection'),
    candidateListDiv: document.getElementById('candidate-list'),
    btnNotInList: document.getElementById('btn-not-in-list'),
    inputAnswerArea: document.getElementById('input-answer-area'),
    userAnswerInput: document.getElementById('user-answer-input'),
    btnSubmitAnswer: document.getElementById('btn-submit-answer'),
    btnRestartGame: document.getElementById('btn-restart-game'),
    akinatorLinkArea: document.getElementById('akinator-link-area'),
    btnStartOver: document.getElementById('btn-start-over'),
    btnSelectMono: document.getElementById('btn-select-mono'),
    btnSelectService: document.getElementById('btn-select-service'),
    btnSelectPersonChar: document.getElementById('btn-select-person-char'),
    btnYes: document.getElementById('btn-yes'),
    btnNo: document.getElementById('btn-no'),
    btnUnknown: document.getElementById('btn-unknown'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    btnShowReadme: document.getElementById('btn-show-readme')
};

// 質問を表示する関数
export function askQuestion(questionText, setButtonsEnabledCallback, setProcessingCallback) {
    console.log("質問を表示: ", questionText);
    uiElements.messageElement.textContent = questionText;
    uiElements.initialSelectionButtons.style.display = 'none';
    uiElements.mainQuestionButtons.style.display = 'grid';
    uiElements.candidateSelectionArea.style.display = 'none';
    uiElements.inputAnswerArea.style.display = 'none';
    uiElements.akinatorLinkArea.style.display = 'none';
    setButtonsEnabledCallback(true, uiElements);
    setProcessingCallback(false);
}

// 最終特定結果を表示する関数
export function displayFinalResult(itemName, setButtonsEnabledCallback) {
    console.log("最終特定結果を表示: ", itemName);
    uiElements.messageElement.textContent = `お人間さん！るんちょま、見つけましたよ！お探しのお品さんは、『${itemName}』ですね、えっへん。`;
    uiElements.initialSelectionButtons.style.display = 'none';
    uiElements.mainQuestionButtons.style.display = 'none';
    uiElements.candidateSelectionArea.style.display = 'none';
    uiElements.inputAnswerArea.style.display = 'flex';
    uiElements.userAnswerInput.style.display = 'none';
    uiElements.btnSubmitAnswer.style.display = 'none';
    uiElements.btnRestartGame.style.display = 'block';
    setButtonsEnabledCallback(false, uiElements);
}

// 答えの入力を促す関数
export function promptForAnswer(setButtonsEnabledCallback, gameState) {
    console.log("答えの入力を促します。");
    uiElements.messageElement.textContent = "お人間さん、残念ながら特定できそうにないです…。申し訳ありませんが、答えを教えていただけませんか？";
    uiElements.initialSelectionButtons.style.display = 'none';
    uiElements.mainQuestionButtons.style.display = 'none';
    uiElements.candidateSelectionArea.style.display = 'none';
    uiElements.inputAnswerArea.style.display = 'flex';
    uiElements.userAnswerInput.style.display = 'block';
    uiElements.btnSubmitAnswer.style.display = 'block';
    uiElements.btnRestartGame.style.display = 'block';
    setButtonsEnabledCallback(true, uiElements);
    uiElements.btnSubmitAnswer.disabled = false;
    uiElements.btnRestartGame.disabled = false;

    gameState.inputPhase = 'name';
    uiElements.userAnswerInput.placeholder = "お品さんの名前を入力してください";
    uiElements.userAnswerInput.value = '';
}

// 候補リストを表示する関数
export function displayCandidates(activeItems, setButtonsEnabledCallback, setProcessingCallback, promptForAnswerCallback, gameState) {
    console.log("--- displayCandidates 開始 ---");
    let maxScore = -Infinity;
    activeItems.forEach(item => {
        if (item.score > maxScore) {
            maxScore = item.score;
        }
    });

    const topCandidates = maxScore < 1 ? [] : activeItems.filter(item => item.score === maxScore);

    console.log("上位候補:", topCandidates);

    if (topCandidates.length > 0 && topCandidates.length <= 5) {
        uiElements.messageElement.textContent = "お人間さん！もしかして、お探しのお品さんは、この中にいらっしゃいますか？";
        uiElements.initialSelectionButtons.style.display = 'none';
        uiElements.mainQuestionButtons.style.display = 'none';
        uiElements.candidateSelectionArea.style.display = 'block';
        uiElements.inputAnswerArea.style.display = 'none';
        uiElements.akinatorLinkArea.style.display = 'none';
        uiElements.candidateListDiv.innerHTML = '';

        topCandidates.forEach(item => {
            const button = document.createElement('button');
            button.textContent = item.name;
            button.classList.add('candidate-button');
            button.addEventListener('click', () => displayFinalResult(item.name, setButtonsEnabledCallback));
            uiElements.candidateListDiv.appendChild(button);
        });
        setButtonsEnabledCallback(true, uiElements);
    } else {
        promptForAnswerCallback(setButtonsEnabledCallback, gameState);
    }
    setProcessingCallback(false);
    console.log("--- displayCandidates 終了 ---");
}

// ユーザーからの答え送信を処理する関数
export function handleSubmitAnswer(gameState) {
    console.log("--- handleSubmitAnswer 開始 ---");
    const answer = uiElements.userAnswerInput.value.trim();
    if (!answer) {
        uiElements.messageElement.textContent = "お人間さん、何か入力してくださいね。";
        return;
    }

    if (gameState.inputPhase === 'name') {
        console.log("フェーズ: 名前入力");
        gameState.tempNewItem = {
            name: answer,
            characteristics: {
                type: gameState.selectedInitialType,
                category: [],
                living: "不明",
                wheels: "不明",
                power_source: "不明",
                purpose: [],
                other_features: []
            }
        };
        uiElements.messageElement.textContent = `お人間さん、ありがとうございます！『${answer}さん』ですね！\n続けて、そのお品さんの特徴をカンマ区切りで教えていただけませんか？\n例: 生き物, 乗り物, 四足歩行`;
        uiElements.userAnswerInput.placeholder = "特徴をカンマ区切りで入力してください 例: 生き物, 四足歩行";
        uiElements.userAnswerInput.value = '';
        gameState.inputPhase = 'characteristics';
        return null; // まだアイテムは完成していないのでnullを返す
    } else if (gameState.inputPhase === 'characteristics') {
        console.log("フェーズ: 特徴入力");
        const features = answer.split(',').map(f => f.trim()).filter(f => f !== '');
        const tempNewItem = gameState.tempNewItem;

        // 特徴のマッピング
        tempNewItem.characteristics.category = [];

        if (features.includes("生き物")) {
            tempNewItem.characteristics.living = "はい";
            tempNewItem.characteristics.category.push("生き物");
        } else if (features.includes("生き物でない")) {
            tempNewItem.characteristics.living = "いいえ";
        }

        if (features.includes("乗り物")) tempNewItem.characteristics.category.push("乗り物");
        if (features.includes("食べ物")) tempNewItem.characteristics.category.push("食べ物");
        if (features.includes("文房具")) tempNewItem.characteristics.category.push("文房具");
        if (features.includes("家電")) tempNewItem.characteristics.category.push("家電");
        if (features.includes("配送")) tempNewItem.characteristics.category.push("配送");
        if (features.includes("場所・建造物")) tempNewItem.characteristics.category.push("場所・建造物");
        if (features.includes("イベント・概念")) tempNewItem.characteristics.category.push("イベント・概念");
        if (features.includes("ブランド")) tempNewItem.characteristics.category.push("ブランド");
        if (features.includes("ゲーム・作品")) tempNewItem.characteristics.category.push("ゲーム・作品");

        if (tempNewItem.characteristics.category.length === 0) {
            tempNewItem.characteristics.category.push("その他");
        }

        if (features.includes("電気")) tempNewItem.characteristics.power_source = "電気";
        else if (features.includes("ガソリン")) tempNewItem.characteristics.power_source = "ガソリン";
        else if (features.includes("電源なし")) tempNewItem.characteristics.power_source = "なし";

        if (features.includes("車輪")) tempNewItem.characteristics.wheels = "はい";
        else if (features.includes("車輪なし")) tempNewItem.characteristics.wheels = "いいえ";

        tempNewItem.characteristics.purpose = [];
        if (features.includes("書く")) tempNewItem.characteristics.purpose.push("書く");
        if (features.includes("運搬")) tempNewItem.characteristics.purpose.push("運搬");
        if (features.includes("移動")) tempNewItem.characteristics.purpose.push("移動");
        if (features.includes("観光")) tempNewItem.characteristics.purpose.push("観光");
        if (features.includes("食品を冷やす")) tempNewItem.characteristics.purpose.push("食品を冷やす");
        if (features.includes("保存する")) tempNewItem.characteristics.purpose.push("保存する");
        if (features.includes("食べる")) tempNewItem.characteristics.purpose.push("食べる");
        if (features.includes("荷物を送る")) tempNewItem.characteristics.purpose.push("荷物を送る");
        if (features.includes("荷物を受け取る")) tempNewItem.characteristics.purpose.push("荷物を受け取る");
        if (features.includes("ペット")) tempNewItem.characteristics.purpose.push("ペット");
        if (features.includes("番犬")) tempNewItem.characteristics.purpose.push("番犬");
        if (features.includes("盲導犬")) tempNewItem.characteristics.purpose.push("盲導犬");
        if (features.includes("電波塔")) tempNewItem.characteristics.purpose.push("電波塔");
        if (features.includes("祝う")) tempNewItem.characteristics.purpose.push("祝う");
        if (features.includes("楽しむ")) tempNewItem.characteristics.purpose.push("楽しむ");
        if (features.includes("エンターテイメント")) tempNewItem.characteristics.purpose.push("エンターテイメント");
        if (features.includes("配信")) tempNewItem.characteristics.purpose.push("配信");
        if (features.includes("遊ぶ")) tempNewItem.characteristics.purpose.push("遊ぶ");

        const mainFeatures = ["生き物", "生き物でない", "乗り物", "食べ物", "文房具", "家電", "配送", "場所・建造物", "イベント・概念", "ブランド", "ゲーム・作品", "電気", "ガソリン", "電源なし", "車輪", "車輪なし", "書く", "運搬", "移動", "観光", "食品を冷やす", "保存する", "食べる", "荷物を送る", "荷物を受け取る", "ペット", "番犬", "盲導犬", "電波塔", "祝う", "楽しむ", "エンターテイメント", "配信", "遊ぶ"];
        tempNewItem.characteristics.other_features = features.filter(f => !mainFeatures.includes(f));
        const finalItem = { ...tempNewItem };
        return finalItem;
    }
    return null; // 何も処理しない場合はnullを返す
}

// 人物・キャラ選択時の処理
export function showAkinatorLink() {
    uiElements.messageElement.textContent = "お人間さん、人物やキャラをお探しなのですね！";
    uiElements.initialSelectionButtons.style.display = 'none';
    uiElements.mainQuestionButtons.style.display = 'none';
    uiElements.akinatorLinkArea.style.display = 'flex';
    uiElements.btnStartOver.addEventListener('click', restartGame);
}

// 初期画面表示
export function setupInitialUI() {
    uiElements.messageElement.textContent = "お人間さん。お探しのお品さんは、モノですか？　サービスですか？　それとも人物やキャラさんですか？";
    uiElements.initialSelectionButtons.style.display = 'grid';
    uiElements.mainQuestionButtons.style.display = 'none';
    uiElements.candidateSelectionArea.style.display = 'none';
    uiElements.inputAnswerArea.style.display = 'none';
    uiElements.akinatorLinkArea.style.display = 'none';
}

// ダークモードのトグル
export function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const titleElement = document.querySelector('h1');
    if (document.body.classList.contains('dark-mode')) {
        uiElements.darkModeToggle.textContent = '☀️';
        document.title = 'ダークルンルンの『教えて下さい、お人間さん』';
        if (titleElement) {
            titleElement.textContent = 'ダークルンルンの『教えて下さい、お人間さん』';
        }
    } else {
        uiElements.darkModeToggle.textContent = '🌙';
        document.title = 'るんちょまの『教えて下さい、お人間さん』';
        if (titleElement) {
            titleElement.textContent = 'るんちょまの『教えて下さい、お人間さん』';
        }
    }
}