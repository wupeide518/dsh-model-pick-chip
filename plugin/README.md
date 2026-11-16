# dsh-model-pick-chip

把 DSH 输入框右下角的模型选择器换成「供应商优先」两级结构：顶部切换供应商，
下方列该供应商的模型，底部一条思考强度滑条，并带 DSH 的「启用智能体团队协作」开关。

- 顶替内置槽 `conversation.input.model`（`priority: -1`），不改 app.asar，卸载即恢复。
- 复用宿主的 `agentTeam` 投影与 `remote.agentTeams.setEnabled`：开关状态与内置菜单一致；停用前像原版一样先弹确认。
- 依赖 DSH 内部槽契约，`engines.dsh` 为 `>=0.2.2-rc.1 <0.3.0`。
- 装完必须完全退出 DSH 再打开，客户端 bundle 才会重新加载。
- 安装方式：在 DSH「插件 → 发现」里添加索引源
  `https://cdn.jsdelivr.net/gh/wupeide518/dsh-model-pick-chip@main/index.json`，或直接安装本包。
