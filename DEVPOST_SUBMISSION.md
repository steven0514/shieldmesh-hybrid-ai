# Devpost Submission Draft — ShieldMesh Hybrid AI (#BuildHybridAI 2026)

## Project Name
**ShieldMesh Hybrid AI**

## Tagline (<= 120 chars)
Local-first PII & prompt-injection firewall powered by Firebase AI Logic Hybrid Inference (Gemini Nano + Cloud fallback).

---

## Inspiration
Teams want to use generative AI on customer support tickets, vendor emails, and compliance docs—but sending raw PII or untrusted prompt-injection payloads straight to the cloud is a security nightmare, while on-device-only apps break on unsupported browsers. With **Firebase AI Logic Hybrid Inference**, we can run privacy-critical redaction and triage **on-device with Chrome's Gemini Nano** first, and seamlessly fall back to **Cloud Gemini** only when needed—with verifiable `response.inferenceSource` telemetry on every single call.

## What it does
- **4-Mode Firebase AI Logic Hybrid Router**: Live interactive switching across `PREFER_ON_DEVICE`, `ONLY_ON_DEVICE`, `PREFER_IN_CLOUD`, and `ONLY_IN_CLOUD` using `firebase/ai` (`getAI`, `GoogleAIBackend`, `getGenerativeModel`, `InferenceMode`).
- **Local Privacy Shield & Prompt-Injection Firewall**: Detects and redacts emails, phone numbers, card numbers, leaked tokens, and hidden prompt-injection directives locally before any cloud fallback occurs.
- **Live Hybrid Telemetry Dashboard**: Visualizes `ON_DEVICE` vs `IN_CLOUD` split, latency (ms), blocked PII/injection count, estimated cloud tokens saved, and exports full JSON audit logs.
- **Browser-Local Firebase Config**: Judges and developers can test immediately or connect their own Firebase project in one click via `localStorage` with zero hardcoded keys.

## How we built it
Standard ES Modules web app (**HTML5, CSS3, JavaScript**) integrating the official **Firebase AI Logic Web SDK (`firebase/ai` v12.5.0)**, Chrome Built-in AI (`LanguageModel`) capability detection, a zero-dependency client-side PII/injection scanner, strict DOM XSS escaping (`escapeHtml`), Firebase Hosting (`firebase.json`), and automated Python `unittest` contract/secret-leak tests.

## Challenges we ran into
Designing a clear, trustworthy UX that communicates *where* every inference ran (`ON_DEVICE` vs `IN_CLOUD`), gracefully enforcing `ONLY_ON_DEVICE` zero-egress guarantees when Gemini Nano is unavailable, and ensuring external untrusted text (such as prompt-injection emails) can never trigger DOM XSS in the security dashboard.

## What's next
- Packaging the same Hybrid Inference core into a **Chrome Extension** for Gmail/Zendesk inline redaction and a **Flutter/Android** companion using Gemini Nano on mobile.
- Adding structured JSON schema enforcement for automated SOC2/GDPR compliance tickets.

---

## 🎬 YouTube Demo Video Script (English / Subtitled — Target: 2:15)
1. **0:00 – 0:25 (Problem & Hook)**: Open ShieldMesh Hybrid AI in Chrome. Highlight the status pills (`Gemini Nano`, `Online/Offline`, `Firebase AI Logic SDK`).
2. **0:25 – 0:55 (On-Device Privacy Triage)**: Load `PII Support Ticket`, keep `PREFER_ON_DEVICE` active, click `Run Hybrid Inference`. Show instant PII masking (`[REDACTED_EMAIL]`, `[REDACTED_CARD]`, `[REDACTED_SECRET]`) and the green `ON_DEVICE` badge + cloud tokens saved.
3. **0:55 – 1:25 (Strict Zero-Egress Policy)**: Switch to `ONLY_ON_DEVICE` (or toggle Chrome offline in DevTools) to prove zero cloud egress and policy enforcement.
4. **1:25 – 1:55 (Seamless Cloud Fallback)**: Load `Indirect Prompt Injection` or `Enterprise Compliance Brief`, switch to `PREFER_IN_CLOUD` / `ONLY_IN_CLOUD`, and show `IN_CLOUD` fallback with sanitized payload inspection.
5. **1:55 – 2:15 (Live Telemetry & Closing)**: Show the `response.inferenceSource` trace list, click `Export JSON`, and highlight the `firebase/ai` integration snippet.
