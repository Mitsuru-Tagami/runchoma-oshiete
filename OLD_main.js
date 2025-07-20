import { items } from './data.js';

const messageElement = document.getElementById('message');
const initialSelectionButtons = document.getElementById('initial-selection-buttons');
const mainQuestionButtons = document.getElementById('main-question-buttons');
const candidateSelectionArea = document.getElementById('candidate-selection');
const candidateListDiv = document.getElementById('candidate-list');
const btnNotInList = document.getElementById('btn-not-in-list');

const inputAnswerArea = document.getElementById('input-answer-area');
const userAnswerInput = document.getElementById('user-answer-input');
const btnSubmitAnswer = document.getElementById('btn-submit-answer');
const btnRestartGame = document.getElementById('btn-restart-game');

const akinatorLinkArea = document.getElementById('akinator-link-area');
const btnStartOver = document.getElementById('btn-start-over');

const btnSelectMono = document.getElementById('btn-select-mono');
const btnSelectService = document.getElementById('btn-select-service');
const btnSelectPersonChar = document.getElementById('btn-select-person-char');

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnUnknown = document.getElementById('btn-unknown');
const darkModeToggle = document.getElementById('dark-mode-toggle');

let questionCount = 0; // 質問数をカウント
let activeItems = []; // 初期化はlocalStorageから行う
let isProcessing = false; // 処理中フラグ
let selectedInitialType = ""; // 最初の質問で選択されたタイプを記憶
let inputPhase = 'name'; // 'name' or 'characteristics'
let tempNewItem = null; // 新しいアイテムを一時的に保持
let usedQuestionIndices = new Set(); // 使用済みの質問インデックスを追跡
let currentQuestion = null; // 現在の質問オブジェクトを保持

// 質問の定義
const questions = [
    {
        text: "お人間さん。それは生き物さんですか？",
        characteristic: "living",
        yesValue: "はい",
        noValue: "いいえ"
    },
    {
        text: "お人間さん。それは乗り物さんですか？",
        characteristic: "category",
        yesValue: "乗り物",
        noValue: (val) => !val.includes("乗り物") // 配列に含まれているかチェック
    },
    {
        text: "お人間さん。それは書くためのものですか？",
        characteristic: "purpose",
        yesValue: "書く",
        noValue: (val) => !val.includes("書く")
    },
    {
        text: "お人間さん。それは電気で動きますか？",
        characteristic: "power_source",
        yesValue: "電気",
        noValue: (val) => val !== "電気"
    },
    {
        text: "お人間さん。それは食べ物さんですか？",
        characteristic: "category",
        yesValue: "食べ物",
        noValue: (val) => !val.includes("食べ物")
    },
    {
        text: "お人間さん。それはドアがありますか？",
        characteristic: "other_features",
        yesValue: "ドアがある",
        noValue: (val) => !val.includes("ドアがある")
    },
    {
        text: "お人間さん。それは荷物を運ぶものですか？",
        characteristic: "purpose",
        yesValue: "運搬",
        noValue: (val) => !val.includes("運搬")
    },
    {
        text: "お人間さん。それは四角い形をしていますか？",
        characteristic: "other_features",
        yesValue: "四角い",
        noValue: (val) => !val.includes("四角い")
    },
    {
        text: "お人間さん。それはプレゼントと関係がありますか？",
        characteristic: "other_features",
        yesValue: "プレゼント",
        noValue: (val) => !val.includes("プレゼント")
    },
    {
        text: "お人間さん。それは車輪がありますか？",
        characteristic: "wheels",
        yesValue: "はい",
        noValue: "いいえ"
    }
];

// --- NEW: エントロピーを計算する関数 ---
function calculateEntropy(items) {
    if (items.length === 0) {
        return 0;
    }

    const counts = {};
    items.forEach(item => {
        // ここでは、最終的な特定対象の「名前」をクラスとして扱う
        counts[item.name] = (counts[item.name] || 0) + 1;
    });

    let entropy = 0;
    for (const name in counts) {
        const probability = counts[name] / items.length;
        entropy -= probability * Math.log2(probability);
    }
    return entropy;
}

