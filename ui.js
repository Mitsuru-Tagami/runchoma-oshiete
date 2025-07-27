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
    // console.log("質問を表示: ", questionText);
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
    // console.log("最終特定結果を表示: ", itemName);
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

// 候補リストを表示する関数
export function displayCandidates(activeItems, setButtonsEnabledCallback, setProcessingCallback, promptForAnswerCallback, gameState) {
    // console.log("--- displayCandidates 開始 ---");
    let maxScore = -Infinity;
    activeItems.forEach(item => {
        if (item.score > maxScore) {
            maxScore = item.score;
        }
    });

    const topCandidates = maxScore < 1 ? [] : activeItems.filter(item => item.score === maxScore);

    // console.log("上位候補:", topCandidates);

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
        promptForAnswerCallback(gameState);
    }
    setProcessingCallback(false);
    // console.log("--- displayCandidates 終了 ---");
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
    uiElements.messageElement.textContent = "お人間。頭に思い浮かべたソレは、何か形のあるモノですか？
それとも概念やサービスでしょうか？
はたまた芸能人やキャラクタでしょうか？";
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
