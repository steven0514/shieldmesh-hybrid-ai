# -*- coding: utf-8 -*-
"""ShieldMesh Hybrid AI — Google #BuildHybridAI 2026 自動化契約與資安驗證測試"""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class TestShieldMeshHybridAI(unittest.TestCase):
    def test_required_project_files_exist(self):
        required = [
            "index.html",
            "styles.css",
            "firebase.json",
            "package.json",
            "AGENTS.md",
            "src/app.js",
            "src/hybrid-engine.js",
            "src/privacy-scanner.js",
        ]
        for rel in required:
            self.assertTrue((ROOT / rel).exists(), f"缺少必要檔案：{rel}")

    def test_firebase_hosting_and_package_json_valid(self):
        fb = json.loads((ROOT / "firebase.json").read_text(encoding="utf-8"))
        self.assertIn("hosting", fb)
        self.assertEqual(fb["hosting"]["public"], ".")

        pkg = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
        self.assertIn("firebase", pkg.get("dependencies", {}))
        self.assertIn("12.5", pkg["dependencies"]["firebase"])

    def test_hybrid_sdk_modes_and_inference_source_wired(self):
        engine_js = (ROOT / "src/hybrid-engine.js").read_text(encoding="utf-8")
        for token in (
            "firebase-ai.js",
            "GoogleAIBackend",
            "getGenerativeModel",
            "PREFER_ON_DEVICE",
            "ONLY_ON_DEVICE",
            "PREFER_IN_CLOUD",
            "ONLY_IN_CLOUD",
            "inferenceSource",
        ):
            self.assertIn(token, engine_js, f"hybrid-engine.js 缺少關鍵 Firebase Hybrid API：{token}")

    def test_dom_xss_escaping_and_zero_hardcoded_secrets(self):
        app_js = (ROOT / "src/app.js").read_text(encoding="utf-8")
        self.assertIn("export function escapeHtml(", app_js)

        scanner_js = (ROOT / "src/privacy-scanner.js").read_text(encoding="utf-8")
        self.assertLess(
            scanner_js.index("type: 'PAYMENT_CARD'"),
            scanner_js.index("type: 'PHONE'"),
            "PAYMENT_CARD 規則必須排在 PHONE 之前，避免 16 碼卡號被誤判為電話",
        )

        secret_re = re.compile(r"(AIza[0-9A-Za-z-_]{30,}|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,})")
        for ext in ("*.json", "*.js", "*.html", "*.css"):
            for fp in ROOT.rglob(ext):
                if ".venv" in fp.parts or "node_modules" in fp.parts:
                    continue
                content = fp.read_text(encoding="utf-8", errors="ignore")
                self.assertIsNone(secret_re.search(content), f"偵測到疑似硬編碼真實金鑰：{fp}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
