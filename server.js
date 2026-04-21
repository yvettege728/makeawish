// server.js — Railway 部署入口
// 替代 Vercel 的 /api/proxy serverless function

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// ── 静态文件（index.html, makeawish-storage.js 等）──────────────
// __dirname 指向 server.js 所在的目录
app.use(express.static(path.join(__dirname, '.')));

// ── Supabase 配置（从环境变量读取，不要硬编码在代码里）──────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TABLE = 'wishes'; // 你的 Supabase 表名，按实际修改

// ── /api/proxy 路由 ──────────────────────────────────────────────
// GET  /api/proxy?order=created_at.desc   → 读取所有 wishes
// POST /api/proxy                          → 写入一条新 wish

app.get('/api/proxy', async (req, res) => {
  try {
    // 把 query string 原样转发给 Supabase
    const queryString = new URLSearchParams(req.query).toString();
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}?${queryString}`;

    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[GET /api/proxy]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/proxy', async (req, res) => {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation', // 让 Supabase 返回插入的行
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/proxy]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── 兜底：所有其他路由都返回 index.html（SPA 模式）──────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── 启动 ─────────────────────────────────────────────────────────
// Railway 会自动注入 PORT 环境变量
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Make a Wish server running on port ${PORT}`);
});
