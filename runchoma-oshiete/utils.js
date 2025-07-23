// エントロピーを計算する関数
export function calculateEntropy(items) {
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

// ボタンの状態を切り替える関数
export function setButtonsEnabled(enabled, uiElements) {
    // 最初の質問ボタン
    uiElements.btnSelectMono.disabled = !enabled;
    uiElements.btnSelectService.disabled = !enabled;
    uiElements.btnSelectPersonChar.disabled = !enabled;

    // 通常の質問ボタン
    uiElements.btnYes.disabled = !enabled;
    uiElements.btnNo.disabled = !enabled;
    uiElements.btnUnknown.disabled = !enabled;

    if (uiElements.btnNotInList) {
        uiElements.btnNotInList.disabled = !enabled;
    }
    // 候補リストのボタンも無効化するならここに追加
    const candidateButtons = document.querySelectorAll('.candidate-button');
    candidateButtons.forEach(button => {
        button.disabled = !enabled;
    });
}

// ゲームをリスタートする関数
export function restartGame() {
    console.log("ゲームをリスタートします。");
    location.reload();
}