// --- NEW: 次の最適な質問を見つける関数 ---
function findNextQuestion() {
    console.log("--- findNextQuestion 開始 ---");
    let bestQuestionIndex = -1;
    let maxInformationGain = -1;
    let bestQuestion = null;

    const currentEntropy = calculateEntropy(activeItems); // 現在の候補リストのエントロピー

    // まだ使われていない質問をループ
    for (let i = 0; i < questions.length; i++) {
        if (usedQuestionIndices.has(i)) {
            continue; // この質問は既に使用済み
        }

        const question = questions[i];
        const yesItems = [];
        const noItems = [];

        // この質問で候補を「はい」と「いいえ」に分ける
        activeItems.forEach(item => {
            const charValue = item.characteristics[question.characteristic];

            if (charValue === undefined || charValue === null || charValue === "不明" || (Array.isArray(charValue) && charValue.length === 0)) {
                // 特性が不明なアイテムはどちらにも分類しない（情報利得に影響させない）
                return;
            }

            let match = false;
            if (ArrayValue) {
                if (charValue.includes(question.yesValue)) {
                    match = true;
                }
            } else {
                if (charValue === question.yesValue) {
                    match = true;
                }
            }

            if (match) {
                yesItems.push(item);
            } else {
                noItems.push(item);
            }
        });

        // どちらかのグループが空の場合、その質問は情報利得が低いのでスキップ
        if (yesItems.length === 0 || noItems.length === 0) {
            continue;
        }

        // 分割後のエントロピーを計算
        const entropyYes = calculateEntropy(yesItems);
        const entropyNo = calculateEntropy(noItems);

        const weightedEntropy = 
            (yesItems.length / activeItems.length) * entropyYes +
            (noItems.length / activeItems.length) * entropyNo;

        const informationGain = currentEntropy - weightedEntropy;

        // 最も情報利得の大きい質問を選ぶ
        if (informationGain > maxInformationGain) {
            maxInformationGain = informationGain;
            bestQuestionIndex = i;
            bestQuestion = question;
        }
    }

    if (bestQuestion) {
        console.log(`次の最適な質問が見つかりました: #${bestQuestionIndex} 「${bestQuestion.text}」 (情報利得: ${maxInformationGain.toFixed(2)})`);
        usedQuestionIndices.add(bestQuestionIndex); // この質問を使用済みにする
        return bestQuestion;
    }

    console.log("最適な質問が見つかりませんでした。");
    return null; // もう適切な質問がない
}

// localStorageからアイテムを読み込む
function loadItemsFromLocalStorage() {
    console.log("--- loadItemsFromLocalStorage 開始 ---");
    const storedItems = localStorage.getItem('runchomaItems');
    if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        console.log("localStorageから読み込んだアイテム:", parsedItems);
        // data.jsの初期アイテムとlocalStorageのアイテムを統合
        // 名前が重複する場合はlocalStorageのアイテムを優先
        const combinedItems = [...items];
        parsedItems.forEach(storedItem => {
            if (!combinedItems.some(item => item.name === storedItem.name)) {
                combinedItems.push(storedItem);
            }
        });
        activeItems = combinedItems.map(item => ({ ...item, score: 0 }));
        console.log("初期アイテムと統合後のactiveItems:", activeItems);
    } else {
        activeItems = items.map(item => ({ ...item, score: 0 }));
        console.log("localStorageにアイテムがないため、初期アイテムでactiveItemsを初期化:", activeItems);
    }
    console.log("--- loadItemsFromLocalStorage 終了 ---");
}

// アイテムをlocalStorageに保存する
function saveItemsToLocalStorage() {
    console.log("--- saveItemsToLocalStorage 開始 ---");
    // スコアなどの一時的なプロパティを除外して保存
    const itemsToSave = activeItems.map(({ score, ...rest }) => rest);
    localStorage.setItem('runchomaItems', JSON.stringify(itemsToSave));
    console.log("localStorageに保存したアイテム:", itemsToSave);
    console.log("--- saveItemsToLocalStorage 終了 ---");
}

// ボタンの状態を切り替える関数
function setButtonsEnabled(enabled) {
    // 最初の質問ボタン
    btnSelectMono.disabled = !enabled;
    btnSelectService.disabled = !enabled;
    btnSelectPersonChar.disabled = !enabled;

    // 通常の質問ボタン
    btnYes.disabled = !enabled;
    btnNo.disabled = !enabled;
    btnUnknown.disabled = !enabled;

    if (btnNotInList) {
        btnNotInList.disabled = !enabled;
    }
    // 候補リストのボタンも無効化するならここに追加
    const candidateButtons = document.querySelectorAll('.candidate-button');
    candidateButtons.forEach(button => {
        button.disabled = !enabled;
    });
}

// ゲームをリスタートする関数
function restartGame() {
    console.log("ゲームをリスタートします。");
    location.reload();
}

