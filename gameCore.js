import { loadItemsFromLocalStorage, getActiveItems, setActiveItems, addNewItem } from './dataManager.js';
import { findNextQuestion, resetUsedQuestions, setCurrentContext, getSpecificQuestions } from './questionSelector.js';
import { uiElements, setupInitialUI, askQuestion, displayCandidates, showAkinatorLink, toggleDarkMode } from './ui.js?v=2';
import { setButtonsEnabled, restartGame } from './utils.js';

// --- ゲーム状態管理 ---
export const QUESTION_PHASES = {
    INITIAL: 'INITIAL_PHASE',
    RANDOM: 'RANDOM_PHASE',
    SEQUENTIAL: 'SEQUENTIAL_PHASE',
    CONTEXTUAL: 'CONTEXTUAL_PHASE',
    CANDIDATE: 'CANDIDATE_PHASE',
    LEARNING: 'LEARNING_PHASE'
};

export let gameState = {
    questionCount: 0,
    isProcessing: false,
    selectedInitialType: "",
    inputPhase: 'name',
    tempNewItem: null,
    currentQuestion: null,
    currentQuestionPhase: QUESTION_PHASES.INITIAL,
    askedQuestions: [], // 聞いた質問をすべて保存する配列
    learningPhaseQuestionIndex: 0 // 学習フェーズで使う質問のインデックス
};

export function setProcessing(isProcessing) {
    gameState.isProcessing = isProcessing;
}

