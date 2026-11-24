# ShieldMesh Hybrid AI — Google #BuildHybridAI 2026 參賽專案

## 1. 專案目標
參與 [Google #BuildHybridAI 2026](https://firebasehybridaihackathon.devpost.com/)（總獎池 \$30,000，首獎 \$10,000，截止約 2026-12-01），打造 **ShieldMesh Hybrid AI**：一款專為開發者與企業設計的 **Local-First 隱私去識別化與提示注入防禦工作台（Privacy & Prompt-Injection Firewall）**，核心展示 **Firebase AI Logic Hybrid Inference SDK (`firebase/ai` v12.5+)**：
1. **裝置端優先（`InferenceMode.PREFER_ON_DEVICE`）**：敏感 PII 偵測、去識別化與快速摘要優先在瀏覽器端透過 **Chrome Built-in AI（Gemini Nano）** 執行，資料不離開本機、零推論成本、支援離線運作。
2. **無縫雲端降級（Automatic Cloud Fallback）**：當裝置不支援 Gemini Nano 或使用者需要深度威脅分析 / 跨規則修復建議時，由 Firebase AI Logic 自動無縫切換至雲端 Gemini 模型（`IN_CLOUD`）。
3. **四模式即時路由控制**：支援 `PREFER_ON_DEVICE`、`ONLY_ON_DEVICE`、`PREFER_IN_CLOUD`、`ONLY_IN_CLOUD` 四種官方 `InferenceMode` 即時切換與 `response.inferenceSource` 遙測視覺化。

## 2. 目錄結構
- `index.html`、`styles.css`：現代深色資安遙測儀表板介面（純靜態標準 Web，可直接部署 Firebase Hosting / GitHub Pages）。
- `src/hybrid-engine.js`：Firebase AI Logic Hybrid Inference SDK（`firebase/ai` v12.5.0）封裝層，支援真實 Firebase Web Config、Chrome Built-in AI 偵測與無摩擦確定性預覽降級。
- `src/privacy-scanner.js`：本機確定性 PII 遮罩與 Prompt Injection 啟發式預檢引擎（零網路外洩）。
- `src/app.js`：互動介面控制、即時 Hybrid Telemetry 統計圖表、DOM XSS 逃逸防護與 `localStorage` 設定管理。
- `firebase.json`、`package.json`：Firebase Hosting 部署設定與標準專案描述。
- `tests/test_hybrid_app.py`：透過 `uv .venv` 執行之自動化契約與資安驗證測試。

## 3. 安全與環境鐵律
- Python 一律使用本目錄 `.venv`，嚴禁使用系統 base 或全域 pip。
- 本地開發預覽僅綁定 `127.0.0.1`，絕不開放公網入站埠口。
- Firebase Web Config 僅由使用者於介面輸入並存於瀏覽器 `localStorage`（或透過官方部署環境注入），嚴禁將任何真實 API Key 或私鑰硬編碼進入 Git 倉庫。
- 所有動態渲染至 DOM 的內容一律經由 `escapeHtml()` 逃逸處理。