// 質問を表示する関数
function askQuestion(questionText) {
    console.log("質問を表示: ", questionText);
    messageElement.textContent = questionText;
    initialSelectionButtons.style.display = 'none'; // 最初の質問ボタンを非表示
    mainQuestionButtons.style.display = 'grid'; // 通常の質問ボタンを表示
    candidateSelectionArea.style.display = 'none';
    inputAnswerArea.style.display = 'none'; // 入力エリアを非表示
    akinatorLinkArea.style.display = 'none'; // アキネーターリンクエリアを非表示
    setButtonsEnabled(true); // ボタンを有効化
    isProcessing = false; // 処理中フラグをリセット
}

// 最終特定結果を表示する関数
function displayFinalResult(itemName) {
    console.log("最終特定結果を表示: ", itemName);
    messageElement.textContent = `お人間さん！るんちょま、見つけましたよ！お探しのお品さんは、もしかして『${itemName}さん』ですか？`;
    initialSelectionButtons.style.display = 'none';
    mainQuestionButtons.style.display = 'none';
    candidateSelectionArea.style.display = 'none';
    inputAnswerArea.style.display = 'flex'; // リスタートボタンのために表示
    userAnswerInput.style.display = 'none'; // 入力フィールドは非表示
    btnSubmitAnswer.style.display = 'none'; // 送信ボタンは非表示
    btnRestartGame.style.display = 'block'; // リスタートボタンを表示
    setButtonsEnabled(false); // ボタンを無効化
}

// 答えの入力を促す関数
function promptForAnswer() {
    console.log("答えの入力を促します。");
    messageElement.textContent = "お人間さん、残念ながら特定できそうにないです…。申し訳ありませんが、答えを教えていただけませんか？";
    initialSelectionButtons.style.display = 'none';
    mainQuestionButtons.style.display = 'none';
    candidateSelectionArea.style.display = 'none';
    inputAnswerArea.style.display = 'flex'; // 入力エリアを表示
    userAnswerInput.style.display = 'block'; // 入力フィールドを表示
    btnSubmitAnswer.style.display = 'block'; // 送信ボタンは表示
    btnRestartGame.style.display = 'block'; // リスタートボタンを表示
    setButtonsEnabled(true); // Allow input
    btnSubmitAnswer.disabled = false;
    btnRestartGame.disabled = false;

    inputPhase = 'name'; // フェーズを初期化
    userAnswerInput.placeholder = "お品さんの名前を入力してください";
    userAnswerInput.value = '';
}

// btnSubmitAnswer のクリックハンドラ
function handleSubmitAnswer() {
    console.log("--- handleSubmitAnswer 開始 ---");
    const answer = userAnswerInput.value.trim();
    if (!answer) {
        messageElement.textContent = "お人間さん、何か入力してくださいね。";
        console.log("入力が空です。");
        return;
    }

    if (inputPhase === 'name') {
        console.log("フェーズ: 名前入力");
        tempNewItem = {
            name: answer,
            characteristics: {
                type: selectedInitialType,
                category: [],
                living: "不明",
                wheels: "不明",
                power_source: "不明",
                purpose: [],
                other_features: []
            }
        };
        console.log("tempNewItem (名前入力後):");
        messageElement.textContent = `お人間さん、ありがとうございます！『${answer}さん』ですね！\n続けて、そのお品さんの特徴をカンマ区切りで教えていただけませんか？\n例: 生き物, 乗り物, 四足歩行`;
        userAnswerInput.placeholder = "特徴をカンマ区切りで入力してください 例: 生き物, 四足歩行";
        userAnswerInput.value = '';

        inputPhase = 'characteristics';
    } else if (inputPhase === 'characteristics') {
        console.log("フェーズ: 特徴入力");
        const features = answer.split(',').map(f => f.trim()).filter(f => f !== '');
        
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

        // other_featuresには、主要な特性キーワードを除いたものを設定
        const mainFeatures = ["生き物", "生き物でない", "乗り物", "食べ物", "文房具", "家電", "配送", "場所・建造物", "イベント・概念", "ブランド", "ゲーム・作品", "電気", "ガソリン", "電源なし", "車輪", "車輪なし", "書く", "運搬", "移動", "観光", "食品を冷やす", "保存する", "食べる", "荷物を送る", "荷物を受け取る", "ペット", "番犬", "盲導犬", "電波塔", "祝う", "楽しむ", "エンターテイメント", "配信", "遊ぶ"];
        tempNewItem.characteristics.other_features = features.filter(f => !mainFeatures.includes(f));


        activeItems.push({ ...tempNewItem, score: 0 }); // スコアは0で追加
        saveItemsToLocalStorage(); // localStorageに保存

        console.log("ユーザーが入力した答えと特徴 (最終):");
        messageElement.textContent = `お人間さん、ありがとうございます！『${tempNewItem.name}さん』について、るんちょま、覚えました！\nお手数かけました、お人間さん。`;
        userAnswerInput.value = '';
        btnSubmitAnswer.style.display = 'none';
        userAnswerInput.style.display = 'none';
        btnRestartGame.style.display = 'block';
        inputPhase = 'name';
        tempNewItem = null;
    }
}

