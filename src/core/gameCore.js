import { uiElements, setupInitialUI, askQuestion, displayCandidates, showAkinatorLink, toggleDarkMode } from '/public/ui.js';
import { setButtonsEnabled, restartGame } from '/public/utils.js';

// --- ゲーム状態管理 (クライアントサイド) ---
export const QUESTION_PHASES = {
    INITIAL: 'INITIAL_PHASE',
    QUESTIONING: 'QUESTIONING_PHASE',
    CANDIDATE: 'CANDIDATE_PHASE',
    LEARNING: 'LEARNING_PHASE'
};

export let gameState = {
    isProcessing: false,
    selectedInitialType: "",
    tempNewItem: null,
    currentQuestion: null,
    currentQuestionPhase: QUESTION_PHASES.INITIAL,
    askedQuestions: [],
    learningPhaseQuestionIndex: 0
};

// --- API 通信 ---

async function postToServer(endpoint, body) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        uiElements.messageElement.textContent = "サーバーとの通信に問題が発生しました。ページを再読み込みしてください。";
        throw error; // Propagate error to stop further processing
    }
}

// --- 回答処理 ---

export async function handleInitialAnswer(type) {
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;
    setButtonsEnabled(false, uiElements);

    gameState.selectedInitialType = type;

    if (type === 'person_char') {
        showAkinatorLink();
        gameState.isProcessing = false;
        return;
    }

    const data = await postToServer('/api/game/start', { type });

    if (data.question) {
        gameState.currentQuestion = data.question;
        gameState.askedQuestions.push(data.question);
        gameState.currentQuestionPhase = QUESTION_PHASES.QUESTIONING;
        askQuestion(data.question.text, setButtonsEnabled, (processing) => { gameState.isProcessing = processing; });
    } else if (data.finished) {
        gameState.currentQuestionPhase = QUESTION_PHASES.CANDIDATE;
        displayCandidates(data.candidates, setButtonsEnabled, (processing) => { gameState.isProcessing = processing; }, promptForAnswer, gameState);
    } else {
        uiElements.messageElement.textContent = data.message || "エラーが発生しました。";
        // UIをリセットするなどの処理
    }
    gameState.isProcessing = false;
    setButtonsEnabled(true, uiElements);
}

export async function handleAnswer(answer) {
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;
    setButtonsEnabled(false, uiElements);

    const data = await postToServer('/api/game/answer', { answer });

    if (data.finished) {
        gameState.currentQuestionPhase = QUESTION_PHASES.CANDIDATE;
        displayCandidates(data.candidates, setButtonsEnabled, (processing) => { gameState.isProcessing = processing; }, promptForAnswer, gameState);
    } else if (data.question) {
        gameState.currentQuestion = data.question;
        gameState.askedQuestions.push(data.question);
        askQuestion(data.question.text, setButtonsEnabled, (processing) => { gameState.isProcessing = processing; });
    }

    gameState.isProcessing = false;
    setButtonsEnabled(true, uiElements);
}

// --- イベントリスナー設定 ---
export function initializeEventListeners() {
    uiElements.btnSelectMono.addEventListener('click', () => handleInitialAnswer('モノ'));
    uiElements.btnSelectService.addEventListener('click', () => handleInitialAnswer('サービス'));
    uiElements.btnSelectPersonChar.addEventListener('click', () => handleInitialAnswer('person_char'));

    uiElements.btnYes.addEventListener('click', () => {
        if (gameState.currentQuestionPhase === QUESTION_PHASES.LEARNING) handleLearningAnswer('yes');
        else handleAnswer('yes');
    });
    uiElements.btnNo.addEventListener('click', () => {
        if (gameState.currentQuestionPhase === QUESTION_PHASES.LEARNING) handleLearningAnswer('no');
        else handleAnswer('no');
    });
    uiElements.btnUnknown.addEventListener('click', () => {
        if (gameState.currentQuestionPhase !== QUESTION_PHASES.LEARNING) handleAnswer('unknown');
    });

    uiElements.btnNotInList.addEventListener('click', promptForAnswer);
    uiElements.btnRestartGame.addEventListener('click', restartGame);
    uiElements.btnSubmitAnswer.addEventListener('click', handleSubmitNewItemName);
    uiElements.darkModeToggle.addEventListener('click', toggleDarkMode);
}

// --- 学習フェーズ関連の関数 ---

function promptForAnswer() {
    gameState.currentQuestionPhase = QUESTION_PHASES.LEARNING;
    uiElements.messageElement.textContent = "お人間さん、残念ながら特定できそうにないです…。お探しのお品さんの名前を教えていただけませんか？";
    // UI state changes...
    uiElements.candidateSelectionArea.style.display = 'none';
    uiElements.inputAnswerArea.style.display = 'flex';
    uiElements.userAnswerInput.style.display = 'block';
    uiElements.btnSubmitAnswer.style.display = 'block';
}

function handleSubmitNewItemName() {
    const answer = uiElements.userAnswerInput.value.trim();
    if (!answer) {
        uiElements.messageElement.textContent = "お人間さん、何か入力してくださいね。";
        return;
    }
    gameState.tempNewItem = { name: answer, characteristics: { type: gameState.selectedInitialType } };
    uiElements.inputAnswerArea.style.display = 'none';
    uiElements.mainQuestionButtons.style.display = 'grid';
    askNextLearningQuestion();
}

async function askNextLearningQuestion() {
    if (gameState.learningPhaseQuestionIndex < gameState.askedQuestions.length) {
        const question = gameState.askedQuestions[gameState.learningPhaseQuestionIndex];
        uiElements.messageElement.textContent = `『${gameState.tempNewItem.name}』についてお聞きします。
「${question.text}」
この質問は当てはまりますか？`;
    } else {
        // 学習完了
        await postToServer('/api/game/learn', { newItem: gameState.tempNewItem });
        uiElements.messageElement.textContent = `お人間さん、ありがとうございます！『${gameState.tempNewItem.name}さん』について、るんちょま、覚えました！`;
        uiElements.mainQuestionButtons.style.display = 'none';
        uiElements.btnRestartGame.style.display = 'block';
    }
}

function handleLearningAnswer(answer) {
    const question = gameState.askedQuestions[gameState.learningPhaseQuestionIndex];
    const characteristic = question.characteristic;
    const yesValue = question.yesValue;

    if (answer === 'yes') {
        if (!gameState.tempNewItem.characteristics[characteristic]) {
            gameState.tempNewItem.characteristics[characteristic] = [];
        }
        if (Array.isArray(gameState.tempNewItem.characteristics[characteristic])) {
            gameState.tempNewItem.characteristics[characteristic].push(yesValue);
        } else {
            gameState.tempNewItem.characteristics[characteristic] = yesValue;
        }
    }
    gameState.learningPhaseQuestionIndex++;
    askNextLearningQuestion();
}

// --- ゲーム初期化 ---
function initializeGame() {
    setupInitialUI();
    initializeEventListeners();
}

document.addEventListener('DOMContentLoaded', initializeGame);