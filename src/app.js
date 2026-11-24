import { SAMPLE_PRESETS, scanLocally } from './privacy-scanner.js';
import { HYBRID_MODES, ShieldMeshHybridEngine } from './hybrid-engine.js';

const engine = new ShieldMeshHybridEngine();
let selectedMode = HYBRID_MODES.PREFER_ON_DEVICE;

const $ = (id) => document.getElementById(id);

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function refreshStatusPills() {
  const caps = await engine.detectCapabilities();
  const nanoEl = $('pill-nano');
  if (caps.onDeviceReady) {
    nanoEl.textContent = 'Gemini Nano: Ready (On-Device)';
    nanoEl.className = 'pill pill-ok';
  } else {
    nanoEl.textContent = `Gemini Nano: ${caps.onDeviceStatus}`;
    nanoEl.className = 'pill pill-muted';
  }

  const netEl = $('pill-net');
  netEl.textContent = caps.online ? 'Network: Online' : 'Network: Offline';
  netEl.className = caps.online ? 'pill pill-ok' : 'pill pill-danger';

  const sdkEl = $('pill-sdk');
  if (caps.firebaseConfigured) {
    sdkEl.textContent = `Firebase AI Logic v${caps.sdkVersion}: Live`;
    sdkEl.className = 'pill pill-ok';
  } else {
    sdkEl.textContent = 'SDK: Zero-Key Preview';
    sdkEl.className = 'pill pill-warn';
  }
}

function renderPreScan(scan) {
  const bar = $('prescan-bar');
  bar.classList.remove('hidden');
  const piiTotal = scan.piiHits.reduce((a, b) => a + b.count, 0);
  const injTotal = scan.injectionHits.length;
  const piiTags = scan.piiHits.map((h) => `${escapeHtml(h.type)}×${h.count}`).join(', ') || 'None';
  const injTags = scan.injectionHits.map((h) => escapeHtml(h.id)).join(', ') || 'None';

  bar.innerHTML = `
    <strong>Local Pre-Scan:</strong>
    <span>Verdict: <code>${escapeHtml(scan.verdict)}</code> (${scan.riskScore}/100)</span>
    <span>PII Masked: <code>${piiTotal}</code> (${piiTags})</span>
    <span>Injection Signals: <code>${injTotal}</code> (${injTags})</span>
    <span>Suggested Mode: <code>${escapeHtml(scan.recommendedMode)}</code></span>
  `;
}

function renderTelemetry(snap) {
  $('kpi-ratio').textContent = `${snap.onDevicePct}%`;
  $('kpi-latency').textContent = `${snap.avgLatencyMs} ms`;
  $('kpi-blocked').textContent = String(snap.blockedPiiCount + snap.blockedInjectionCount);
  $('kpi-tokens').textContent = String(snap.savedCloudTokensEst);
  $('cnt-ondevice').textContent = String(snap.onDeviceRuns);
  $('cnt-cloud').textContent = String(snap.inCloudRuns);

  const totalRouted = snap.onDeviceRuns + snap.inCloudRuns;
  const widthPct = totalRouted > 0 ? Math.round((snap.onDeviceRuns / totalRouted) * 100) : 50;
  $('bar-ondevice').style.width = `${widthPct}%`;

  const list = $('trace-list');
  if (snap.history.length === 0) {
    list.innerHTML = '<div class="muted">No inference runs yet.</div>';
    return;
  }
  list.innerHTML = snap.history
    .map((item) => {
      const cls =
        item.inferenceSource === 'ON_DEVICE'
          ? 'text-green'
          : item.inferenceSource === 'IN_CLOUD'
          ? 'text-cyan'
          : 'pill-danger';
      return `
        <div class="trace-item">
          <span><strong>${escapeHtml(item.timestamp)}</strong> · ${escapeHtml(item.mode)}</span>
          <span class="${cls}"><strong>${escapeHtml(item.inferenceSource)}</strong> (${item.latencyMs}ms)</span>
        </div>
      `;
    })
    .join('');
}

