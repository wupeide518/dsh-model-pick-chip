window.__ModuleLoader__.load({
  id: '@local/model-pick-chip',
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

    /**
     * ZCode-style layout: a single panel whose top row is the provider
     * selector (clicking it opens the provider list in a flyout beside the
     * panel), whose body lists that provider's models, and whose footer holds
     * the reasoning-effort ladder.
     */
    function Picker(props) {
      const { locked, available, directory, load, select, resolveText, t } = props;
      const state = useSyncExternalStore(
        useCallback((notify) => directory.subscribe(notify), [directory]),
        useCallback(() => directory.getSnapshot(), [directory]),
      );
      const [open, setOpen] = useState(false);
      const [submenu, setSubmenu] = useState(false);
      const [providerId, setProviderId] = useState(null);
      const [query, setQuery] = useState('');
      const [error, setError] = useState(null);
      const [pos, setPos] = useState(null);
      const [subPos, setSubPos] = useState(null);
      const triggerRef = useRef(null);
      const menuRef = useRef(null);
      const subRef = useRef(null);
      const headRef = useRef(null);
      const searchRef = useRef(null);
      /** Hover intent timer: keeps a quick pass over the header from flashing the flyout. */
      const hoverTimer = useRef(null);
      /** True while the flyout is up because of hover, so a following click confirms instead of closing. */
      const hoverOpened = useRef(false);

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
          setOpen(false);
        };
        const onKey = (event) => {
          if (event.key !== 'Escape') return;
          event.stopPropagation();
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
      }, [open, submenu]);

      useEffect(() => {
        if (open) load();
      }, [open]);

      useEffect(() => () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
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
          if (keepOpen) return;
          setOpen(false);
          setSubmenu(false);
        }).catch((cause) => {
          setError(t('switchFailed', { message: String((cause && cause.message) || cause) }));
        });
      };

      const chooseModel = (group, model) => {
        if (current?.provider === group.id && current?.model === model.id) return;
        choose({
          provider: group.id,
          model: model.id,
          ...(model.reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: model.reasoning.defaultEffort }),
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
       * Switching provider also adopts that provider's first model: the panel
       * is a picker, not a filter, so leaving it on the previous provider's
       * model would make the switch look like nothing happened.
       */
      const pickProvider = (group) => {
        hoverOpened.current = false;
        cancelSubmenuTimer();
        setProviderId(group.id);
        setSubmenu(false);
        setQuery('');
        setError(null);
        const first = (group.models || [])[0];
        if (first) chooseModel(group, first);
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
      viewedVision ? h('span', { className: 'mpc-tag' }, 'modlens') : null,
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

      const panel = [
        error ? h('div', { key: 'err', className: 'mpc-error' }, error) : null,
        h('div', { key: 'head' }, headRow),
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
        flyout);
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
              };
            },
          }, Bound));
        });
      },
    };
  },
});