window.__ModuleLoader__.load({
  id: 'dsh-model-pick-chip',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;
    const { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } = React;

    /** Dictionary namespace owned by this plugin. */
    const NS = 'modelPick';
    /** One injected <style> per document; rows need :hover, which inline styles cannot express. */
    const STYLE_ID = 'model-pick-chip-style';

    const zh = {
      menuAria: '选择模型提供方',
      providerAccount: 'DeepSeek 账号',
      providersTitle: '提供方',
      modelsTitle: '模型',
      effortTitle: '推理强度',
      effortDefault: '提供方默认',
      effort_off: '关',
      effort_minimal: '最低',
      effort_low: '低',
      effort_medium: '中',
      effort_high: '高',
      effort_xhigh: '极高',
      effort_max: '极限',
      select: '选择模型',
      loading: '正在加载模型…',
      loadingList: '正在更新模型列表…',
      loadFailed: '模型列表加载失败',
      retry: '重试',
      search: '搜索模型…',
      emptyProvider: '这个提供方下没有模型',
      noMatch: '没有匹配的模型',
      back: '返回提供方',
      switchFailed: '切换失败：{message}',
      locked: '当前会话的模型已锁定',
      unavailable: '子会话不能切换模型',
      count: '{n} 个',
      loadError: '加载失败：{message}',
      visionBridge: 'modlens 读图模型',
      visionHint: '用 modlens 把图片读成文字再喂给纯文本模型',
      teamLabel: '启用智能体团队协作',
      teamInfo: '通过共享任务板协调多个智能体的分工与进度，复杂任务表现更佳，token 开销也相应更高。',
      teamFailed: '无法确认智能体团队协作设置已保存，请重试：{message}',
      teamConfirmTitle: '确认停用智能体团队协作？',
      teamConfirmBody: '对话过程中停用智能体团队协作，将停止共享任务工具和团队协调指令。',
      teamConfirmWarn: '停用后可能影响缓存复用、增加后续 token 用量与开销，并影响当前任务的协作效果。',
      teamCancel: '取消',
      teamDisable: '确认停用',
      teamUnavailable: '当前 DSH 版本没有提供智能体团队协作接口',
      balTitle: 'DeepSeek 余额',
      balAvailable: '可用余额',
      balBonus: '赠送额度',
      balFailed: '余额不可用',
      balRefresh: '重新查询',
      balTopUp: '去充值',
      balUpdated: '更新于 {time}',
      balReasonNoRemote: '这个 DSH 版本没有暴露余额接口（remote.account 未挂载）',
      balReasonSignedOut: '账号未登录，或登录授权已过期，余额接口返回空',
      balReasonEmpty: '账号里还没有可显示的余额',
      balReasonFailed: '平台没有返回余额（请求失败或超时）',
      balReasonError: '调用出错：{message}',
    };
    const en = {
      menuAria: 'Choose a model provider',
      providerAccount: 'DeepSeek account',
      providersTitle: 'Providers',
      modelsTitle: 'Models',
      effortTitle: 'Reasoning effort',
      effortDefault: 'Provider default',
      effort_off: 'Off',
      effort_minimal: 'Minimal',
      effort_low: 'Low',
      effort_medium: 'Medium',
      effort_high: 'High',
      effort_xhigh: 'Extra high',
      effort_max: 'Max',
      select: 'Select model',
      loading: 'Loading models…',
      loadingList: 'Updating model list…',
      loadFailed: 'Could not load the model list',
      retry: 'Retry',
      search: 'Search models…',
      emptyProvider: 'No models for this provider',
      noMatch: 'No matching model',
      back: 'Back to providers',
      switchFailed: 'Switch failed: {message}',
      locked: 'The model is locked in this session',
      unavailable: 'Sub-sessions cannot switch models',
      count: '{n}',
      loadError: 'Load failed: {message}',
      visionBridge: 'modlens vision',
      visionHint: 'Images are read by modlens and passed as text for text-only models',
      teamLabel: 'Enable agent team collaboration',
      teamInfo: 'Coordinates several agents through a shared task board — better on complex tasks, with a correspondingly higher token cost.',
      teamFailed: 'Could not confirm the agent team setting was saved, please retry: {message}',
      teamConfirmTitle: 'Turn off agent team collaboration?',
      teamConfirmBody: 'Turning it off mid-conversation stops the shared task tools and the team coordination instructions.',
      teamConfirmWarn: 'Disabling may affect cache reuse, raise subsequent token usage and cost, and reduce collaboration on the current task.',
      teamCancel: 'Cancel',
      teamDisable: 'Turn off',
      teamUnavailable: 'This DSH build does not expose the agent team API',
      balTitle: 'DeepSeek balance',
      balAvailable: 'Available',
      balBonus: 'Bonus credit',
      balFailed: 'Balance unavailable',
      balRefresh: 'Refresh',
      balTopUp: 'Top up',
      balUpdated: 'Updated {time}',
      balReasonNoRemote: 'This DSH build exposes no balance API (remote.account is not mounted)',
      balReasonSignedOut: 'Signed out or the grant expired — the balance API returned nothing',
      balReasonEmpty: 'The account has no balance to show yet',
      balReasonFailed: 'The platform did not return a balance (request failed or timed out)',
      balReasonError: 'Call failed: {message}',
    };

    const CSS = `
.mpc-trigger{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-width:0;padding:5px 8px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary,#111827);font:inherit;font-size:13px;line-height:18px;cursor:pointer}
.mpc-trigger:hover{background:rgba(17,24,39,.06)}
.mpc-trigger:disabled{cursor:default;opacity:.5}
.mpc-trigger-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mpc-trigger-effort{flex:none;color:var(--dsw-alias-label-tertiary,#9ca3af);font-size:12px}
.mpc-menu{position:fixed;z-index:90;display:flex;flex-direction:column;width:268px;max-width:calc(100vw - 16px);padding:6px;border-radius:14px;border:1px solid rgba(17,24,39,.08);background-color:#ffffff;background-image:none;box-shadow:0 16px 40px rgba(15,23,42,.18),0 2px 8px rgba(15,23,42,.06);color:var(--dsw-alias-label-primary,#111827);font-family:var(--dsw-font-family,inherit);overflow:hidden}
html.dark .mpc-menu,html[data-theme="dark"] .mpc-menu,body.dark .mpc-menu{background-color:#2b2c31;border-color:rgba(255,255,255,.1)}
.mpc-scroll{display:flex;flex-direction:column;overflow-y:auto;overscroll-behavior:contain;padding:0;scrollbar-width:thin}
.mpc-row{display:flex;align-items:center;gap:8px;width:100%;min-height:34px;padding:6px 8px;border:0;border-radius:9px;background:transparent;color:inherit;font:inherit;font-size:13px;line-height:18px;text-align:left;cursor:pointer}
.mpc-row:hover{background:rgba(17,24,39,.055)}
.mpc-row[aria-checked="true"]{background:rgba(17,24,39,.07)}
.mpc-row:disabled{cursor:default;opacity:.55}
.mpc-row:disabled:hover{background:transparent}
.mpc-head-row{display:flex;align-items:center;gap:8px;width:100%;min-height:38px;padding:7px 8px;border:0;border-radius:9px;background:transparent;color:inherit;font:inherit;font-size:13px;line-height:18px;text-align:left;cursor:pointer}
.mpc-head-row:hover{background:rgba(17,24,39,.055)}
.mpc-head-row:disabled{cursor:default;opacity:.55}
.mpc-head-row[aria-expanded="true"]{background:rgba(17,24,39,.07)}
.mpc-mono{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:rgba(17,24,39,.06);color:var(--dsw-alias-label-secondary,#4b5563);font-size:11px;font-weight:600;line-height:1;text-transform:uppercase}
.mpc-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}
.mpc-sub{flex:none;color:var(--dsw-alias-label-tertiary,#9ca3af);font-size:11px}
.mpc-check{flex:none;display:inline-flex;color:#111827}
.mpc-chev{flex:none;display:inline-flex;color:var(--dsw-alias-label-tertiary,#b0b4bb);transition:transform .18s cubic-bezier(.2,.8,.2,1)}
.mpc-head-row[aria-expanded="true"]{background:rgba(17,24,39,.06)}
.mpc-head-row[aria-expanded="true"] .mpc-chev{transform:rotate(90deg)}
.mpc-tag{flex:none;padding:1px 6px;border-radius:5px;background:rgba(17,24,39,.06);color:var(--dsw-alias-label-secondary,#6b7280);font-size:11px;line-height:16px}
.mpc-sect{padding:8px 8px 2px;color:var(--dsw-alias-label-tertiary,#9ca3af);font-size:11px;line-height:16px}
.mpc-search{width:100%;box-sizing:border-box;margin:2px 0 4px;padding:6px 9px;border:1px solid rgba(17,24,39,.12);border-radius:9px;background:transparent;color:inherit;font:inherit;font-size:12.5px;outline:none}
.mpc-search:focus{border-color:rgba(77,107,254,.55)}
.mpc-search::placeholder{color:var(--dsw-alias-label-tertiary,#a7abb3)}
.mpc-empty{padding:12px 8px;color:var(--dsw-alias-label-tertiary,#9ca3af);font-size:12px;text-align:center}
.mpc-error{margin:2px 2px 6px;padding:7px 9px;border-radius:9px;background:rgba(239,68,68,.1);color:#dc2626;font-size:12px;line-height:17px}
.mpc-sep{height:1px;margin:6px 8px;background:rgba(17,24,39,.08)}
.mpc-effort{padding:0 0 4px}
.mpc-effort-row{display:flex;align-items:center;gap:8px;padding:8px 8px 2px;font-size:13px}
.mpc-effort-key{flex:1;color:var(--dsw-alias-label-primary,#111827)}
.mpc-effort-val{color:var(--dsw-alias-label-secondary,#6b7280);font-size:12px}
.mpc-bar{position:relative;margin:10px 10px 8px;height:32px;cursor:pointer;touch-action:none;outline:none}
.mpc-bar-track{position:absolute;left:0;right:0;top:50%;height:14px;margin-top:-7px;border-radius:999px;background:rgba(17,24,39,.09)}
.mpc-bar-fill{position:absolute;left:0;top:50%;height:14px;margin-top:-7px;border-radius:999px;background-image:linear-gradient(90deg,#ffd8a8 0%,#fdba74 22%,#fb923c 44%,#ea580c 62%,#fb923c 80%,#fdba74 100%);background-size:200% 100%;transition:width .22s cubic-bezier(.2,.8,.2,1)}
.mpc-bar-dot{position:absolute;top:50%;width:5px;height:5px;margin-left:-2.5px;margin-top:-2.5px;border-radius:50%;background:rgba(17,24,39,.22);pointer-events:none;transition:background .18s ease}
.mpc-bar-dot[data-on="true"]{background:rgba(255,255,255,.92)}
.mpc-bar-knob{position:absolute;top:50%;width:24px;height:24px;margin-left:-12px;margin-top:-12px;border-radius:50%;background:#ffffff;box-shadow:0 2px 6px rgba(15,23,42,.28),0 0 0 1px rgba(15,23,42,.04);pointer-events:none;transition:left .22s cubic-bezier(.2,.8,.2,1)}
.mpc-bar[data-max="true"] .mpc-bar-fill{animation:mpc-flow 1.9s linear infinite;box-shadow:0 0 0 3px rgba(234,88,12,.16),0 0 14px rgba(234,88,12,.4)}
.mpc-bar[data-max="true"] .mpc-bar-knob{animation:mpc-knob 1.5s ease-in-out infinite}
.mpc-bar:focus-visible .mpc-bar-track{box-shadow:0 0 0 3px rgba(234,88,12,.22)}
@keyframes mpc-flow{from{background-position:0% 50%}to{background-position:200% 50%}}
@keyframes mpc-knob{0%,100%{box-shadow:0 2px 6px rgba(15,23,42,.28),0 0 0 0 rgba(234,88,12,.5)}50%{box-shadow:0 2px 6px rgba(15,23,42,.28),0 0 0 8px rgba(234,88,12,0)}}
@media (prefers-reduced-motion:reduce){.mpc-bar[data-max="true"] .mpc-bar-fill{animation:none}.mpc-bar[data-max="true"] .mpc-bar-knob{animation:none}.mpc-bar-fill,.mpc-bar-knob{transition:none}.mpc-menu-sub{animation:none}.mpc-chev{transition:none}}
.mpc-menu-sub{z-index:91;width:240px;animation:mpc-sub-right .17s cubic-bezier(.2,.8,.2,1)}
.mpc-menu-sub.mpc-sub-left{animation-name:mpc-sub-left}
@keyframes mpc-sub-right{from{opacity:0;transform:translateX(-7px) scale(.97)}to{opacity:1;transform:none}}
@keyframes mpc-sub-left{from{opacity:0;transform:translateX(7px) scale(.97)}to{opacity:1;transform:none}}
.mpc-team{display:flex;align-items:center;gap:8px;padding:6px 8px 4px;font-size:13px;line-height:18px}
.mpc-team-label{flex:1;min-width:0;display:inline-flex;align-items:center;gap:5px;color:var(--dsw-alias-label-primary,#111827)}
.mpc-team-info{flex:none;display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--dsw-alias-label-tertiary,#9ca3af);cursor:help}
.mpc-team-info:hover{color:var(--dsw-alias-label-secondary,#6b7280)}
.mpc-switch{flex:none;position:relative;width:34px;height:20px;padding:0;border:0;border-radius:999px;background:rgba(17,24,39,.18);cursor:pointer;transition:background .18s ease}
.mpc-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary,#4d6bfe)}
.mpc-switch:disabled{cursor:default;opacity:.5}
.mpc-switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.3);transition:transform .18s cubic-bezier(.2,.8,.2,1)}
.mpc-switch[aria-checked="true"] .mpc-switch-knob{transform:translateX(14px)}
html.dark .mpc-switch,html[data-theme="dark"] .mpc-switch,body.dark .mpc-switch{background:rgba(255,255,255,.24)}
html.dark .mpc-switch[aria-checked="true"],html[data-theme="dark"] .mpc-switch[aria-checked="true"],body.dark .mpc-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary,#4d6bfe)}
.mpc-confirm{margin:4px 2px 2px;padding:9px 10px;border-radius:10px;background:rgba(234,88,12,.08);color:var(--dsw-alias-label-primary,#111827)}
.mpc-confirm-title{font-size:12.5px;font-weight:600;line-height:18px}
.mpc-confirm-body{margin-top:4px;color:var(--dsw-alias-label-secondary,#4b5563);font-size:12px;line-height:17px}
.mpc-confirm-warn{margin-top:4px;color:var(--dsw-alias-label-tertiary,#6b7280);font-size:11.5px;line-height:16px}
.mpc-confirm-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}
.mpc-btn{padding:4px 10px;border:1px solid rgba(17,24,39,.14);border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:18px;cursor:pointer}
.mpc-btn:hover{background:rgba(17,24,39,.06)}
.mpc-btn[data-primary="true"]{border-color:transparent;background:#111827;color:#fff}
.mpc-btn[data-primary="true"]:hover{background:#000}
html.dark .mpc-btn[data-primary="true"],html[data-theme="dark"] .mpc-btn[data-primary="true"],body.dark .mpc-btn[data-primary="true"]{background:#f3f4f6;color:#111827}
.mpc-team-error{margin:2px 8px 4px;color:var(--dsw-alias-label-error,#dc2626);font-size:11.5px;line-height:16px}
.mpc-head{display:flex;align-items:center;gap:4px;width:100%}
.mpc-head-main{flex:1;min-width:0;display:flex}
.mpc-head:hover{background:rgba(17,24,39,.055)}
.mpc-head[data-open="true"]{background:rgba(17,24,39,.07)}
.mpc-head .mpc-head-row:hover,.mpc-head .mpc-head-row[aria-expanded="true"]{background:transparent}
.mpc-head[data-open="true"] .mpc-chev{transform:rotate(90deg)}
.mpc-bal{flex:none;display:inline-flex;align-items:center;gap:3px;padding:1px 7px;border:0;border-radius:999px;background:rgba(17,24,39,.06);color:var(--dsw-alias-label-secondary,#4b5563);font:inherit;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums;cursor:pointer}
.mpc-bal:hover{background:rgba(17,24,39,.11)}
.mpc-bal[data-state="low"]{background:rgba(234,88,12,.11);color:#b45309}
.mpc-bal[data-state="failed"]{padding:1px 6px;border:1px dashed rgba(17,24,39,.22);background:transparent;color:var(--dsw-alias-label-tertiary,#9ca3af);cursor:default}
.mpc-bal[data-state="loading"]{color:var(--dsw-alias-label-tertiary,#9ca3af);cursor:default}
.mpc-bal-inline{margin-left:auto;padding-right:2px;color:var(--dsw-alias-label-secondary,#6b7280);font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}
.mpc-card{position:fixed;z-index:96;width:250px;padding:11px 12px;border-radius:12px;border:1px solid rgba(17,24,39,.08);background:#fff;color:var(--dsw-alias-label-primary,#111827);box-shadow:0 16px 40px rgba(15,23,42,.18),0 2px 8px rgba(15,23,42,.06);animation:mpc-card-in .15s cubic-bezier(.2,.8,.2,1)}
@keyframes mpc-card-in{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}
.mpc-card-head{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--dsw-alias-label-tertiary,#6b7280)}
.mpc-card-main{margin-top:5px;font-size:20px;font-weight:600;line-height:26px;font-variant-numeric:tabular-nums}
.mpc-card-rows{margin-top:5px;display:grid;gap:3px;font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary,#4b5563)}
.mpc-card-row{display:flex;justify-content:space-between;gap:10px}
.mpc-card-row b{font-weight:600;color:var(--dsw-alias-label-primary,#111827);font-variant-numeric:tabular-nums}
.mpc-card-foot{display:flex;align-items:center;gap:8px;margin-top:9px;padding-top:8px;border-top:1px solid rgba(17,24,39,.08)}
.mpc-card-time{flex:1;color:var(--dsw-alias-label-tertiary,#9ca3af);font-size:11px}
.mpc-card-note{margin-top:6px;color:var(--dsw-alias-label-tertiary,#6b7280);font-size:11px;line-height:1.5}
.mpc-card-link{color:var(--dsw-alias-brand-primary,#4d6bfe);font-size:12px;text-decoration:none}
.mpc-card-link:hover{text-decoration:underline}
.mpc-card-btn{padding:2px 8px;border:1px solid rgba(17,24,39,.14);border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:11.5px;line-height:16px;cursor:pointer}
.mpc-card-btn:hover{background:rgba(17,24,39,.06)}
html.dark .mpc-bal,html[data-theme="dark"] .mpc-bal,body.dark .mpc-bal{background:rgba(255,255,255,.1);color:rgba(255,255,255,.78)}
html.dark .mpc-bal[data-state="low"],html[data-theme="dark"] .mpc-bal[data-state="low"],body.dark .mpc-bal[data-state="low"]{background:rgba(234,88,12,.22);color:#fdba74}
html.dark .mpc-card,html[data-theme="dark"] .mpc-card,body.dark .mpc-card{background:#2b2c31;border-color:rgba(255,255,255,.1)}
html.dark .mpc-card-row b,html[data-theme="dark"] .mpc-card-row b,body.dark .mpc-card-row b{color:#f3f4f6}
`;

    function ensureStyle() {
      if (typeof document === 'undefined') return;
      // Re-sync the text, not just the presence: a hot reload can leave the
      // element behind with the previous sheet, which silently drops new rules.
      let el = document.getElementById(STYLE_ID);
      if (!el) {
        el = document.createElement('style');
        el.id = STYLE_ID;
        document.head.appendChild(el);
      }
      if (el.textContent !== CSS) el.textContent = CSS;
    }

    const Check = () => h('span', { className: 'mpc-check' },
      h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M3.4 8.4 6.4 11.4 12.6 4.9', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' })));
    const ChevRight = () => h('span', { className: 'mpc-chev' },
      h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M6.2 3.8 10.4 8l-4.2 4.2', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' })));
    const ChevDown = () => h('svg', { width: 12, height: 12, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
      h('path', { d: 'M3.8 6.2 8 10.4l4.2-4.2', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }));
    const DataIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
      h('path', { d: 'M8 1.8c3.4 0 6.2 1.1 6.2 2.5S11.4 6.8 8 6.8 1.8 5.7 1.8 4.3 4.6 1.8 8 1.8Z', stroke: 'currentColor', strokeWidth: 1.3 }),
      h('path', { d: 'M1.8 4.3v3.6c0 1.4 2.8 2.5 6.2 2.5s6.2-1.1 6.2-2.5V4.3', stroke: 'currentColor', strokeWidth: 1.3 }),
      h('path', { d: 'M1.8 7.9v3.6c0 1.4 2.8 2.5 6.2 2.5s6.2-1.1 6.2-2.5V7.9', stroke: 'currentColor', strokeWidth: 1.3 }));

    /** Put the two DeepSeek providers first, keeping every other provider in catalog order. */
    function orderGroups(groups) {
      const rank = (group) => (group.id === 'deepseek-account' ? 0 : group.id === 'deepseek-official' ? 1 : 2);
      return (groups || []).slice().sort((left, right) => rank(left) - rank(right));
    }

    /** Case-insensitive substring match, good enough for the per-provider search box. */
    function filterModels(models, query) {
      const needle = query.trim().toLowerCase();
      if (!needle) return models;
      return models.filter((model) => String(model.name || model.id).toLowerCase().includes(needle));
    }

    /**
     * `@liustack/modlens` registers one shadow provider per real provider, named
     * `<provider> (modlens vision)`, holding only the text-only models it can
     * feed image evidence to. They are real choices but they are noise next to
     * the providers themselves, so the root pane collapses them into one row.
     */
    const VISION_SUFFIX = /\s*\(modlens vision\)\s*$/i;
    const isVisionGroup = (group) => /modlens/i.test(String(group.id)) || VISION_SUFFIX.test(String(group.label || group.name || '')) || VISION_SUFFIX.test(String(group.name || ''));
    const stripVisionSuffix = (text) => String(text || '').replace(VISION_SUFFIX, '');

    /** Where the balance card's "去充值" link goes when the host exposes no link. */
    const TOP_UP_URL = 'https://platform.deepseek.com/top_up';

    /** Host channel served by this package's `index.js`. */
    const BALANCE_CHANNEL = '/mpc';

    /**
     * Remembering what a provider was left on is what makes a provider switch
     * cost one click instead of three. Kept in `localStorage` because the menu
     * is mounted per session and the choice outlives both the panel and the tab.
     */
    const RECENT_KEY = 'model-pick.recent';

    function readRecent() {
      try {
        if (typeof window === 'undefined') return {};
        const raw = window.localStorage.getItem(RECENT_KEY);
        const parsed = raw === null ? null : JSON.parse(raw);
        return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch (error) {
        return {};
      }
    }

    function writeRecent(value) {
      try {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(value));
      } catch (error) {
        // Private mode or a full quota: remembering is a convenience, not state.
      }
    }

    const recentChoices = readRecent();

    /** `¥ 128.40` / `-¥ 1.22` — grouped thousands, always two decimals, sign outside the symbol. */
    function moneyText(amount, currency) {
      const symbol = String(currency || '').toUpperCase() === 'USD' ? '$' : '¥';
      const value = Number(amount);
      if (!Number.isFinite(value)) return symbol + ' —';
      const parts = Math.abs(value).toFixed(2).split('.');
      const sign = value < 0 ? '-' : '';
      return sign + symbol + ' ' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
    }

    /** Wallets arrive per currency; prefer CNY, otherwise take whatever came first. */
    function walletOf(list) {
      const items = Array.isArray(list) ? list : [];
      return items.find((wallet) => String((wallet && wallet.currency) || '').toUpperCase() === 'CNY') || items[0] || null;
    }

    /**
     * Flatten the `remote.account.getBalance` envelope into the few fields the
     * card renders. The host answers null when signed out and `failed` when the
     * platform call did not land, so keep the reason: "unavailable" alone leaves
     * no way to tell a missing remote from an expired grant.
     */
    function readBalance(envelope) {
      if (!envelope || envelope.ok !== true) {
        return {
          status: 'failed',
          reason: (envelope && envelope.reason) || 'unknown',
          message: (envelope && envelope.message) || '',
        };
      }
      const result = envelope.value;
      if (!result || result.status !== 'ready') return { status: 'failed', reason: 'failed' };
      const main = walletOf(result.value);
      if (!main) return { status: 'failed', reason: 'empty' };
      const bonus = walletOf(result.bonusWallets);
      return {
        status: 'ready',
        currency: main.currency,
        available: main.balance,
        bonus: bonus ? bonus.balance : null,
        at: Date.now(),
      };
    }

    /**
     * ZCode-style layout: a single panel whose top row is the provider
     * selector (clicking it opens the provider list in a flyout beside the
     * panel), whose body lists that provider's models, and whose footer holds
     * the reasoning-effort ladder.
     */
    function Picker(props) {
      const { locked, available, directory, load, select, resolveText, t, selectTeamMode, loadBalance } = props;
      const state = useSyncExternalStore(
        useCallback((notify) => directory.subscribe(notify), [directory]),
        useCallback(() => directory.getSnapshot(), [directory]),
      );
      const [open, setOpen] = useState(false);
      const [submenu, setSubmenu] = useState(false);
      const [providerId, setProviderId] = useState(null);
      const [query, setQuery] = useState('');
      const [error, setError] = useState(null);
      const [teamError, setTeamError] = useState(null);
      const [teamPending, setTeamPending] = useState(false);
      const [teamConfirm, setTeamConfirm] = useState(false);
      const [pos, setPos] = useState(null);
      const [subPos, setSubPos] = useState(null);
      const [bal, setBal] = useState(null);
      const [balOpen, setBalOpen] = useState(false);
      const [balPinned, setBalPinned] = useState(false);
      const [balPos, setBalPos] = useState(null);
      const triggerRef = useRef(null);
      const menuRef = useRef(null);
      const subRef = useRef(null);
      const headRef = useRef(null);
      const searchRef = useRef(null);
      const balRef = useRef(null);
      const cardRef = useRef(null);
      /** Hover timers: the flyout and the balance card both open on intent, not on contact. */
      const hoverTimer = useRef(null);
      const balTimer = useRef(null);
      /** True while the flyout is up because of hover, so a following click confirms instead of closing. */
      const hoverOpened = useRef(false);

      /**
       * Agent-team selection lives in the host's own projections; the built-in
       * model menu renders it through its `conversation.input.model.options`
       * child slot, which a shadowing registration cannot re-declare (the slot
       * core rejects a second declaration of the same child). Read the same
       * projection and call the same remote so the switch behaves identically.
       */
      const useProjection = typeof props.useProjection === 'function' ? props.useProjection : null;
      const teamMode = useProjection === null ? undefined : useProjection('agentTeam');
      const modelSelection = useProjection === null ? undefined : useProjection('modelSelection');
      const useSession = typeof props.useSession === 'function' ? props.useSession : null;
      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : null;
      const addressedChild = useSession === null ? false : useSession((snapshot) => snapshot.subagent !== null);
      const listedChild = useSessions === null ? false : useSessions(
        (snapshots) => (snapshots && snapshots.byId ? snapshots.byId[props.sessionId]?.origin === 'subagent' : false),
      );
      const teamVisible = teamMode !== undefined && teamMode !== null
        && !addressedChild && !listedChild
        && typeof selectTeamMode === 'function';
      const teamOn = teamVisible && teamMode.enabled === true;

      /** Persist the switch; the host answers with the failure text, or null on success. */
      const applyTeam = (enabled) => {
        if (teamPending) return;
        setTeamError(null);
        setTeamConfirm(false);
        setTeamPending(true);
        Promise.resolve(selectTeamMode(enabled)).then((failure) => {
          if (failure) setTeamError(t('teamFailed', { message: failure }));
        }, (cause) => {
          setTeamError(t('teamFailed', { message: String((cause && cause.message) || cause) }));
        }).then(() => setTeamPending(false));
      };
      /** Turning the team off mid-conversation asks first, exactly like the built-in menu. */
      const toggleTeam = (next) => {
        if (teamPending) return;
        const used = modelSelection !== undefined && modelSelection !== null && modelSelection.lastUsed !== null
          && modelSelection.lastUsed !== undefined;
        if (next === false && used) {
          setTeamConfirm(true);
          return;
        }
        applyTeam(next);
      };

      const scheduleSubmenu = (next, delay) => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => {
          hoverTimer.current = null;
          hoverOpened.current = next;
          setSubmenu(next);
        }, delay);
      };
      const cancelSubmenuTimer = () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        hoverTimer.current = null;
      };

      const resolve = (text) => (typeof resolveText === 'function' ? resolveText(text) : text);
      const groups = useMemo(() => orderGroups(state.groups).map((group) => ({
        ...group,
        label: group.id === 'deepseek-account' ? t('providerAccount') : resolve(group.name),
        models: group.models || [],
      })), [state.groups, resolveText, t]);
      const failures = state.failures || [];
      const realGroups = groups.filter((group) => !isVisionGroup(group));
      const visionGroups = groups.filter(isVisionGroup);
      const current = state.current || null;
      const currentGroup = groups.find((group) => group.id === current?.provider) || null;
      const currentModel = currentGroup ? currentGroup.models.find((model) => model.id === current.model) || null : null;
      const reasoning = currentModel?.reasoning;
      const levels = reasoning?.efforts || [];
      const effectiveEffort = current?.reasoningEffort ?? reasoning?.defaultEffort;
      const levelIndex = levels.findIndex((level) => level.id === effectiveEffort);
      /** Localized level name; the host ships English ids such as `off` / `max`. */
      const effortName = (level) => {
        if (!level) return '';
        const key = 'effort_' + level.id;
        const text = t(key);
        return text && text !== key ? text : level.name || level.id;
      };
      const effortLabel = reasoning === undefined
        ? undefined
        : effectiveEffort === undefined
          ? t('effortDefault')
          : effortName(levels.find((level) => level.id === effectiveEffort)) || effectiveEffort;
      const waiting = currentModel === null && state.status === 'loading';
      const busy = state.pending !== null && state.pending !== undefined;
      const modelLabel = waiting ? t('loading') : currentModel?.name || t('select');

      /** The provider whose models the panel body lists. */
      const viewed = groups.find((group) => group.id === providerId) || currentGroup || null;
      const viewedVision = viewed ? isVisionGroup(viewed) : false;
      const shownModels = viewed ? filterModels(viewed.models, query) : [];
      const monogram = (group) => String(group?.label || '?').trim().slice(0, 1);

      /**
       * The wallet API belongs to the DeepSeek account provider only, so the
       * pill appears there and nowhere else rather than leaving an empty slot
       * next to providers that can never answer.
       */
      const balanceOn = open && viewed !== null && viewed.id === 'deepseek-account' && typeof loadBalance === 'function';
      const balanceText = bal && bal.status === 'ready' ? moneyText(bal.available, bal.currency) : null;
      const balState = bal === null || bal.status === 'loading'
        ? 'loading'
        : bal.status === 'ready'
          ? (Number(bal.available) < 20 ? 'low' : 'ready')
          : 'failed';
      /** Spelled-out cause under the failed headline, so the fix is obvious. */
      const balReason = bal === null || bal.status !== 'failed'
        ? ''
        : bal.reason === 'no-remote'
          ? t('balReasonNoRemote')
          : bal.reason === 'signed-out'
            ? t('balReasonSignedOut')
            : bal.reason === 'empty'
              ? t('balReasonEmpty')
              : bal.reason === 'error'
                ? t('balReasonError', { message: bal.message || '' })
                : t('balReasonFailed');

      const requestBalance = (force) => {
        if (typeof loadBalance !== 'function') return;
        setBal((prev) => (force || prev === null ? { status: 'loading' } : prev));
        Promise.resolve(loadBalance(force === true)).then(
          (result) => setBal(readBalance(result)),
          () => setBal({ status: 'failed' }),
        );
      };
      /** Hover opens the card after 300ms; leaving it keeps a pinned card up. */
      const scheduleBalance = (next, delay) => {
        if (balTimer.current) clearTimeout(balTimer.current);
        balTimer.current = setTimeout(() => {
          balTimer.current = null;
          if (next) {
            setBalOpen(true);
            return;
          }
          if (!balPinned) setBalOpen(false);
        }, delay);
      };
      const toggleBalance = () => {
        if (balTimer.current) clearTimeout(balTimer.current);
        balTimer.current = null;
        const next = !balOpen;
        setBalOpen(next);
        setBalPinned(next);
        if (next) requestBalance(false);
      };

      /** Place the panel above the trigger, right-aligned. */
      useLayoutEffect(() => {
        if (!open) {
          setPos(null);
          return undefined;
        }
        const place = () => {
          const rect = triggerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const width = 268;
          const right = Math.max(8, Math.min(window.innerWidth - width - 8, window.innerWidth - rect.right));
          const bottom = Math.max(8, window.innerHeight - rect.top + 6);
          const maxHeight = Math.max(200, Math.min(window.innerHeight * 0.66, rect.top - 20));
          setPos({ right, bottom, maxHeight });
        };
        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
      }, [open]);

      /** Fly the provider list out beside the panel: right when there is room, else left. */
      useLayoutEffect(() => {
        if (!open || !submenu) {
          setSubPos(null);
          return undefined;
        }
        const place = () => {
          const anchor = headRef.current;
          const panel = menuRef.current;
          if (!anchor || !panel) return;
          const a = anchor.getBoundingClientRect();
          const p = panel.getBoundingClientRect();
          const width = 240;
          const gap = 6;
          const roomRight = window.innerWidth - p.right - gap - 8;
          const toRight = roomRight >= width;
          const left = toRight ? p.right + gap : Math.max(8, p.left - gap - width);
          const top = Math.max(8, Math.min(a.top - 7, window.innerHeight - 140));
          const maxHeight = Math.max(140, window.innerHeight - top - 12);
          setSubPos({ left, top, maxHeight, toRight });
        };
        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
      }, [open, submenu]);

      useEffect(() => {
        if (!open) return undefined;
        const onDown = (event) => {
          if (triggerRef.current?.contains(event.target) === true) return;
          if (menuRef.current?.contains(event.target) === true) return;
          if (subRef.current?.contains(event.target) === true) return;
          if (cardRef.current?.contains(event.target) === true) return;
          setOpen(false);
        };
        const onKey = (event) => {
          if (event.key !== 'Escape') return;
          event.stopPropagation();
          if (balOpen) {
            setBalOpen(false);
            setBalPinned(false);
            return;
          }
          if (submenu) {
            setSubmenu(false);
            return;
          }
          setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
          document.removeEventListener('mousedown', onDown);
          document.removeEventListener('keydown', onKey);
        };
      }, [open, submenu, balOpen]);

      useEffect(() => {
        if (open) load();
      }, [open]);

      /** Fetch the balance once per panel opening; the host caches it for a minute. */
      useEffect(() => {
        if (!open) {
          setBalOpen(false);
          setBalPinned(false);
          return;
        }
        if (viewed !== null && viewed.id === 'deepseek-account' && bal === null) requestBalance(false);
      }, [open, viewed === null ? null : viewed.id]);

      /** Anchor the balance card under the pill, clamped into the viewport. */
      useLayoutEffect(() => {
        if (!balOpen) {
          setBalPos(null);
          return undefined;
        }
        const place = () => {
          const node = balRef.current;
          if (!node) return;
          const rect = node.getBoundingClientRect();
          const width = 250;
          const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
          const top = Math.min(rect.bottom + 6, Math.max(8, window.innerHeight - 200));
          setBalPos({ left, top });
        };
        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
      }, [balOpen, bal]);

      useEffect(() => () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        if (balTimer.current) clearTimeout(balTimer.current);
      }, []);

      const openMenu = () => {
        ensureStyle();
        setError(null);
        setSubmenu(false);
        setQuery('');
        setProviderId(null);
        setOpen((value) => !value);
      };

      /**
       * `keepOpen` keeps the panel up while switching: picking another model or
       * nudging the strength is usually part of a short back-and-forth, so the
       * menu stays until an outside click, the trigger or Escape closes it.
       */
      const choose = (selection, options) => {
        if (busy) return;
        const keepOpen = options?.keepOpen === true;
        setError(null);
        Promise.resolve(select(selection)).then((result) => {
          if (result && result.ok === false && result.error) {
            setError(t('switchFailed', { message: result.error.message || result.error.code || 'error' }));
            return;
          }
          if (selection && typeof selection.provider === 'string' && typeof selection.model === 'string') {
            recentChoices[selection.provider] = {
              model: selection.model,
              effort: selection.reasoningEffort === undefined ? null : selection.reasoningEffort,
            };
            writeRecent(recentChoices);
          }
          if (keepOpen) return;
          setOpen(false);
          setSubmenu(false);
        }).catch((cause) => {
          setError(t('switchFailed', { message: String((cause && cause.message) || cause) }));
        });
      };

      /** `effort` overrides the model's default when a provider remembers one. */
      const chooseModel = (group, model, effort) => {
        const same = current?.provider === group.id && current?.model === model.id;
        if (same) {
          if (effort !== undefined && effort !== effectiveEffort) {
            choose({ provider: group.id, model: model.id, reasoningEffort: effort }, { keepOpen: true });
          }
          return;
        }
        const next = effort === undefined ? model.reasoning?.defaultEffort : effort;
        choose({
          provider: group.id,
          model: model.id,
          ...(next === undefined ? {} : { reasoningEffort: next }),
        }, { keepOpen: true });
      };

      const chooseEffort = (effort) => {
        if (current === null) return;
        if (effectiveEffort === effort) return;
        choose({
          provider: current.provider,
          model: current.model,
          ...(effort === undefined ? {} : { reasoningEffort: effort }),
        }, { keepOpen: true });
      };

      /**
       * Switching provider resumes what that provider was left on: same model and
       * strength when it still exists, otherwise the provider's first model. The
       * panel is a picker, not a filter, so leaving it on the previous provider's
       * model would make the switch look like nothing happened.
       */
      const pickProvider = (group) => {
        hoverOpened.current = false;
        cancelSubmenuTimer();
        setProviderId(group.id);
        setSubmenu(false);
        setQuery('');
        setError(null);
        const models = group.models || [];
        const remembered = recentChoices[group.id];
        const target = (remembered ? models.find((model) => model.id === remembered.model) : undefined) || models[0];
        if (!target) return;
        const efforts = (target.reasoning && target.reasoning.efforts) || [];
        const effort = remembered && remembered.model === target.id && remembered.effort
          && efforts.some((item) => item.id === remembered.effort)
          ? remembered.effort
          : undefined;
        chooseModel(group, target, effort);
      };

      const providerRow = (group) => h('button', {
        key: 'p:' + group.id,
        type: 'button',
        role: 'menuitemradio',
        className: 'mpc-row',
        'aria-checked': current?.provider === group.id ? 'true' : 'false',
        'aria-disabled': busy ? 'true' : 'false',
        onClick: () => pickProvider(group),
      },
      h('span', { className: 'mpc-mono' }, monogram(group)),
      h('span', { className: 'mpc-name' }, stripVisionSuffix(group.label)),
      isVisionGroup(group) ? h('span', { className: 'mpc-tag' }, 'modlens') : null,
      group.id === 'deepseek-account' && balanceText ? h('span', { className: 'mpc-bal-inline' }, balanceText) : null,
      current?.provider === group.id ? h(Check) : null);

      const failureRows = failures.map((failure) => h('button', {
        key: 'failure:' + failure.id,
        type: 'button',
        role: 'menuitem',
        className: 'mpc-row',
        disabled: true,
        title: failure.message,
      },
      h('span', { className: 'mpc-mono' }, '!'),
      h('span', { className: 'mpc-name' }, failure.id === 'deepseek-account' ? t('providerAccount') : failure.name),
      h('span', { className: 'mpc-sub' }, t('loadError', { message: failure.message }))));

      const headRow = h('button', {
        ref: headRef,
        type: 'button',
        className: 'mpc-head-row',
        'aria-haspopup': 'menu',
        'aria-expanded': submenu ? 'true' : 'false',
        'aria-disabled': busy ? 'true' : 'false',
        onMouseEnter: () => scheduleSubmenu(true, 110),
        onMouseLeave: () => scheduleSubmenu(false, 240),
        onClick: () => {
          cancelSubmenuTimer();
          if (!submenu) {
            hoverOpened.current = false;
            setSubmenu(true);
            return;
          }
          // Hover already opened it: the click confirms the flyout, it should
          // not bounce it closed under the pointer.
          if (hoverOpened.current) {
            hoverOpened.current = false;
            return;
          }
          setSubmenu(false);
        },
      },
      h('span', { className: 'mpc-mono' }, viewed ? monogram(viewed) : '·'),
      h('span', { className: 'mpc-name' }, viewed ? stripVisionSuffix(viewed.label) : t('select')),
      viewedVision ? h('span', { className: 'mpc-tag' }, 'modlens') : null);

      /**
       * The header is a group, not one button: the balance pill is interactive
       * on its own, and nesting a button inside a button is invalid markup that
       * React would also complain about.
       */
      const balancePill = balanceOn ? h('button', {
        ref: balRef,
        type: 'button',
        className: 'mpc-bal',
        'data-state': balState,
        'aria-haspopup': 'dialog',
        'aria-expanded': balOpen ? 'true' : 'false',
        title: t('balTitle'),
        onMouseEnter: () => scheduleBalance(true, 300),
        onMouseLeave: () => scheduleBalance(false, 200),
        onClick: toggleBalance,
      },
      balState === 'failed' ? t('balFailed') : balState === 'loading' ? '···' : balanceText) : null;

      const headGroup = h('div', { className: 'mpc-head', 'data-open': submenu ? 'true' : 'false' },
        h('div', { className: 'mpc-head-main' }, headRow),
        balancePill,
        h(ChevRight));

      const ratio = levels.length > 1 && levelIndex >= 0 ? levelIndex / (levels.length - 1) : (levelIndex >= 0 ? 1 : 0);
      const pickEffortAt = (event) => {
        if (levels.length === 0) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width) return;
        const share = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        const index = Math.round(share * (levels.length - 1));
        chooseEffort(levels[index].id);
      };
      const effortBar = levels.length === 0 ? null : h('div', {
        className: 'mpc-effort',
        role: 'group',
        'aria-label': t('effortTitle'),
      },
      h('div', { className: 'mpc-effort-row' },
        h('span', { className: 'mpc-effort-key' }, t('effortTitle')),
        h('span', { className: 'mpc-effort-val' }, effortLabel || '')),
      h('div', {
        className: 'mpc-bar',
        role: 'slider',
        tabIndex: 0,
        'data-max': levels.length > 1 && levelIndex === levels.length - 1 ? 'true' : 'false',
        'aria-label': t('effortTitle'),
        'aria-valuemin': 0,
        'aria-valuemax': levels.length - 1,
        'aria-valuenow': levelIndex < 0 ? 0 : levelIndex,
        'aria-valuetext': effortLabel || '',
        onClick: pickEffortAt,
        onKeyDown: (event) => {
          const step = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0;
          if (step === 0) return;
          event.preventDefault();
          const base = levelIndex < 0 ? 0 : levelIndex;
          const next = Math.min(levels.length - 1, Math.max(0, base + step));
          chooseEffort(levels[next].id);
        },
      },
      h('span', { className: 'mpc-bar-track' }),
      h('span', { className: 'mpc-bar-fill', style: { width: ratio * 100 + '%' } }),
      ...levels.map((level, index) => h('span', {
        key: 'dot:' + level.id,
        className: 'mpc-bar-dot',
        title: effortName(level),
        'data-on': index <= (levelIndex < 0 ? 0 : levelIndex) ? 'true' : 'false',
        style: { left: (levels.length > 1 ? index / (levels.length - 1) : 1) * 100 + '%' },
      })),
      h('span', { className: 'mpc-bar-knob', style: { left: ratio * 100 + '%' } })));

      /**
       * The agent-team switch, mirroring the built-in menu's footer row: label,
       * an info affordance for the longer explanation, then the toggle.
       */
      const teamRow = teamVisible ? h('div', { className: 'mpc-team' },
        h('span', { className: 'mpc-team-label' },
          h('span', null, t('teamLabel')),
          h('button', {
            type: 'button',
            className: 'mpc-team-info',
            title: t('teamInfo'),
            'aria-label': t('teamInfo'),
            onClick: (event) => event.preventDefault(),
          }, h('svg', { width: 11, height: 11, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
            h('circle', { cx: 8, cy: 8, r: 6.4, stroke: 'currentColor', strokeWidth: 1.3 }),
            h('path', { d: 'M8 7.2v4', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
            h('circle', { cx: 8, cy: 4.9, r: 0.85, fill: 'currentColor' })))),
        h('button', {
          type: 'button',
          role: 'switch',
          className: 'mpc-switch',
          'aria-checked': teamOn ? 'true' : 'false',
          'aria-label': t('teamLabel'),
          disabled: locked === true || teamPending,
          onClick: () => toggleTeam(!teamOn),
        }, h('span', { className: 'mpc-switch-knob' })))
        : null;

      const teamConfirmBox = teamVisible && teamConfirm ? h('div', { className: 'mpc-confirm' },
        h('div', { className: 'mpc-confirm-title' }, t('teamConfirmTitle')),
        h('div', { className: 'mpc-confirm-body' }, t('teamConfirmBody')),
        h('div', { className: 'mpc-confirm-warn' }, t('teamConfirmWarn')),
        h('div', { className: 'mpc-confirm-actions' },
          h('button', { type: 'button', className: 'mpc-btn', onClick: () => setTeamConfirm(false) }, t('teamCancel')),
          h('button', { type: 'button', className: 'mpc-btn', 'data-primary': 'true', onClick: () => applyTeam(false) }, t('teamDisable'))))
        : null;

      const teamNote = teamVisible && teamError ? h('div', { className: 'mpc-team-error' }, teamError) : null;

      const panel = [
        error ? h('div', { key: 'err', className: 'mpc-error' }, error) : null,
        h('div', { key: 'head' }, headGroup),
        h('div', { key: 'sect', className: 'mpc-sect' }, t('modelsTitle')),
        viewed && viewed.models.length > 4
          ? h('input', {
            key: 'search',
            ref: searchRef,
            className: 'mpc-search',
            type: 'search',
            placeholder: t('search'),
            value: query,
            onChange: (event) => setQuery(event.target.value),
          })
          : null,
        h('div', { key: 'list', className: 'mpc-scroll', role: 'group', style: { maxHeight: pos ? Math.max(96, pos.maxHeight - 140) : undefined } },
          !viewed ? h('div', { className: 'mpc-empty' }, state.status === 'loading' ? t('loadingList') : t('select')) : null,
          viewed && viewed.models.length === 0 ? h('div', { className: 'mpc-empty' }, t('emptyProvider')) : null,
          viewed && viewed.models.length > 0 && shownModels.length === 0 ? h('div', { className: 'mpc-empty' }, t('noMatch')) : null,
          ...shownModels.map((model) => {
            const active = current?.provider === viewed.id && current?.model === model.id;
            return h('button', {
              key: 'model:' + model.id,
              type: 'button',
              role: 'menuitemradio',
              className: 'mpc-row',
              'aria-checked': active ? 'true' : 'false',
              'aria-disabled': busy ? 'true' : 'false',
              onClick: () => chooseModel(viewed, model),
            },
            h('span', { className: 'mpc-name' }, viewedVision ? stripVisionSuffix(model.name) : model.name),
            model.badge ? h('span', { className: 'mpc-tag' }, resolve(model.badge.text)) : null,
            active ? h(Check) : null);
          })),
        effortBar ? h('div', { key: 'sep', className: 'mpc-sep' }) : null,
        effortBar,
        teamRow ? h('div', { key: 'tsep', className: 'mpc-sep' }) : null,
        teamRow,
        teamConfirmBox,
        teamNote,
      ];

      const providerMenu = [
        h('div', { key: 'sect', className: 'mpc-sect' }, t('providersTitle')),
        ...realGroups.map(providerRow),
        ...failureRows,
        ...(visionGroups.length === 0 ? [] : [
          h('div', { key: 'vsep', className: 'mpc-sep' }),
          h('div', { key: 'vsect', className: 'mpc-sect', title: t('visionHint') }, t('visionBridge')),
          ...visionGroups.map(providerRow),
        ]),
      ];

      const menu = open && available
        ? ReactDOM.createPortal(
          h('div', {
            ref: menuRef,
            className: 'mpc-menu',
            role: 'menu',
            'aria-label': t('menuAria'),
            style: pos ? { right: pos.right, bottom: pos.bottom, maxHeight: pos.maxHeight } : { visibility: 'hidden', left: 0, top: 0 },
          },
          ...panel),
          document.body)
        : null;

      const flyout = open && available && submenu
        ? ReactDOM.createPortal(
          h('div', {
            ref: subRef,
            className: 'mpc-menu mpc-menu-sub' + (subPos && subPos.toRight === false ? ' mpc-sub-left' : ''),
            role: 'menu',
            onMouseEnter: cancelSubmenuTimer,
            onMouseLeave: () => scheduleSubmenu(false, 240),
            style: subPos
              ? { left: subPos.left, top: subPos.top, maxHeight: subPos.maxHeight }
              : { visibility: 'hidden', left: 0, top: 0 },
          },
          h('div', { className: 'mpc-scroll', role: 'group', style: { maxHeight: subPos ? Math.max(120, subPos.maxHeight - 12) : undefined } },
            ...providerMenu)),
          document.body)
        : null;

      const balanceCard = balOpen && balanceOn ? ReactDOM.createPortal(
        h('div', {
          ref: cardRef,
          className: 'mpc-card',
          role: 'dialog',
          'aria-label': t('balTitle'),
          style: balPos ? { left: balPos.left, top: balPos.top } : { visibility: 'hidden', left: 0, top: 0 },
          onMouseEnter: () => {
            if (balTimer.current) clearTimeout(balTimer.current);
            balTimer.current = null;
          },
          onMouseLeave: () => scheduleBalance(false, 200),
        },
        h('div', { className: 'mpc-card-head' }, h('span', null, t('balTitle'))),
        bal !== null && bal.status === 'ready'
          ? h(React.Fragment, null,
            h('div', { className: 'mpc-card-main' }, moneyText(bal.available, bal.currency)),
            h('div', { className: 'mpc-card-rows' },
              h('div', { className: 'mpc-card-row' },
                h('span', null, t('balAvailable')),
                h('b', null, moneyText(bal.available, bal.currency))),
              bal.bonus === null || bal.bonus === undefined
                ? null
                : h('div', { className: 'mpc-card-row' },
                  h('span', null, t('balBonus')),
                  h('b', null, moneyText(bal.bonus, bal.currency)))),
            h('div', { className: 'mpc-card-foot' },
              h('span', { className: 'mpc-card-time' },
                bal.at ? t('balUpdated', { time: new Date(bal.at).toTimeString().slice(0, 5) }) : ''),
              h('button', {
                type: 'button',
                className: 'mpc-card-btn',
                onClick: () => requestBalance(true),
              }, t('balRefresh')),
              h('a', {
                className: 'mpc-card-link',
                href: TOP_UP_URL,
                target: '_blank',
                rel: 'noreferrer noopener',
                onClick: (event) => event.stopPropagation(),
              }, t('balTopUp'))))
          : h(React.Fragment, null,
            h('div', { className: 'mpc-card-main', style: { fontSize: 14, fontWeight: 500 } },
              bal !== null && bal.status === 'failed' ? t('balFailed') : t('loading')),
            balReason ? h('div', { className: 'mpc-card-note' }, balReason) : null)),
        document.body)
        : null;

      return h(React.Fragment, null,
        h('button', {
          ref: triggerRef,
          type: 'button',
          className: 'mpc-trigger',
          disabled: locked === true,
          title: locked === true ? t('locked') : available === false ? t('unavailable') : t('select'),
          'aria-haspopup': 'menu',
          'aria-expanded': open ? 'true' : 'false',
          onClick: openMenu,
        },
        h(DataIcon),
        h('span', { className: 'mpc-trigger-label' }, modelLabel),
        effortLabel ? h('span', { className: 'mpc-trigger-effort' }, effortLabel) : null,
        h(ChevDown)),
        menu,
        flyout,
        balanceCard);
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'modelDirectories'],
      apply(ctx) {
        ensureStyle();
        if (ctx.locale) ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'model-pick-chip: dictionaries');
        const bound = ctx.locale ? ctx.locale.bind(NS) : null;
        const t = (key, vars) => {
          const value = bound ? bound(key) : (zh[key] !== undefined ? zh[key] : en[key]);
          const text = typeof value === 'string' ? value : (en[key] !== undefined ? en[key] : key);
          if (!vars) return text;
          return text.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])));
        };
        /**
         * The agent-team remote face is owned by `@deepseek-ai/dsh-client-ui-agent-team`;
         * wait for it instead of requiring it, so this plugin also loads on
         * builds where the experimental feature is absent.
         */
        let agentTeams = null;
        ctx.inject(['remote', 'remote.agentTeams'], (scope) => {
          agentTeams = scope.remote.agentTeams;
          return () => { agentTeams = null; };
        });
        /**
         * `@deepseek-ai/dsh-deepseek-account` owns the wallet endpoint and
         * resolves the stored sign-in grant itself, so the balance needs no
         * host code here — only this remote face, which is absent on builds
         * without the account provider.
         */
        let account = null;
        ctx.inject(['remote', 'remote.account'], (scope) => {
          account = scope.remote.account;
          return () => { account = null; };
        });
        /**
         * Preferred path: this plugin's own Host channel (`index.js`). The
         * account remote answers `failed` on some machines because the platform
         * only serves the wallet to requests carrying the desktop client
         * headers; the Host half adds them and reports the real cause. The
         * remote stays as the fallback for hosts that never mounted the channel.
         */
        let connection = null;
        ctx.inject(['connection'], (scope) => {
          connection = scope.connection;
          return () => { connection = null; };
        });
        /** Host-side cache: the wallet endpoint is rate limited, the card is not. */
        let balanceCache = { at: 0, envelope: null };
        /**
         * Returns `{ok:true, value}` or `{ok:false, reason}` so the card can say
         * why it has no number: `no-remote` (this build exposes no account
         * namespace), `signed-out` (the host answered null), `failed` (the
         * platform call was rejected) or `error` (the transport threw).
         */
        const loadBalance = (force) => {
          if (!force && balanceCache.envelope !== null && Date.now() - balanceCache.at < 60000) {
            return Promise.resolve(balanceCache.envelope);
          }
          /** Own Host channel first: it adds the headers the wallet endpoint requires. */
          const viaHost = () => {
            if (connection === null || typeof connection !== 'object') return null;
            const rpc = connection.rpc;
            if (rpc === null || typeof rpc !== 'object' || typeof rpc.call !== 'function') return null;
            return Promise.resolve(rpc.call(BALANCE_CHANNEL, 'balance', {})).then((result) => {
              if (result !== null && typeof result === 'object' && result.ok === true) {
                return { ok: true, value: result.value };
              }
              const details = result !== null && typeof result === 'object' && result.error ? result.error.details : null;
              const reason = details && typeof details === 'object' ? details.reason : null;
              return { ok: false, reason: reason === 'signed-out' ? 'signed-out' : reason === 'error' ? 'error' : 'failed' };
            }, () => null); // unmounted channel: fall through to the account remote
          };
          const viaRemote = (retries) => {
            if (account === null || typeof account.getBalance !== 'function') {
              return Promise.resolve({ ok: false, reason: 'no-remote' });
            }
            return Promise.resolve(account.getBalance({
              version: '0.2.2-rc.3',
              locale: 'zh-CN',
              timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
            })).then((result) => {
              if (result === null) return { ok: false, reason: 'signed-out' };
              if (result && result.status === 'ready') return { ok: true, value: result };
              // One retry: the platform occasionally answers late on the first call of a
              // session, and a second attempt usually lands before we show a failure.
              if (retries > 0) return new Promise((done) => setTimeout(done, 700)).then(() => viaRemote(retries - 1));
              return { ok: false, reason: 'failed' };
            }, (cause) => (retries > 0
              ? new Promise((done) => setTimeout(done, 700)).then(() => viaRemote(retries - 1))
              : { ok: false, reason: 'error', message: String((cause && cause.message) || cause) }));
          };
          const host = viaHost();
          const pending = host === null ? viaRemote(1) : host.then((answer) => (answer === null ? viaRemote(1) : answer));
          return pending.then((envelope) => {
            balanceCache = { at: Date.now(), envelope };
            return envelope;
          });
        };
        const saveTeamMode = (sessionId, enabled) => {
          if (!agentTeams || typeof agentTeams.setEnabled !== 'function') {
            return Promise.resolve(t('teamUnavailable'));
          }
          return Promise.resolve(agentTeams.setEnabled(sessionId, enabled)).then(
            (result) => (result && result.ok === false
              ? (result.error && result.error.message) || String(result.error && result.error.code) || 'error'
              : null),
            (cause) => String((cause && cause.message) || cause),
          );
        };
        ctx.inject(['slots', 'sessions', 'modelDirectories'], (scope) => {
          const models = scope.modelDirectories;
          const sessions = scope.sessions;
          const Bound = (props) => h(Picker, { ...props, t });
          scope.slots.inject('conversation.input.model', () => scope.slots.register({
            name: 'conversation.input.model',
            id: 'model-pick-chip',
            // Lower than the built-in seat's default priority 0: the shell
            // renders the lowest-priority registration and refuses only a tie.
            priority: -1,
            locale: NS,
            inject: (sessionId) => {
              const directory = models.directoryFor(sessionId);
              const available = typeof sessions.subagentAddress === 'function'
                ? sessions.subagentAddress(sessionId) === undefined
                : true;
              return {
                available,
                directory: directory.store,
                load: () => {
                  if (available) directory.load().catch(() => {});
                },
                resolveText: (text) => (ctx.locale && typeof ctx.locale.resolveText === 'function' ? ctx.locale.resolveText(text) : text),
                select: (selection) => (available ? directory.select(selection) : Promise.resolve(undefined)),
                selectTeamMode: (enabled) => saveTeamMode(sessionId, enabled),
                loadBalance: (force) => loadBalance(force),
              };
            },
          }, Bound));
        });
      },
    };
  },
});