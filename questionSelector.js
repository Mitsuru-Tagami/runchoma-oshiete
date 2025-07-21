import { calculateEntropy } from './utils.js';

// 質問の定義
const randomQuestions = [
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
        noValue: (val) => !val.includes("乗り物")
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
    },
    {
        text: "お人間さん。それは現実世界で利用するサービスですか？",
        characteristic: "other_features",
        yesValue: "現実世界で利用",
        noValue: (val) => !val.includes("現実世界で利用")
    },
    {
        text: "お人間さん。それはキャラクターが登場するサービスですか？",
        characteristic: "other_features",
        yesValue: "キャラクター登場",
        noValue: (val) => !val.includes("キャラクター登場")
    },
    {
        text: "お人間さん。それは音楽やライブと関係がありますか？",
        characteristic: "other_features",
        yesValue: "音楽・ライブ",
        noValue: (val) => !val.includes("音楽・ライブ")
    },
    {
        text: "お人間さん。それはゲームですか？",
        characteristic: "category",
        yesValue: "ゲーム・作品",
        noValue: (val) => !val.includes("ゲーム・作品")
    },
    {
        text: "お人間さん。それは楽器ですか？",
        characteristic: "category",
        yesValue: "楽器",
        noValue: (val) => !val.includes("楽器")
    },
    {
        text: "お人間さん。それはスポーツ用品ですか？",
        characteristic: "category",
        yesValue: "スポーツ用品",
        noValue: (val) => !val.includes("スポーツ用品")
    },
    {
        text: "お人間さん。それは文房具ですか？",
        characteristic: "category",
        yesValue: "文房具",
        noValue: (val) => !val.includes("文房具")
    },
    {
        text: "お人間さん。それは家電ですか？",
        characteristic: "category",
        yesValue: "家電",
        noValue: (val) => !val.includes("家電")
    },
    {
        text: "お人間さん。それは植物ですか？",
        characteristic: "category",
        yesValue: "植物",
        noValue: (val) => !val.includes("植物")
    },
    {
        text: "お人間さん。それは飲料ですか？",
        characteristic: "category",
        yesValue: "飲料",
        noValue: (val) => !val.includes("飲料")
    },
    {
        text: "お人間さん。それは本ですか？",
        characteristic: "category",
        yesValue: "本",
        noValue: (val) => !val.includes("本")
    }
];

const sequentialQuestions = [
    {
        text: "お人間さん。それは書くためのものですか？",
        characteristic: "purpose",
        yesValue: "書く",
        noValue: (val) => !val.includes("書く")
    },
    {
        text: "お人間さん。それは荷物を運ぶものですか？",
        characteristic: "purpose",
        yesValue: "運搬",
        noValue: (val) => !val.includes("運搬")
    },
    {
        text: "お人間さん。それは荷物と関係がありますか？",
        characteristic: "purpose",
        yesValue: "荷物を送る",
        noValue: (val) => !val.includes("荷物を送る")
    },
    {
        text: "お人間さん。それはソーシャルゲームですか？",
        characteristic: "game_type",
        yesValue: "ソーシャルゲーム",
        noValue: (val) => val !== "ソーシャルゲーム"
    },
    {
        text: "お人間さん。それは家庭用ゲームですか？",
        characteristic: "game_type",
        yesValue: "家庭用ゲーム",
        noValue: (val) => val !== "家庭用ゲーム"
    },
    {
        text: "お人間さん。それは鍵盤がありますか？",
        characteristic: "other_features",
        yesValue: "鍵盤がある",
        noValue: (val) => !val.includes("鍵盤がある")
    },
    {
        text: "お人間さん。それは弦がありますか？",
        characteristic: "other_features",
        yesValue: "弦がある",
        noValue: (val) => !val.includes("弦がある")
    },
    {
        text: "お人間さん。それは丸い形をしていますか？",
        characteristic: "other_features",
        yesValue: "丸い",
        noValue: (val) => !val.includes("丸い")
    },
    {
        text: "お人間さん。それは打って使いますか？",
        characteristic: "other_features",
        yesValue: "打つ",
        noValue: (val) => !val.includes("打つ")
    },
    {
        text: "お人間さん。それは芯がありますか？",
        characteristic: "other_features",
        yesValue: "芯がある",
        noValue: (val) => !val.includes("芯がある")
    },
    {
        text: "お人間さん。それは消すために使いますか？",
        characteristic: "purpose",
        yesValue: "消す",
        noValue: (val) => !val.includes("消す")
    },
    {
        text: "お人間さん。それは画面がありますか？",
        characteristic: "other_features",
        yesValue: "画面がある",
        noValue: (val) => !val.includes("画面がある")
    },
    {
        text: "お人間さん。それは洗うために使いますか？",
        characteristic: "purpose",
        yesValue: "洗う",
        noValue: (val) => !val.includes("洗う")
    },
    {
        text: "お人間さん。それは鼻が長いですか？",
        characteristic: "other_features",
        yesValue: "鼻が長い",
        noValue: (val) => !val.includes("鼻が長い")
    },
    {
        text: "お人間さん。それは花ですか？",
        characteristic: "other_features",
        yesValue: "花",
        noValue: (val) => !val.includes("花")
    },
    {
        text: "お人間さん。それは液体ですか？",
        characteristic: "other_features",
        yesValue: "液体",
        noValue: (val) => !val.includes("液体")
    },
    {
        text: "お人間さん。それは動画を視聴するサービスですか？",
        characteristic: "purpose",
        yesValue: "見る",
        noValue: (val) => !val.includes("見る")
    },
    {
        text: "お人間さん。それは短い文章を投稿するサービスですか？",
        characteristic: "other_features",
        yesValue: "短文投稿",
        noValue: (val) => !val.includes("短文投稿")
    },
    {
        text: "お人間さん。それは写真や画像を共有するサービスですか？",
        characteristic: "other_features",
        yesValue: "写真",
        noValue: (val) => !val.includes("写真")
    },
    {
        text: "お人間さん。それは通販サイトですか？",
        characteristic: "purpose",
        yesValue: "買い物",
        noValue: (val) => !val.includes("買い物")
    }
];