async function executeRun() {
  const inputText = $('input-text').value.trim();
  if (!inputText) return;

  const taskType = $('task-select').value;
  const privacyShieldEnabled = $('chk-shield').checked;
  const scanResult = scanLocally(inputText);
  renderPreScan(scanResult);

  $('btn-run').disabled = true;
  $('res-source-badge').textContent = 'RUNNING...';
  $('res-source-badge').className = 'source-badge source-idle';
  $('res-output').textContent = 'Executing Hybrid Inference routing...';

  try {
    const res = await engine.runHybridInference({
      taskType,
      inputText,
      scanResult,
      mode: selectedMode,
      privacyShieldEnabled,
    });

    const badge = $('res-source-badge');
    if (res.inferenceSource === 'ON_DEVICE') {
      badge.textContent = '⚡ ON_DEVICE';
      badge.className = 'source-badge source-ondevice';
    } else if (res.inferenceSource === 'IN_CLOUD') {
      badge.textContent = '☁️ IN_CLOUD';
      badge.className = 'source-badge source-incloud';
    } else {
      badge.textContent = '🔒 BLOCKED (POLICY)';
      badge.className = 'source-badge source-blocked';
    }

    $('res-meta').textContent = `${res.engineLabel} · ${res.latencyMs} ms · ~${res.estTokens} tokens`;
    $('res-output').textContent = res.outputText;
    $('res-sanitized').textContent = res.sanitizedPayload;
    renderTelemetry(res.telemetry);
  } catch (err) {
    $('res-source-badge').textContent = 'ERROR';
    $('res-source-badge').className = 'source-badge source-blocked';
    $('res-output').textContent = String(err?.message || err);
  } finally {
    $('btn-run').disabled = false;
  }
}

function bootstrap() {
  // 建立範例按鈕
  const presetRow = $('preset-row');
  Object.entries(SAMPLE_PRESETS).forEach(([key, preset]) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.dataset.preset = key;
    btn.textContent = preset.label;
    btn.onclick = () => {
      $('input-text').value = preset.text;
      $('task-select').value = preset.task;
      renderPreScan(scanLocally(preset.text));
    };
    presetRow.appendChild(btn);
  });

  // 預設載入第一組範例
  $('input-text').value = SAMPLE_PRESETS.pii_ticket.text;
  $('task-select').value = SAMPLE_PRESETS.pii_ticket.task;
  renderPreScan(scanLocally(SAMPLE_PRESETS.pii_ticket.text));

  // 模式卡片切換
  document.querySelectorAll('.mode-card').forEach((card) => {
    card.onclick = () => {
      document.querySelectorAll('.mode-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      selectedMode = card.dataset.mode;
    };
  });

  $('btn-run').onclick = executeRun;

  // Firebase Config Modal
  $('btn-open-config').onclick = () => {
    $('cfg-apikey').value = engine.config.apiKey;
    $('cfg-project').value = engine.config.projectId;
    $('cfg-domain').value = engine.config.authDomain;
    $('cfg-appid').value = engine.config.appId;
    $('cfg-model').value = engine.config.cloudModel;
    $('config-modal').classList.remove('hidden');
  };
  $('btn-close-config').onclick = () => $('config-modal').classList.add('hidden');
  $('btn-save-config').onclick = async () => {
    engine.saveConfig({
      apiKey: $('cfg-apikey').value,
      projectId: $('cfg-project').value,
      authDomain: $('cfg-domain').value,
      appId: $('cfg-appid').value,
      cloudModel: $('cfg-model').value,
    });
    $('config-modal').classList.add('hidden');
    await refreshStatusPills();
  };
  $('btn-clear-config').onclick = async () => {
    engine.clearConfig();
    $('cfg-apikey').value = '';
    $('cfg-project').value = '';
    $('cfg-domain').value = '';
    $('cfg-appid').value = '';
    $('cfg-model').value = 'gemini-2.5-flash';
    await refreshStatusPills();
  };

  $('btn-export-telemetry').onclick = () => {
    const blob = new Blob([JSON.stringify(engine.getTelemetrySnapshot(), null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'shieldmesh-hybrid-telemetry.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  window.addEventListener('online', refreshStatusPills);
  window.addEventListener('offline', refreshStatusPills);
  refreshStatusPills();
}

bootstrap();
