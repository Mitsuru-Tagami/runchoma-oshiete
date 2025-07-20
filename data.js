const items = [
  {
    "name": "自動車",
    "characteristics": {
      "type": "モノ",
      "category": ["乗り物"],
      "wheels": "はい",
      "power_source": "ガソリンまたは電気",
      "purpose": ["移動", "運搬"],
      "other_features": ["ドアがある", "複数人乗れる"],
      "game_type": "なし"
    }
  },
  {
    "name": "ボールペン",
    "characteristics": {
      "type": "モノ",
      "category": ["文房具"],
      "living": "いいえ",
      "power_source": "なし",
      "purpose": ["書く", "描く"],
      "other_features": ["インクが出る", "キャップまたはノック式"],
      "game_type": "なし"
    }
  },
  {
    "name": "冷蔵庫",
    "characteristics": {
      "type": "モノ",
      "category": ["家電"],
      "power_source": "電気",
      "purpose": ["食品を冷やす", "保存する"],
      "other_features": ["ドアがある", "四角い", "キッチンにある"],
      "game_type": "なし"
    }
  },
  {
    "name": "カレーライス",
    "characteristics": {
      "type": "モノ",
      "category": ["食べ物"],
      "living": "いいえ",
      "purpose": ["食べる"],
      "other_features": ["温かい", "スパイシー", "ご飯とルー"],
      "game_type": "なし"
    }
  },
  {
    "name": "宅急便",
    "characteristics": {
      "type": "サービス",
      "category": ["配送"],
      "purpose": ["荷物を送る", "荷物を受け取る"],
      "other_features": ["荷物を届ける", "日時指定可能", "現実世界で利用"],
      "game_type": "なし"
    }
  },
  {
    "name": "犬",
    "characteristics": {
      "type": "モノ",
      "category": ["生き物"],
      "living": "はい",
      "purpose": ["ペット", "番犬", "盲導犬"],
      "other_features": ["四足歩行", "吠える", "しっぽがある"],
      "game_type": "なし"
    }
  },
  {
    "name": "東京タワー",
    "characteristics": {
      "type": "モノ",
      "category": ["場所・建造物"],
      "living": "いいえ",
      "purpose": ["観光", "電波塔"],
      "other_features": ["高い", "赤と白", "展望台がある"],
      "game_type": "なし"
    }
  },
  {
    "name": "クリスマス",
    "characteristics": {
      "type": "モノ",
      "category": ["イベント・概念"],
      "living": "いいえ",
      "purpose": ["祝う", "楽しむ"],
      "other_features": ["12月25日", "プレゼント", "サンタクロース"],
      "game_type": "なし"
    }
  },
  {
    "name": "にじさんじ",
    "characteristics": {
      "type": "サービス",
      "category": ["ブランド"],
      "purpose": ["エンターテイメント", "配信"],
      "other_features": ["VTuber", "バーチャルライバー", "多人数", "キャラクター登場", "音楽・ライブ"],
      "game_type": "なし"
    }
  },
  {
    "name": "スーパーマリオブラザーズ",
    "characteristics": {
      "type": "モノ",
      "category": ["ゲーム・作品"],
      "living": "いいえ",
      "purpose": ["遊ぶ", "楽しむ"],
      "other_features": ["任天堂", "配管工", "ジャンプアクション"],
      "game_type": "家庭用ゲーム"
    }
  },
  {
    "name": "学園アイドルマスター",
    "characteristics": {
      "type": "サービス",
      "category": ["ゲーム・作品", "ブランド"],
      "purpose": ["遊ぶ", "楽しむ", "エンターテイメント"],
      "other_features": ["アイドル育成", "リズムゲーム", "ソシャゲ", "キャラクター登場", "音楽・ライブ"],
      "game_type": "ソーシャルゲーム"
    }
  },
  {
    "name": "馬",
    "characteristics": {
      "type": "モノ",
      "category": ["生き物"],
      "living": "はい",
      "purpose": ["移動", "運搬"],
      "other_features": ["四足歩行", "走る"],
      "game_type": "なし"
    }
  },
  {
    "name": "ピアノ",
    "characteristics": {
      "type": "モノ",
      "category": ["楽器"],
      "power_source": "なし",
      "purpose": ["演奏する", "音楽"],
      "other_features": ["鍵盤がある", "大きい"],
      "game_type": "なし"
    }
  },
  {
    "name": "ギター",
    "characteristics": {
      "type": "モノ",
      "category": ["楽器"],
      "power_source": "なし",
      "purpose": ["演奏する", "音楽"],
      "other_features": ["弦がある", "抱えて弾く"],
      "game_type": "なし"
    }
  },
  {
    "name": "サッカーボール",
    "characteristics": {
      "type": "モノ",
      "category": ["スポーツ用品"],
      "living": "いいえ",
      "purpose": ["遊ぶ", "運動"],
      "other_features": ["丸い", "蹴る"],
      "game_type": "なし"
    }
  },
  {
    "name": "テニスラケット",
    "characteristics": {
      "type": "モノ",
      "category": ["スポーツ用品"],
      "living": "いいえ",
      "purpose": ["遊ぶ", "運動"],
      "other_features": ["網がある", "打つ"],
      "game_type": "なし"
    }
  },
  {
    "name": "鉛筆",
    "characteristics": {
      "type": "モノ",
      "category": ["文房具"],
      "living": "いいえ",
      "power_source": "なし",
      "purpose": ["書く", "描く"],
      "other_features": ["芯がある", "消せる"],
      "game_type": "なし"
    }
  },
  {
    "name": "消しゴム",
    "characteristics": {
      "type": "モノ",
      "category": ["文房具"],
      "living": "いいえ",
      "power_source": "なし",
      "purpose": ["消す"],
      "other_features": ["四角い", "ゴム製"],
      "game_type": "なし"
    }
  },
  {
    "name": "テレビ",
    "characteristics": {
      "type": "モノ",
      "category": ["家電"],
      "power_source": "電気",
      "purpose": ["見る", "楽しむ"],
      "other_features": ["画面がある", "リモコンで操作"],
      "game_type": "なし"
    }
  },
  {
    "name": "洗濯機",
    "characteristics": {
      "type": "モノ",
      "category": ["家電"],
      "power_source": "電気",
      "purpose": ["洗う"],
      "other_features": ["水を使う", "回る"],
      "game_type": "なし"
    }
  },
  {
    "name": "猫",
    "characteristics": {
      "type": "モノ",
      "category": ["生き物"],
      "living": "はい",
      "purpose": ["ペット"],
      "other_features": ["四足歩行", "鳴く", "ひげがある"],
      "game_type": "なし"
    }
  },
  {
    "name": "象",
    "characteristics": {
      "type": "モノ",
      "category": ["生き物"],
      "living": "はい",
      "purpose": ["動物園"],
      "other_features": ["大きい", "鼻が長い", "耳が大きい"],
      "game_type": "なし"
    }
  },
  {
    "name": "バラ",
    "characteristics": {
      "type": "モノ",
      "category": ["植物"],
      "living": "はい",
      "purpose": ["鑑賞"],
      "other_features": ["花", "とげがある", "香りが良い"],
      "game_type": "なし"
    }
  },
  {
    "name": "ひまわり",
    "characteristics": {
      "type": "モノ",
      "category": ["植物"],
      "living": "はい",
      "purpose": ["鑑賞"],
      "other_features": ["花", "大きい", "黄色い"],
      "game_type": "なし"
    }
  },
  {
    "name": "コーヒー",
    "characteristics": {
      "type": "モノ",
      "category": ["飲料"],
      "living": "いいえ",
      "purpose": ["飲む", "覚醒"],
      "other_features": ["液体", "苦い", "カフェイン"],
      "game_type": "なし"
    }
  },
  {
    "name": "オレンジジュース",
    "characteristics": {
      "type": "モノ",
      "category": ["飲料"],
      "living": "いいえ",
      "purpose": ["飲む"],
      "other_features": ["液体", "甘い", "柑橘系"],
      "game_type": "なし"
    }
  },
  {
    "name": "8番のりば",
    "characteristics": {
      "type": "モノ",
      "category": ["ゲーム・作品"],
      "living": "いいえ",
      "purpose": ["遊ぶ", "楽しむ"],
      "other_features": ["ホラー", "探索", "日本の風景"],
      "game_type": "家庭用ゲーム"
    }
  },
  {
    "name": "YouTube",
    "characteristics": {
      "type": "サービス",
      "category": ["動画配信"],
      "purpose": ["見る", "楽しむ", "学ぶ"],
      "other_features": ["動画", "無料", "広告"],
      "game_type": "なし"
    }
  },
  {
    "name": "Netflix",
    "characteristics": {
      "type": "サービス",
      "category": ["動画配信"],
      "purpose": ["見る", "楽しむ"],
      "other_features": ["映画", "ドラマ", "有料"],
      "game_type": "なし"
    }
  },
  {
    "name": "X (旧Twitter)",
    "characteristics": {
      "type": "サービス",
      "category": ["SNS"],
      "purpose": ["情報収集", "交流"],
      "other_features": ["短文投稿", "リアルタイム"],
      "game_type": "なし"
    }
  },
  {
    "name": "Instagram",
    "characteristics": {
      "type": "サービス",
      "category": ["SNS"],
      "purpose": ["写真共有", "交流"],
      "other_features": ["写真", "動画", "映え"],
      "game_type": "なし"
    }
  },
  {
    "name": "Amazon",
    "characteristics": {
      "type": "サービス",
      "category": ["オンラインショッピング"],
      "purpose": ["買い物"],
      "other_features": ["通販", "品揃え豊富", "プライム会員"],
      "game_type": "なし"
    }
  },
  {
    "name": "楽天",
    "characteristics": {
      "type": "サービス",
      "category": ["オンラインショッピング"],
      "purpose": ["買い物"],
      "other_features": ["通販", "ポイント", "楽天経済圏"],
      "game_type": "なし"
    }
  },
  {
    "name": "絵本",
    "characteristics": {
      "type": "モノ",
      "category": ["本"],
      "purpose": ["読む", "楽しむ"],
      "other_features": ["絵が多い", "子供向け"],
      "book_type": "絵本"
    }
  },
  {
    "name": "児童書",
    "characteristics": {
      "type": "モノ",
      "category": ["本"],
      "purpose": ["読む", "学ぶ", "楽しむ"],
      "other_features": ["子供向け", "物語"],
      "book_type": "児童書"
    }
  },
  {
    "name": "漫画",
    "characteristics": {
      "type": "モノ",
      "category": ["本"],
      "purpose": ["読む", "楽しむ"],
      "other_features": ["絵が多い", "吹き出し"],
      "book_type": "漫画"
    }
  },
  {
    "name": "小説",
    "characteristics": {
      "type": "モノ",
      "category": ["本"],
      "purpose": ["読む", "楽しむ"],
      "other_features": ["物語", "文章主体"],
      "book_type": "小説"
    }
  },
  {
    "name": "英語参考書",
    "characteristics": {
      "type": "モノ",
      "category": ["本"],
      "purpose": ["学ぶ"],
      "other_features": ["英語", "学習"],
      "book_type": "参考書"
    }
  },
  {
    "name": "法律書",
    "characteristics": {
      "type": "モノ",
      "category": ["本"],
      "purpose": ["学ぶ", "調べる"],
      "other_features": ["法律", "専門的"],
      "book_type": "専門書"
    }
  },
  {
    "name": "論文",
    "characteristics": {
      "type": "モノ",
      "category": ["本"],
      "purpose": ["学ぶ", "調べる"],
      "other_features": ["研究", "学術的"],
      "book_type": "専門書"
    }
  }
];

export { items };