const contextualQuestions = {
    category: {
        "本": [
            {
                text: "お人間さん。それは絵本ですか？",
                characteristic: "book_type",
                yesValue: "絵本",
                noValue: (val) => val !== "絵本"
            },
            {
                text: "お人間さん。それは児童書ですか？",
                characteristic: "book_type",
                yesValue: "児童書",
                noValue: (val) => val !== "児童書"
            },
            {
                text: "お人間さん。それは漫画ですか？",
                characteristic: "book_type",
                yesValue: "漫画",
                noValue: (val) => val !== "漫画"
            },
            {
                text: "お人間さん。それは小説ですか？",
                characteristic: "book_type",
                yesValue: "小説",
                noValue: (val) => val !== "小説"
            },
            {
                text: "お人間さん。それは参考書ですか？",
                characteristic: "book_type",
                yesValue: "参考書",
                noValue: (val) => val !== "参考書"
            },
            {
                text: "お人間さん。それは専門書ですか？",
                characteristic: "book_type",
                yesValue: "専門書",
                noValue: (val) => val !== "専門書"
            }
        ]
    }
};

let usedRandomQuestionIndices = new Set();
let usedSequentialQuestionIndex = 0;
let usedContextualQuestionIndices = new Set();
let currentContext = null;

function findRandomQuestion(activeItems) {
    const availableQuestions = randomQuestions.filter((_, index) => !usedRandomQuestionIndices.has(index));
    if (availableQuestions.length === 0) {
        return null;
    }

    let bestQuestion = null;
    let maxInformationGain = -1;
    let bestQuestionIndexInRandomPool = -1;

    const currentEntropy = calculateEntropy(activeItems);

    availableQuestions.forEach((question, indexInAvailable) => {
        const originalIndex = randomQuestions.indexOf(question); // Get original index to mark as used
        const yesItems = [];
        const noItems = [];

        activeItems.forEach(item => {
            const charValue = item.characteristics[question.characteristic];
            if (charValue === undefined || charValue === null || charValue === "不明" || (Array.isArray(charValue) && charValue.length === 0)) {
                return;
            }

            let match = false;
            if (Array.isArray(charValue)) {
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

        if (yesItems.length === 0 || noItems.length === 0) {
            return; // Skip questions that don't split the data
        }

        const entropyYes = calculateEntropy(yesItems);
        const entropyNo = calculateEntropy(noItems);

        const weightedEntropy =
            (yesItems.length / activeItems.length) * entropyYes +
            (noItems.length / activeItems.length) * entropyNo;

        const informationGain = currentEntropy - weightedEntropy;

        if (informationGain > maxInformationGain) {
            maxInformationGain = informationGain;
            bestQuestion = question;
            bestQuestionIndexInRandomPool = originalIndex;
        }
    });

    if (bestQuestion) {
        usedRandomQuestionIndices.add(bestQuestionIndexInRandomPool);
        console.log(`次の最適なランダム質問が見つかりました: 「${bestQuestion.text}」 (情報利得: ${maxInformationGain.toFixed(2)})`);
        return bestQuestion;
    }
    return null;
}

function findSequentialQuestion(activeItems) {
    if (usedSequentialQuestionIndex >= sequentialQuestions.length) {
        return null; // No more sequential questions
    }

    const question = sequentialQuestions[usedSequentialQuestionIndex];
    usedSequentialQuestionIndex++;
    console.log(`次のシーケンシャル質問が見つかりました: 「${question.text}」`);
    return question;
}

function findContextualQuestion(activeItems) {
    if (!currentContext || !contextualQuestions[currentContext.key] || !contextualQuestions[currentContext.key][currentContext.value]) {
        return null;
    }

    const questions = contextualQuestions[currentContext.key][currentContext.value];
    const availableQuestions = questions.filter((_, index) => !usedContextualQuestionIndices.has(index));

    if (availableQuestions.length === 0) {
        return null;
    }

    // For now, just return the next available question. Could be improved with entropy later.
    const nextQuestion = availableQuestions[0];
    const originalIndex = questions.indexOf(nextQuestion);
    usedContextualQuestionIndices.add(originalIndex);
    console.log(`次のコンテキスト質問が見つかりました: 「${nextQuestion.text}」`);
    return nextQuestion;
}

export function findNextQuestion(activeItems, currentQuestionPhase) {
    console.log(`--- findNextQuestion 開始 (フェーズ: ${currentQuestionPhase}) ---`);

    if (currentQuestionPhase === 'RANDOM_PHASE') {
        return findRandomQuestion(activeItems);
    } else if (currentQuestionPhase === 'SEQUENTIAL_PHASE') {
        return findSequentialQuestion(activeItems);
    } else if (currentQuestionPhase === 'CONTEXTUAL_PHASE') {
        return findContextualQuestion(activeItems);
    }
    return null;
}

export function getSpecificQuestions(characteristic, value) {
    if (contextualQuestions[characteristic] && contextualQuestions[characteristic][value]) {
        return contextualQuestions[characteristic][value];
    }
    return [];
}

export function setCurrentContext(key, value) {
    currentContext = { key, value };
    usedContextualQuestionIndices.clear(); // 新しいコンテキストになったらリセット
}


export function resetUsedQuestions() {
    usedRandomQuestionIndices = new Set();
    usedSequentialQuestionIndex = 0;
    usedContextualQuestionIndices = new Set();
    currentContext = null;
}