# dsh-model-pick-chip

DSH 插件索引（市场格式 1）+ 源码。插件本体在 [`plugin/`](./plugin)。

## 装插件

1. DSH → **插件** → **发现** → **添加索引源**
2. 填：

   ```
   https://cdn.jsdelivr.net/gh/wupeide518/dsh-model-pick-chip@main/index.json
   ```

   （GitHub 直连不通时用这个 CDN 地址；能直连 GitHub 也可以填
   `https://raw.githubusercontent.com/wupeide518/dsh-model-pick-chip/main/index.json`）
3. 列表里出现 **dsh-model-pick-chip** → **安装** → 完全退出 DSH 再打开。

## 它做什么

把输入框右下角的模型选择器换成「供应商优先」两级结构：点顶部切换供应商，
下方列该供应商的模型，底部一条思考强度滑条。

顶替的是内置槽 `conversation.input.model`，靠 `priority: -1` 覆盖 ——
**不改 app.asar**，卸载即恢复内置选择器。

## 注意

- 依赖 DSH 内部槽契约，`engines.dsh` 限制在 `>=0.2.2-rc.1 <0.3.0`。
- 索引不签名，条目内容是声明；实际装什么由包的 manifest 决定。
- 市场不支持升级，出新版本要先卸载再装。
