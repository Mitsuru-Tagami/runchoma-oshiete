import { loadItemsFromLocalStorage, getActiveItems, setActiveItems, addNewItem } from './dataManager.js';
import { findNextQuestion, resetUsedQuestions, setCurrentContext, getSpecificQuestions } from './questionSelector.js';
import { uiElements, setupInitialUI, askQuestion, displayCandidates, showAkinatorLink, promptForAnswer, handleSubmitAnswer, toggleDarkMode } from './ui.js';
import { setButtonsEnabled, restartGame } from './utils.js';

// --- ゲーム状態管理 ---
export const QUESTION_PHASES = {
    INITIAL: 'INITIAL_PHASE',
    RANDOM: 'RANDOM_PHASE',
    SEQUENTIAL: 'SEQUENTIAL_PHASE',
    CONTEXTUAL: 'CONTEXTUAL_PHASE', // 新しいフェーズを追加
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
    currentQuestionPhase: QUESTION_PHASES.INITIAL // 新しい質問フェーズ
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
            console.log(`アイテム: ${item.name}, 特性(${gameState.currentQuestion.characteristic}): ${charValue}, 現在のスコア: ${item.score}`);

            if (charValue === undefined || charValue === null || charValue === "不明" || (Array.isArray(charValue) && charValue.length === 0)) {
                console.log(`特性が不明または空のため、「分からない」として処理。`);
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
                    console.log(`スコア +1: ${item.name} (新スコア: ${item.score})`);
                } else {
                    item.score -= 1;
                    console.log(`スコア -1: ${item.name} (新スコア: ${item.score})`);
                } 
            }
        });
        setActiveItems(activeItems);

        // --- コンテキスト切り替え処理 ---
        if (answer === 'yes' && getSpecificQuestions(gameState.currentQuestion.characteristic, gameState.currentQuestion.yesValue).length > 0) {
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

        gameState.currentQuestion = findNextQuestion(getActiveItems(), gameState.currentQuestionPhase);
        if (gameState.currentQuestion) {
            askQuestion(gameState.currentQuestion.text, (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing);
        } else {
            // コンテキスト質問が尽きたら、シーケンシャルフェーズに戻るなど、次のロジックを考える
            console.log("現在のフェーズの質問が尽きました。シーケンシャルフェーズに移行します。");
            gameState.currentQuestionPhase = QUESTION_PHASES.SEQUENTIAL;
            gameState.currentQuestion = findNextQuestion(getActiveItems(), gameState.currentQuestionPhase);
            if (gameState.currentQuestion) {
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
    console.log("--- handleAnswer 終了 ---");
}

// --- 初期質問ハンドラ ---
export function handleInitialAnswer(type) {
    console.log(`--- handleInitialAnswer 開始 (タイプ: ${type}) ---`);
    const currentTime = Date.now();
    if (currentTime - gameState.lastClickTime < gameState.cooldownPeriod) {
        uiElements.messageElement.textContent = "お人間さん、少し落ち着いてくださいね。";
        return;
    }
    gameState.lastClickTime = currentTime;

    console.log("フィルタリング前のactiveItems:", getActiveItems());
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;
    setButtonsEnabled(false, uiElements);

    gameState.selectedInitialType = type;

    if (type === 'person_char') {
        showAkinatorLink();
        gameState.isProcessing = false;
    } else {
        let activeItems = getActiveItems().filter(item => item.characteristics.type === type);
        setActiveItems(activeItems);
        console.log("フィルタリング後のactiveItems:", activeItems);

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
        gameState.currentQuestion = findNextQuestion(getActiveItems(), gameState.currentQuestionPhase);
        if (gameState.currentQuestion) {
            askQuestion(gameState.currentQuestion.text, (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing);
        } else {
            gameState.currentQuestionPhase = QUESTION_PHASES.CANDIDATE;
            displayCandidates(getActiveItems(), (enabled, elements) => setButtonsEnabled(enabled, elements), setProcessing, promptForAnswer, gameState);
        }
    }
    console.log("--- handleInitialAnswer 終了 ---");
}

// --- イベントリスナー設定 ---
export function initializeEventListeners() {
    uiElements.btnSelectMono.addEventListener('click', () => handleInitialAnswer('モノ'));
    uiElements.btnSelectService.addEventListener('click', () => handleInitialAnswer('サービス'));
    uiElements.btnSelectPersonChar.addEventListener('click', () => handleInitialAnswer('person_char'));

    uiElements.btnYes.addEventListener('click', () => handleAnswer('yes'));
    uiElements.btnNo.addEventListener('click', () => handleAnswer('no'));
    uiElements.btnUnknown.addEventListener('click', () => handleAnswer('unknown'));

    uiElements.btnNotInList.addEventListener('click', () => {
        if (gameState.isProcessing) return;
        gameState.isProcessing = true;
        setButtonsEnabled(false, uiElements);
        promptForAnswer((enabled, elements) => setButtonsEnabled(enabled, elements), gameState);
    });

    uiElements.btnRestartGame.addEventListener('click', restartGame);
    uiElements.btnSubmitAnswer.addEventListener('click', () => {
        const newItem = handleSubmitAnswer(gameState);
        if (newItem) {
            addNewItem(newItem);
            uiElements.messageElement.textContent = `お人間さん、ありがとうございます！『${newItem.name}さん』について、るんちょま、覚えました！\nお手数かけました、お人間さん。`;
            uiElements.userAnswerInput.value = '';
            uiElements.btnSubmitAnswer.style.display = 'none';
            uiElements.userAnswerInput.style.display = 'none';
            uiElements.btnRestartGame.style.display = 'block';
            gameState.inputPhase = 'name';
            gameState.tempNewItem = null;
        }
    });
    uiElements.darkModeToggle.addEventListener('click', toggleDarkMode);

    // README表示ボタンのイベントリスナー
    uiElements.btnShowReadme.addEventListener('click', async () => {
        const readmeDisplayArea = document.getElementById('readme-display-area');
        if (readmeDisplayArea.style.display === 'none') {
            // README.md の内容を読み込む
            try {
                const response = await fetch('README.md');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const readmeText = await response.text();
                // MarkdownをHTMLに変換するライブラリがあればここで使う
                // 現状はプレーンテキストとして表示
                readmeDisplayArea.innerHTML = `<pre>${readmeText}</pre><button class="close-button">×</button>`;
                readmeDisplayArea.style.display = 'block';
                // 閉じるボタンのイベントリスナー
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