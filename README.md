# dsh-model-pick-chip

DSH 插件索引（市场格式 1）+ 源码。插件本体在 [`plugin/`](./plugin)。

## 装插件

1. DSH → **插件** → **发现** → **添加索引源**
2. 填**固定到提交**的地址（内容不可变，绕开 CDN 缓存）：

   ```
   https://cdn.jsdelivr.net/gh/wupeide518/dsh-model-pick-chip@01e370c6e80a8a9d2c6dc03e746a0b88e2fd027b/index.json
   ```

   也可以跟 `@main` 走最新版，但 jsdelivr 对 `@main` 有缓存，更新可能延迟数小时：

   ```
   https://cdn.jsdelivr.net/gh/wupeide518/dsh-model-pick-chip@main/index.json
   ```

   能直连 GitHub 时等价用 raw：
   `https://raw.githubusercontent.com/wupeide518/dsh-model-pick-chip/main/index.json`

3. 列表里出现 **dsh-model-pick-chip** → **安装** → 完全退出 DSH 再打开。

## 版本

| 版本 | 说明 |
| --- | --- |
| 1.2.0 | 客户端 bundle 的模块 id 改为 `dsh-model-pick-chip`（此前写成开发包名 `@local/model-pick-chip`，导致「已加载但没人认领」，槽位静默回落到内置选择器）。切换供应商时自动选中该供应商的第一个模型。 |
| 1.1.0 | `cordis.patch.yml` 的行名改为发布包名；修 `ERR_MODULE_NOT_FOUND`。 |
| 1.0.0 | 首个版本，不可用。 |

## 它做什么

把输入框右下角的模型选择器换成「供应商优先」两级结构：点顶部切换供应商，
下方列该供应商的模型，底部一条思考强度滑条。

顶替的是内置槽 `conversation.input.model`，靠 `priority: -1` 覆盖 ——
**不改 app.asar**，卸载即恢复内置选择器。

## 注意

- **包的 `name`、`cordis.patch.yml` 里的行名、`client.js` 里
  `__ModuleLoader__.load({ id })` 的 id 必须三者一致**。客户端加载器按
  `package.json` 的 `name` 建图并认领注册，id 不一致时 bundle 会「加载成功但
  没有注册」，插件看似 enabled 却不生效。
- 依赖 DSH 内部槽契约，`engines.dsh` 限制在 `>=0.2.2-rc.1 <0.3.0`。
- 索引不签名，条目内容是声明；实际装什么由包的 manifest 决定。
- 市场不支持升级，出新版本要先卸载再装。