// 候補リストを表示する関数
function displayCandidates() {
    console.log("--- displayCandidates 開始 ---");
    // スコアが最も高いアイテムをフィルタリング
    let maxScore = -Infinity;
    activeItems.forEach(item => {
        if (item.score > maxScore) {
            maxScore = item.score;
        }
    });
    
    // スコアが0やマイナスの場合も考慮し、最高スコアが1未満なら候補なしとする
    const topCandidates = maxScore < 1 ? [] : activeItems.filter(item => item.score === maxScore);

    console.log("現在のactiveItems (スコア順):");
    console.log("上位候補:", topCandidates);

    if (topCandidates.length > 0 && topCandidates.length <= 5) {
        messageElement.textContent = "お人間さん！もしかして、お探しのお品さんは、この中にいらっしゃいますか？";
        initialSelectionButtons.style.display = 'none';
        mainQuestionButtons.style.display = 'none';
        candidateSelectionArea.style.display = 'block';
        inputAnswerArea.style.display = 'none';
        akinatorLinkArea.style.display = 'none';
        candidateListDiv.innerHTML = '';

        topCandidates.forEach(item => {
            const button = document.createElement('button');
            button.textContent = item.name;
            button.classList.add('candidate-button');
            button.addEventListener('click', () => displayFinalResult(item.name));
            candidateListDiv.appendChild(button);
        });
        setButtonsEnabled(true);
    } else {
        promptForAnswer();
    }
    isProcessing = false;
    console.log("--- displayCandidates 終了 ---");
}

// 回答を処理する関数
function handleAnswer(answer) {
    console.log(`--- handleAnswer 開始 (回答: ${answer}) ---`);
    if (isProcessing) {
        console.log(`処理中のため、handleAnswerをスキップ。`);
        return;
    }
    isProcessing = true;
    setButtonsEnabled(false);

    try {
        // currentQuestionがnullの場合のハンドリング
        if (!currentQuestion) {
            console.error("currentQuestionが設定されていません。");
            displayCandidates(); // 質問がないので候補を表示
            return;
        }

        console.log("現在の質問:", currentQuestion.text, "(特性:", currentQuestion.characteristic, ")");

        activeItems.forEach(item => {
            const charValue = item.characteristics[currentQuestion.characteristic];
            console.log(`アイテム: ${item.name}, 特性(${currentQuestion.characteristic}): ${charValue}, 現在のスコア: ${item.score}`);

            if (charValue === undefined || charValue === null || charValue === "不明" || (Array.isArray(charValue) && charValue.length === 0)) {
                // 特性が不明なアイテムは「分からない」として扱う
                console.log(`特性が不明または空のため、「分からない」として処理。`);
                return;
            }

            if (answer !== 'unknown') {
                let match = false;
                const questionChar = currentQuestion.characteristic;
                const questionYesValue = currentQuestion.yesValue;
                const questionNoValue = currentQuestion.noValue;

                // 特性値が配列の場合の処理
                if (Array.isArray(charValue)) {
                    if (answer === 'yes') {
                        match = charValue.includes(questionYesValue);
                    } else { // answer === 'no'
                        if (typeof questionNoValue === 'function') {
                            match = questionNoValue(charValue);
                        } else {
                            match = !charValue.includes(questionYesValue);
                        }
                    }
                } else { // 特性値が単一値の場合の処理
                    if (answer === 'yes') {
                        match = (charValue === questionYesValue);
                    } else { // answer === 'no'
                        if (typeof questionNoValue === 'function') {
                            match = questionNoValue(charValue);
                        }
                        else {
                            match = (charValue !== questionYesValue);
                        }
                    }
                }

                if (match) {
                    item.score += 1;
                    console.log(`スコア +1: ${item.name} (新スコア: ${item.score})`);
                } else {
                    item.score -= 1;
                    console.log(`スコア -1: ${item.name} (新スコア: ${item.score})`);
                }
            }
        });

        questionCount++;

        // 候補が十分に絞られたか、質問がなくなったかチェック
        const maxScore = Math.max(...activeItems.map(i => i.score));
        const topCandidates = activeItems.filter(item => item.score === maxScore);

        if (questionCount >= 10 || (topCandidates.length > 0 && topCandidates.length <= 5)) {
            console.log("質問回数上限または候補が絞られました。候補を表示します。");
            displayCandidates();
            return; // 候補を表示して終了
        }

        currentQuestion = findNextQuestion();
        if (currentQuestion) {
            askQuestion(currentQuestion.text);
        } else {
            console.log("もう質問がありません。候補を表示します。");
            displayCandidates();
        }

    } catch (error) {
        console.error("予期せぬエラーが発生しました: ", error);
        messageElement.textContent = "申し訳ありません、お人間さん。予期せぬ問題が起きてしまいました。ページを再読み込みして、もう一度試していただけますか？";
        setButtonsEnabled(false);
        isProcessing = false;
    }
    console.log("--- handleAnswer 終了 ---");
}

