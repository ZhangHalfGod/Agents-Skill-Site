# UI 文生图（火山方舟 ARK）

> DeepSeek 负责 `ui` 对话与规范；**出图走本脚本 + ARK 接入点**，Key 不进 Git。

## 1. 配置（本机）

在 `~/.openclaw/.env`（或本目录 `.env`，已在仓库根 `.gitignore`）写入：

```bash
ARK_API_KEY=你的方舟Key
ARK_IMAGE_MODEL=ep-xxxxxxxx          # 控制台接入点 ID（如图片生成 ep-...）
# ARK_IMAGE_BASE_URL=https://ark.cn-beijing.volces.com/api/v3/images/generations
```

模型示例：Doubao-Seedream-4.0 对应控制台「图片生成」接入点。

**禁止**把 Key 写进消息稿、SOUL、Markdown、截图。

## 2. 调用

```powershell
# 单次
node D:\trae_git\Agents-Skill-Site\Code\orchestration\openclaw\ui-image\generate-ui-image.cjs `
  --scene DebugConsole `
  --prompt "深色调试控制台：顶栏 Mock 徽章、左侧 API 列表、右侧手势骨架画布、底部 JSON 卡片，16px 圆角，高对比。" `
  --out-dir D:\trae_git\AI_Virtual_Glasses\doc\assets\ui-gen

# 或读 H2b 落盘的请求 JSON
node ...\generate-ui-image.cjs --request-json <run-dir>\ui-image-request.json --out-dir <业务仓>\doc\assets\ui-gen
```

成功 stdout 含 `image_path` / `image_key`；元数据追加到 `metadata.jsonl`。

## 3. 流水线挂接

1. **H2b `ui`（DeepSeek）**：写 UI 规范 + `ui-image-request.json`（仅视觉描述，无密钥）  
2. **编排者 main**：跑本脚本 → 把 `image_path` 写回规范「§0 出图参考」  
3. **H3 Cursor**：Goal 带规范路径 + 图片路径，做前端还原  

`ui` agent **不必**自己持 Key；由 main 调白名单脚本即可。

## 4. 安全

- Key 泄露（含粘贴到聊天）→ 立刻在火山控制台**轮换**  
- prompt 含疑似 secret 时脚本会拒绝  
