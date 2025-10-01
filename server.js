import 'dotenv/config'; // Add this at the very top

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { setDataSource, getDataSource, loadItems, getActiveItems, addNewItem } from './src/data/dataManager.js';
import { findNextQuestion, resetUsedQuestions, setCurrentContext, getSpecificQuestions } from './src/core/questionSelector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(session({
  secret: 'a-secret-key-for-runchoma', // TODO: Move to environment variable
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // For local http. Use true in production with https
}));
app.use(express.json()); // JSON body parser

// Static file serving
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// --- API Endpoints ---

// Game Logic APIs
app.post('/api/game/start', async (req, res) => {
  try {
    const { type } = req.body;
    console.log('Received type from frontend:', type);
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    resetUsedQuestions();
    // await loadItems(); // サーバー起動時に一度だけ呼び出すため、ここからは削除
    const allItems = getActiveItems();
    const activeItems = allItems.filter(item => item.type === type);
    console.log('Filtered activeItems (in /api/game/start):', activeItems);

    if (activeItems.length === 0) {
      return res.json({ question: null, message: 'そのカテゴリのお品さんは、るんちょまの知識にはまだないようです…。' });
    }

    // activeItems が1つに絞り込まれた場合、そのアイテムを最終候補として返す
    if (activeItems.length === 1) {
      return res.json({ candidates: activeItems, finished: true });
    }

    const firstQuestionPhase = 'RANDOM_PHASE';
    const nextQuestion = findNextQuestion(activeItems, firstQuestionPhase);
    console.log('Next question from findNextQuestion:', nextQuestion);

    req.session.gameState = {
      activeItems: activeItems,
      questionCount: nextQuestion ? 1 : 0,
      currentQuestion: nextQuestion,
      currentQuestionPhase: firstQuestionPhase,
      askedQuestions: nextQuestion ? [nextQuestion] : [],
    };

    res.json({ question: nextQuestion });
  } catch (error) {
    console.error('Error in /api/game/start:', error);
    res.status(500).json({ error: 'サーバーでエラーが発生しました。' });
  }
});

app.post('/api/game/answer', (req, res) => {
    try {
        if (!req.session.gameState) {
            return res.status(400).json({ error: 'Game not started' });
        }

        const { answer } = req.body;
        let { activeItems, currentQuestion, questionCount, currentQuestionPhase, askedQuestions } = req.session.gameState;

        // Scoring logic ported from gameCore.js
        activeItems.forEach(item => {
            const charValue = item.characteristics[currentQuestion.characteristic];
            if (charValue === undefined || charValue === null || charValue === "不明" || (Array.isArray(charValue) && charValue.length === 0)) return;
            if (answer === 'unknown') return;

            let match = false;
            if (Array.isArray(charValue)) {
                match = (answer === 'yes') ? charValue.includes(currentQuestion.yesValue) : !charValue.includes(currentQuestion.yesValue);
            } else {
                match = (answer === 'yes') ? (charValue === currentQuestion.yesValue) : (charValue !== currentQuestion.yesValue);
            }
            item.score = (match) ? (item.score || 0) + 1 : (item.score || 0) - 1;
        });

        questionCount++;

        // Candidate selection logic
        const maxScore = Math.max(...activeItems.map(i => i.score || 0));
        const topCandidates = activeItems.filter(item => (item.score || 0) === maxScore);

        if (questionCount >= 10 || (maxScore >= 3 && topCandidates.length <= 5)) {
            req.session.gameState.activeItems = activeItems;
            return res.json({ candidates: topCandidates, finished: true });
        }

        // Phase transition logic
        if (currentQuestionPhase === 'RANDOM_PHASE' && questionCount >= 5) {
            currentQuestionPhase = 'SEQUENTIAL_PHASE';
        }

        const nextQuestion = findNextQuestion(activeItems, currentQuestionPhase);
        console.log('Next question from findNextQuestion (in /api/game/answer):', nextQuestion);
        console.log('Top candidates (in /api/game/answer):', topCandidates);

        // Update session
        req.session.gameState = {
            ...req.session.gameState,
            activeItems,
            questionCount,
            currentQuestion: nextQuestion,
            currentQuestionPhase,
            askedQuestions: nextQuestion ? [...askedQuestions, nextQuestion] : askedQuestions
        };

        if (!nextQuestion) {
             return res.json({ candidates: topCandidates, finished: true });
        }

        res.json({ question: nextQuestion });

    } catch (error) {
        console.error('Error in /api/game/answer:', error);
        res.status(500).json({ error: 'サーバーでエラーが発生しました。' });
    }
});

app.post('/api/game/learn', async (req, res) => {
    try {
        const { newItem } = req.body;
        if (!newItem) {
            return res.status(400).json({ error: 'New item data is required' });
        }
        await addNewItem(newItem);
        res.json({ success: true, message: `『${newItem.name}』を覚えました！` });
    } catch (error) {
        console.error('Error in /api/game/learn:', error);
        res.status(500).json({ error: '学習中にエラーが発生しました。' });
    }
});


// Admin and Config APIs
const authenticate = (req, res, next) => {
  const password = req.query.password;
  if (password === 'your_secret_password') { // TODO: Use env var
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

app.get('/admin', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/api/config/dataSource', authenticate, (req, res) => {
  res.json({ dataSource: getDataSource() });
});

app.post('/api/config/setDataSource', authenticate, (req, res) => {
  const type = req.query.type;
  if (type === 'local' || type === 'spreadsheet') {
    setDataSource(type);
    res.json({ success: true, dataSource: getDataSource() });
  } else {
    res.status(400).json({ success: false, message: 'Invalid data source type' });
  }
});


// --- Root Route ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- Server Start ---
(async () => {
  await loadItems(); // サーバー起動時に一度だけデータをロード
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();