// --- 回答処理 ---
export function handleAnswer(answer) {
    console.log(`--- handleAnswer 開始 (回答: ${answer}) ---`);
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;
    setButtonsEnabled(false, uiElements);

    try {
        if (!gameState.currentQuestion) {
            console.error("currentQuestionが設定されていません。");
            displayCandidates(getActiveItems(), (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing, promptForAnswer, gameState);
            return;
        }

        let activeItems = getActiveItems();
        activeItems.forEach(item => {
            const charValue = item.characteristics[gameState.currentQuestion.characteristic];
            // console.log(`アイテム: ${item.name}, 特性(${gameState.currentQuestion.characteristic}): ${charValue}, 現在のスコア: ${item.score}`);

            if (charValue === undefined || charValue === null || charValue === "不明" || (Array.isArray(charValue) && charValue.length === 0)) {
                // console.log(`特性が不明または空のため、「分からない」として処理。`);
                return;
            }

            if (answer !== 'unknown') {
                let match = false;
                const questionChar = gameState.currentQuestion.characteristic;
                const questionYesValue = gameState.currentQuestion.yesValue;
                const questionNoValue = gameState.currentQuestion.noValue;

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
                    // console.log(`スコア +1: ${item.name} (新スコア: ${item.score})`);
                } else {
                    item.score -= 1;
                    // console.log(`スコア -1: ${item.name} (新スコア: ${item.score})`);
                } 
            }
        });
        setActiveItems(activeItems);

        // --- コンテキスト切り替え処理 ---
        if (
            answer === 'yes' &&
            (
                (gameState.currentQuestion.characteristic === 'category' && gameState.currentQuestion.yesValue === '生き物') ||
                (gameState.currentQuestion.characteristic === 'living' && yesMeansLivingIsAnimal(gameState.currentQuestion))
            )
        ) {
            console.log(`コンテキストを「category: 生き物」に設定します。`);
            setCurrentContext('category', '生き物');
            gameState.currentQuestionPhase = QUESTION_PHASES.CONTEXTUAL;
        } else if (answer === 'yes' && getSpecificQuestions(gameState.currentQuestion.characteristic, gameState.currentQuestion.yesValue).length > 0) {
            console.log(`コンテキストを「${gameState.currentQuestion.characteristic}: ${gameState.currentQuestion.yesValue}」に設定します。`);
            setCurrentContext(gameState.currentQuestion.characteristic, gameState.currentQuestion.yesValue);
            gameState.currentQuestionPhase = QUESTION_PHASES.CONTEXTUAL;
        }

        gameState.questionCount++;

        const maxScore = Math.max(...getActiveItems().map(i => i.score));
        const topCandidates = getActiveItems().filter(item => item.score === maxScore);

        if (gameState.questionCount >= 10 || (maxScore >= 3 && topCandidates.length > 0 && topCandidates.length <= 5)) {
            gameState.currentQuestionPhase = QUESTION_PHASES.CANDIDATE;
            displayCandidates(getActiveItems(), (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing, promptForAnswer, gameState);
            return;
        }

        // 質問フェーズに応じた次の質問の選択
        if (gameState.currentQuestionPhase === QUESTION_PHASES.RANDOM && gameState.questionCount >= 5) { // 例: ランダム質問を5問消化したらシーケンシャルへ
            gameState.currentQuestionPhase = QUESTION_PHASES.SEQUENTIAL;
        }

        const nextQuestion = findNextQuestion(getActiveItems(), gameState.currentQuestionPhase);
        if (nextQuestion) {
            gameState.currentQuestion = nextQuestion;
            gameState.askedQuestions.push(gameState.currentQuestion); // 質問を履歴に追加
            askQuestion(gameState.currentQuestion.text, (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing);
        } else {
            console.log("現在のフェーズの質問が尽きました。シーケンシャルフェーズに移行します。");
            gameState.currentQuestionPhase = QUESTION_PHASES.SEQUENTIAL;
            const sequentialQuestion = findNextQuestion(getActiveItems(), gameState.currentQuestionPhase);
            if (sequentialQuestion) {
                gameState.currentQuestion = sequentialQuestion;
                gameState.askedQuestions.push(gameState.currentQuestion); // 質問を履歴に追加
                askQuestion(gameState.currentQuestion.text, (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing);
            } else {
                gameState.currentQuestionPhase = QUESTION_PHASES.CANDIDATE;
                displayCandidates(getActiveItems(), (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing, promptForAnswer, gameState);
            }
        }

    } catch (error) {
        console.error("予期せぬエラーが発生しました: ", error);
        uiElements.messageElement.textContent = "申し訳ありません、お人間さん。予期せぬ問題が起きてしまいました。ページを再読み込みして、もう一度試していただけますか？";
        setButtonsEnabled(false, uiElements);
        gameState.isProcessing = false;
    }
    // console.log("--- handleAnswer 終了 ---");
}


// --- 初期質問ハンドラ ---
export function handleInitialAnswer(type) {
    // console.log(`--- handleInitialAnswer 開始 (タイプ: ${type}) ---`);
    const currentTime = Date.now();
    if (gameState.lastClickTime && currentTime - gameState.lastClickTime < 500) { // 500msのクールダウン
        uiElements.messageElement.textContent = "お人間さん、少し落ち着いてくださいね。";
        return;
    }
    gameState.lastClickTime = currentTime;

    if (gameState.isProcessing) return;
    gameState.isProcessing = true;
    setButtonsEnabled(false, uiElements);

    gameState.selectedInitialType = type;

    if (type === 'person_char') {
        showAkinatorLink();
        gameState.isProcessing = false;
    } else {
        let activeItems = getActiveItems().filter(item => {
            if (Array.isArray(item.characteristics.type)) {
                return item.characteristics.type.includes(type);
            } else {
                return item.characteristics.type === type;
            }
        });
        setActiveItems(activeItems);
        // console.log("フィルタリング後のactiveItems:", activeItems);

        if (activeItems.length === 0) {
            uiElements.messageElement.textContent = "お人間さん、申し訳ありません。そのカテゴリのお品さんは、るんちょまの知識にはまだないようです…。";
            uiElements.initialSelectionButtons.style.display = 'none';
            uiElements.mainQuestionButtons.style.display = 'none';
            uiElements.inputAnswerArea.style.display = 'flex';
            uiElements.userAnswerInput.style.display = 'none';
            uiElements.btnSubmitAnswer.style.display = 'none';
            uiElements.btnRestartGame.style.display = 'block';
            gameState.isProcessing = false;
            return;
        }
        
        gameState.currentQuestionPhase = QUESTION_PHASES.RANDOM; // 初期選択後はランダムフェーズへ
        const nextQuestion = findNextQuestion(getActiveItems(), gameState.currentQuestionPhase);
        if (nextQuestion) {
            gameState.currentQuestion = nextQuestion;
            gameState.askedQuestions.push(gameState.currentQuestion); // 最初の質問を履歴に追加
            askQuestion(gameState.currentQuestion.text, (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing);
        } else {
            gameState.currentQuestionPhase = QUESTION_PHASES.CANDIDATE;
            displayCandidates(getActiveItems(), (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing, promptForAnswer, gameState);
        }
    }
    // console.log("--- handleInitialAnswer 終了 ---");
}

// --- イベントリスナー設定 ---
export function initializeEventListeners() {
    uiElements.btnSelectMono.addEventListener('click', () => handleInitialAnswer('モノ'));
    uiElements.btnSelectService.addEventListener('click', () => handleInitialAnswer('サービス'));
    uiElements.btnSelectPersonChar.addEventListener('click', () => handleInitialAnswer('person_char'));

    uiElements.btnYes.addEventListener('click', () => {
        if (gameState.currentQuestionPhase === QUESTION_PHASES.LEARNING) {
            handleLearningAnswer('yes');
        } else {
            handleAnswer('yes');
        }
    });
    uiElements.btnNo.addEventListener('click', () => {
        if (gameState.currentQuestionPhase === QUESTION_PHASES.LEARNING) {
            handleLearningAnswer('no');
        } else {
            handleAnswer('no');
        }
    });
    uiElements.btnUnknown.addEventListener('click', () => {
        if (gameState.currentQuestionPhase === QUESTION_PHASES.LEARNING) {
            handleLearningAnswer('unknown');
        } else {
            handleAnswer('unknown');
        }
    });

    uiElements.btnNotInList.addEventListener('click', () => {
        if (gameState.isProcessing) return;
        gameState.isProcessing = true;
        setButtonsEnabled(false, uiElements);
        promptForAnswer(gameState);
    });

    uiElements.btnRestartGame.addEventListener('click', restartGame);
    uiElements.btnSubmitAnswer.addEventListener('click', handleSubmitNewItemName);
    uiElements.darkModeToggle.addEventListener('click', toggleDarkMode);

    // README表示ボタンのイベントリスナー
    uiElements.btnShowReadme.addEventListener('click', async () => {
        const readmeDisplayArea = document.getElementById('readme-display-area');
        if (readmeDisplayArea.style.display === 'none') {
            try {
                const response = await fetch('README.md');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const readmeText = await response.text();
                readmeDisplayArea.innerHTML = `<pre>${readmeText}</pre><button class="close-button">×</button>`;
                readmeDisplayArea.style.display = 'block';
                readmeDisplayArea.querySelector('.close-button').addEventListener('click', () => {
                    readmeDisplayArea.style.display = 'none';
                });
            } catch (error) {
                console.error('README.md の読み込みに失敗しました:', error);
                readmeDisplayArea.innerHTML = '<p>README.md の読み込みに失敗しました。</p>';
                readmeDisplayArea.style.display = 'block';
            }
        } else {
            readmeDisplayArea.style.display = 'none';
        }
    });
}

// --- 学習フェーズ関連の関数 ---

function promptForAnswer(gameState) {
    gameState.currentQuestionPhase = QUESTION_PHASES.LEARNING;
    uiElements.messageElement.textContent = "お人間さん、残念ながら特定できそうにないです…。申し訳ありませんが、お探しのお品さんの名前を教えていただけませんか？";
    uiElements.initialSelectionButtons.style.display = 'none';
    uiElements.mainQuestionButtons.style.display = 'none';
    uiElements.candidateSelectionArea.style.display = 'none';
    uiElements.inputAnswerArea.style.display = 'flex';
    uiElements.userAnswerInput.style.display = 'block';
    uiElements.btnSubmitAnswer.style.display = 'block';
    uiElements.btnRestartGame.style.display = 'block';
    uiElements.userAnswerInput.placeholder = "お品さんの名前を入力してください";
    uiElements.userAnswerInput.value = '';
    setButtonsEnabled(true, uiElements);
    uiElements.btnSubmitAnswer.disabled = false;
    uiElements.btnRestartGame.disabled = false;
}

function handleSubmitNewItemName() {
    const answer = uiElements.userAnswerInput.value.trim();
    if (!answer) {
        uiElements.messageElement.textContent = "お人間さん、何か入力してくださいね。";
        return;
    }

    gameState.tempNewItem = {
        name: answer,
        characteristics: {
            type: gameState.selectedInitialType,
            category: [],
            purpose: [],
            other_features: []
        }
    };

    uiElements.userAnswerInput.style.display = 'none';
    uiElements.btnSubmitAnswer.style.display = 'none';
    uiElements.mainQuestionButtons.style.display = 'grid';

    askNextLearningQuestion();
}

function askNextLearningQuestion() {
    if (gameState.learningPhaseQuestionIndex < gameState.askedQuestions.length) {
        const question = gameState.askedQuestions[gameState.learningPhaseQuestionIndex];
        uiElements.messageElement.textContent = `『${gameState.tempNewItem.name}』についてお聞きします。
「${question.text}」
この質問は当てはまりますか？`;
        setButtonsEnabled(true, uiElements);
    } else {
        // 学習完了
        addNewItem(gameState.tempNewItem);
        uiElements.messageElement.textContent = `お人間さん、ありがとうございます！『${gameState.tempNewItem.name}さん』について、るんちょま、覚えました！`;
        uiElements.mainQuestionButtons.style.display = 'none';
        uiElements.btnRestartGame.style.display = 'block';
        setButtonsEnabled(false, uiElements);
    }
}

function handleLearningAnswer(answer) {
    const question = gameState.askedQuestions[gameState.learningPhaseQuestionIndex];
    const characteristic = question.characteristic;
    const yesValue = question.yesValue;
    const tempItem = gameState.tempNewItem;

    if (answer === 'yes') {
        if (Array.isArray(tempItem.characteristics[characteristic])) {
            if (!tempItem.characteristics[characteristic].includes(yesValue)) {
                tempItem.characteristics[characteristic].push(yesValue);
            }
        } else {
            tempItem.characteristics[characteristic] = yesValue;
        }
    } else if (answer === 'no') {
        // 「いいえ」の場合のロジックは、特性の性質によるため、一旦シンプルな実装に
        // 例えば、categoryのような配列の場合、何もしないか、特定の「否定」値を入れるかなど
    } 
    // 「不明」の場合は何もしない

    gameState.learningPhaseQuestionIndex++;
    askNextLearningQuestion();
}


// --- ゲーム初期化 ---
function initializeGame() {
    setActiveItems(loadItemsFromLocalStorage());
    setupInitialUI();
    initializeEventListeners();
    resetUsedQuestions();
}

// DOMが読み込まれたらゲームを初期化
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeGame);
}

// living特性の「生き物ですか？」が生き物判定かどうか
function yesMeansLivingIsAnimal(question) {
    // 「生き物ですか？」の質問文や特性名で判定
    return question.characteristic === 'living' && (question.text.includes('生き物') || question.yesValue === 'はい');
}