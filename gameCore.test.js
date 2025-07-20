import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// --- モックの設定 ---
// ESM環境で安定してモックを行うため、jest.unstable_mockModule を使用します。
// gameCore.js がインポートするすべての関数をここでモックします。

jest.unstable_mockModule('./dataManager.js', () => ({
  loadItemsFromLocalStorage: jest.fn(),
  getActiveItems: jest.fn(),
  setActiveItems: jest.fn(),
  addNewItem: jest.fn(),
}));

jest.unstable_mockModule('./questionSelector.js', () => ({
  findNextQuestion: jest.fn(),
  resetUsedQuestions: jest.fn(),
}));

jest.unstable_mockModule('./ui.js', () => ({
  uiElements: { // handleAnswerから直接参照はされないが、念のためモック
    messageElement: { textContent: '' },
  },
  setupInitialUI: jest.fn(),
  askQuestion: jest.fn(),
  displayCandidates: jest.fn(),
  showAkinatorLink: jest.fn(),
  promptForAnswer: jest.fn(),
  handleSubmitAnswer: jest.fn(),
  toggleDarkMode: jest.fn(),
}));

jest.unstable_mockModule('./utils.js', () => ({
  setButtonsEnabled: jest.fn(),
  restartGame: jest.fn(),
}));

// --- モジュールとテスト対象の動的インポート ---
// モック設定が完了した後に、必要なモジュールを動的にインポートします。
const dataManager = await import('./dataManager.js');
const questionSelector = await import('./questionSelector.js');
const ui = await import('./ui.js');
const utils = await import('./utils.js');
const { handleAnswer, gameState, QUESTION_PHASES } = await import('./gameCore.js');

describe('handleAnswer', () => {
  beforeEach(() => {
    // すべてのモックの履歴をリセット
    jest.clearAllMocks();

    // gameStateをテストの初期状態にリセット
    Object.assign(gameState, {
      questionCount: 0,
      isProcessing: false,
      selectedInitialType: 'モノ',
      currentQuestion: {
        characteristic: 'color',
        text: 'それは赤いですか？',
        yesValue: 'red',
      },
      currentQuestionPhase: QUESTION_PHASES.RANDOM,
    });
  });

  test('「yes」の回答で、合致するアイテムのスコアが1増加すること', () => {
    // --- Arrange (準備) ---
    const mockItems = [
      { name: 'りんご', characteristics: { color: 'red' }, score: 0 },
      { name: 'バナナ', characteristics: { color: 'yellow' }, score: 0 },
    ];
    dataManager.getActiveItems.mockReturnValue(mockItems);
    questionSelector.findNextQuestion.mockReturnValue({ text: '次の質問' });

    // --- Act (実行) ---
    handleAnswer('yes');

    // --- Assert (検証) ---
    // スコアが正しく更新されたかを確認
    const updatedItems = dataManager.setActiveItems.mock.calls[0][0];
    expect(updatedItems.find(item => item.name === 'りんご').score).toBe(1);
    expect(updatedItems.find(item => item.name === 'バナナ').score).toBe(-1);

    // 適切なUI関数が呼ばれたかを確認
    expect(ui.askQuestion).toHaveBeenCalledWith('次の質問', expect.any(Function), expect.any(Function));
  });
});