// 最初の質問のハンドラ
function handleInitialAnswer(type) {
    console.log(`--- handleInitialAnswer 開始 (タイプ: ${type}) ---
`);
    if (isProcessing) {
        console.log("処理中のため、handleInitialAnswerをスキップ。");
        return;
    }
    isProcessing = true;
    setButtonsEnabled(false);

    selectedInitialType = type;
    console.log("selectedInitialType:", selectedInitialType);

    if (type === 'person_char') {
        messageElement.textContent = "お人間さん、人物やキャラをお探しなのですね！";
        initialSelectionButtons.style.display = 'none';
        mainQuestionButtons.style.display = 'none';
        akinatorLinkArea.style.display = 'flex';
        btnStartOver.addEventListener('click', restartGame);
        isProcessing = false;
        console.log("人物・キャラ選択。アキネーターリンク表示。");
    } else {
        // 選択されたタイプでactiveItemsをフィルタリング
        activeItems = activeItems.filter(item => item.characteristics.type === type);
        if (activeItems.length === 0) {
            messageElement.textContent = "お人間さん、申し訳ありません。そのカテゴリのお品さんは、るんちょまの知識にはまだないようです…。";
            initialSelectionButtons.style.display = 'none';
            mainQuestionButtons.style.display = 'none';
            inputAnswerArea.style.display = 'flex';
            userAnswerInput.style.display = 'none';
            btnSubmitAnswer.style.display = 'none';
            btnRestartGame.style.display = 'block';
            isProcessing = false;
            console.log("選択されたカテゴリにアイテムがありません。");
            return;
        }
        
        // 最初の質問を動的に選択する
        currentQuestion = findNextQuestion();
        if (currentQuestion) {
            askQuestion(currentQuestion.text);
        } else {
            // 質問がない場合はいきなり候補表示
            displayCandidates();
        }
    }
    console.log("--- handleInitialAnswer 終了 ---");
}

// イベントリスナーの設定
btnSelectMono.addEventListener('click', () => handleInitialAnswer('モノ'));
btnSelectService.addEventListener('click', () => handleInitialAnswer('サービス'));
btnSelectPersonChar.addEventListener('click', () => handleInitialAnswer('person_char'));

btnYes.addEventListener('click', () => handleAnswer('yes'));
btnNo.addEventListener('click', () => handleAnswer('no'));
btnUnknown.addEventListener('click', () => handleAnswer('unknown'));
btnNotInList.addEventListener('click', () => {
    if (isProcessing) return;
    isProcessing = true;
    setButtonsEnabled(false);
    promptForAnswer();
});
btnRestartGame.addEventListener('click', restartGame);

// ダークモード切り替え
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.textContent = '☀️';
    } else {
        darkModeToggle.textContent = '🌙';
    }
});

// 初期表示
document.addEventListener('DOMContentLoaded', () => {
    loadItemsFromLocalStorage(); // localStorageからアイテムを読み込む
    messageElement.textContent = "お人間さん。お探しのお品さんは、モノですか？　サービスですか？　それとも人物やキャラさんですか？";
    initialSelectionButtons.style.display = 'grid'; // 最初の質問ボタンを表示
    mainQuestionButtons.style.display = 'none'; // 通常の質問ボタンは非表示
    candidateSelectionArea.style.display = 'none';
    inputAnswerArea.style.display = 'none';
    akinatorLinkArea.style.display = 'none';

    // btnSubmitAnswerのイベントリスナーをここで一度だけ設定
    btnSubmitAnswer.addEventListener('click', handleSubmitAnswer);
});