# @local/model-pick-chip

把 DSH 输入框右下角的「模型」选择器换成 **顶部选提供方、下方列该提供方模型** 的菜单（ZCode 风格）。

一个面板，三段：

```
┌──────────────────────────────┐
│ [D] DeepSeek            ›    │  ← 供应商选择行：点它，右侧弹出供应商列表
│ 模型                          │
│   deepseek-flash   视觉   ✓   │  ← 当前供应商的模型（>4 个时出现搜索框）
│   deepseek-v4-pro            │
│ ──────────────────────────── │
│ 思考强度             高       │
│ ●━━━━━━━━●━━━━━━━━●          │  ← 层数 = 该模型 efforts 的个数，几层几个点
└──────────────────────────────┘
```

- 思考强度不再是二级菜单，而是一条**层级条**：层数直接取当前模型的
  `reasoning.efforts.length`（2 / 3 / 4 / 5 层都行，条上的小圆点就是层刻度，
  有几层画几个点），点在任意位置切到最近的一层，`←/→`、`↑/↓` 也能调；
  填充色是浅橘 → 深橘的渐变，白点停在当前层。模型没有 `reasoning` 时整条不渲染。
- 档位名字按 id 本地化：`off` → 关、`minimal` → 最低、`low` → 低、`medium` → 中、
  `high` → 高、`xhigh` → 极高、`max` → 极限（英文界面用 Off / Low / …；
  未知 id 回退成宿主给的 `name`）。点上的 `title` 显示该档名字。
- 档位数量由提供方决定，本机实测：`deepseek-v4.1-flash` 四档（关/低/高/极限），
  `deepseek-v4-pro` 三档（关/高/极限）——后者是 pi-ai 目录把 `low` 标成 null。
- 供应商列表（右侧浮层）：DeepSeek 账号 → DeepSeek 官方 → 其它（按已有顺序），
  右侧够宽就浮在面板右边、否则翻到左边；顶格对齐触发它的那一行。
- `@liustack/modlens` 注册的那些 `<provider> (modlens vision)` 影子提供方不占主列表，
  收在浮层底部的「modlens 读图模型」小标题下，名字去掉后缀、带 `modlens` 角标。
- 选中影子提供方时，面板里列它的模型（同样去掉后缀），供应商行也带 `modlens` 角标。
- 面板与浮层都用**不透明**底色（`#ffffff`，深色主题 `html.dark` 下 `#2b2c31`），
  不依赖 `--dsw-menu-surface-fill`（那个 token 本身是 `rgba(…,0.7)`，会透出背后的按钮）。
- **关闭面板只有三个入口**：点面板外的任意位置、点输入框右下角的模型入口、`Esc`
  （先关供应商浮层、再关面板）。**选模型、调思考强度都不再自动关面板**——一次打开
  可以连续换模型、再调强度，不用反复开。
- **鼠标移到顶部的供应商行就自动弹出供应商列表**（约 110ms 的 hover 意图延迟，避免划过就闪），
  移到列表里保持打开，离开约 240ms 才收起；点一下也能固定/收起，键盘用户用 `Enter`。
  浮层本身带 170ms 的淡入 + 轻微侧滑（从左/右按弹出方向区分），供应商行的 `›` 会转 90°。
- 层级条加粗到 14px（热区 32px 高），白点 24px，宽度/位置都带 220ms 缓动，切档不再跳变；
  停在**最高档**时条上有一条流动的橘色渐变 + 外圈光圈，白点做呼吸脉冲（ZCode 那种感觉），
  `prefers-reduced-motion` 下自动关掉动画。
- 切换过程中不再给行加 `disabled`（那会让整片列表瞬间变灰、看起来「闪一下」），
  只标 `aria-disabled` 并在处理函数里挡住重复点击。

## 为什么是「顶替」而不是改 asar

槽位渲染器（`@deepseek-ai/dsh-client-ui-slots`）对 `single` 槽的规则是：
同一 `priority` 重复注册直接抛错，不同 `priority` 允许并存，**渲染 priority 最低的那个**。
内置 `dsh-client-ui-model-selection` 未传 priority（即 0），本插件以 `priority: -1`
注册同名的 `conversation.input.model`，于是顶替它——`app.asar` 一个字节都不用改，
DSH 升级也不会把改动冲掉。

## 结构

| 文件 | 作用 |
| --- | --- |
| `client.js` | 全部 UI：面板、右侧浮层、样式（`--dsw-*` 主题变量）、slot 注册 |
| `index.js` | 宿主侧空插件（成对安装需要，无行为） |
| `cordis.patch.yml` | 把插件插进 profile 的 loader 补丁 |

取数全部复用内置的 per-session `modelDirectories` 目录服务
（`directoryFor(sessionId).store` 的 snapshot + `load()` / `select()`），
本插件不自己维护模型列表，也不碰凭证。

## 安装 / 启用

1. `%USERPROFILE%\.dsh\profiles\desktop\package.json` 的 `dependencies` 加
   `"@local/model-pick-chip": "link:E:/AI/日常/model-pick-chip"`，
   `dsh.profile.bundles` 里加 `@local/model-pick-chip`。
2. 在 `<profile>\node_modules\@local\` 下建 junction 指向本目录。
3. **完全退出并重启 DeepSeek Harness**（客户端 bundle 只在启动时装载）。

## 回滚

删掉上面第 1 步的两行、重启即可——内置选择器一直还在（priority 0），
只是被压住了，删掉覆盖项就自动回来。