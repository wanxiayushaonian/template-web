# Portfolio 截图指南

## 截图前准备

### MindCard（在线可截）
直接访问 http://mindcard.online 登录后截图

### Nexus（需本地运行）
```bash
# 终端 1: 启动后端
cd /home/ljb/program/demo/OuterBrainSystem/backend
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# 终端 2: 启动前端
cd /home/ljb/program/demo/OuterBrainSystem
npm run dev

# 访问 http://localhost:5173
```

---

## 截图清单

### MindCard（7 张）

#### 1. mindcard-cover.jpg — 项目封面（最重要）
- **位置**：知识图谱页面
- **路径**：左侧导航 → Knowledge Graph
- **内容**：D3.js 力导向图全景，展示实体节点和关系连线
- **要求**：全屏截图，深色主题，节点颜色丰富
- **建议分辨率**：1920×1080 或 1440×900

#### 2. mindcard-rag.jpg — RAG 对话界面
- **位置**：工作区 AI 聊天面板
- **路径**：进入任意工作区 → 右侧 AI Chat
- **内容**：发送一个问题，展示 AI 回答（带源卡片引用 `[card title]`）
- **要求**：左侧卡片列表 + 中间编辑器 + 右侧 AI 对话，三栏布局
- **建议**：找一个有推理路径（reasoning path）的回答截图

#### 3. mindcard-graph.jpg — 知识图谱详情
- **位置**：知识图谱页面
- **路径**：Knowledge Graph → 点击某个实体节点
- **内容**：力导向图 + 右侧详情面板（实体描述、关联卡片）
- **要求**：展示实体详情和关联关系

#### 4. mindcard-fork.jpg — 对话分支
- **位置**：AI 聊天面板
- **路径**：在 AI 对话中 → 点击分支按钮 → 选择分支 Profile
- **内容**：展示对话分支树 + 分支面包屑导航
- **要求**：能看到分支结构（parent → child 节点）

#### 5. mindcard-web.jpg — Web 端三栏布局
- **位置**：工作区主页
- **路径**：进入工作区
- **内容**：左侧卡片列表 + 中间 TipTap 编辑器 + 右侧 AI 聊天
- **要求**：展示完整的三栏工作界面

#### 6. mindcard-miniapp.jpg — 小程序界面
- **工具**：微信开发者工具 → 截图
- **内容**：小程序首页或 AI 聊天页面
- **要求**：手机尺寸截图（375×812 或类似）

#### 7. mindcard-extension.jpg — 浏览器插件
- **工具**：Chrome → 打开任意网页 → 点击插件图标
- **内容**：Side Panel 展示保存的卡片
- **要求**：展示侧边栏 UI

---

### Nexus（5 张）

#### 1. nexus-cover.jpg — 项目封面（最重要）
- **位置**：无限画布 + AI 聊天
- **内容**：画布上有多张不同类型的卡片（note/distillation/socratic/debate）+ 连线 + 右侧 AI 聊天面板
- **要求**：展示画布的丰富性和卡片多样性
- **建议分辨率**：1920×1080

#### 2. nexus-agents.jpg — Agent 调用展示
- **位置**：AI 聊天面板
- **内容**：发送一个触发 Agent 的请求（如"分析我的思维结构"），展示 Agent 返回的结构化卡片
- **要求**：能看到 Agent 工具调用过程和返回的特殊卡片类型

#### 3. nexus-canvas.jpg — 无限画布系统
- **位置**：主画布
- **内容**：画布上有 5+ 张卡片，有连线关系，展示不同卡片类型
- **要求**：展示画布的拖拽、缩放、连线功能

#### 4. nexus-graph.jpg — 知识拓扑图
- **位置**：Graph View
- **路径**：点击左侧 "Graph" 按钮
- **内容**：力导向图，展示实体节点和关系
- **要求**：节点有不同颜色（按实体类型区分）

#### 5. nexus-layout.jpg — 整体布局
- **位置**：全屏
- **内容**：左侧收件箱 + 中间画布 + 右侧 AI 聊天
- **要求**：展示完整的三栏布局

---

## 截图命名规范

所有截图放入 `/home/ljb/文档/homepage/template-web/public/images/` 目录：

```
public/images/
├── mindcard-cover.jpg        # MindCard 封面
├── mindcard-rag.jpg          # RAG 对话界面
├── mindcard-graph.jpg        # 知识图谱详情
├── mindcard-fork.jpg         # 对话分支
├── mindcard-web.jpg          # Web 端三栏布局
├── mindcard-miniapp.jpg      # 小程序界面
├── mindcard-extension.jpg    # 浏览器插件
├── nexus-cover.jpg           # Nexus 封面
├── nexus-agents.jpg          # Agent 调用展示
├── nexus-canvas.jpg          # 无限画布系统
├── nexus-graph.jpg           # 知识拓扑图
└── nexus-layout.jpg          # 整体布局
```

## 截图技巧

1. **深色主题**：两个项目都支持深色主题，建议统一使用深色主题截图
2. **分辨率**：统一 1920×1080 或 1440×900
3. **内容丰富**：确保截图中有足够的数据（卡片、连线、对话）
4. **隐藏敏感信息**：API Key、用户信息等不要出现在截图中
5. **浏览器**：使用 Chrome 截图，确保字体渲染一致

## 快速截图流程

### MindCard
1. 打开 http://mindcard.online
2. 登录 → 进入工作区
3. 按上述清单逐个页面截图
4. 知识图谱页面需要先创建一些卡片让图谱有内容

### Nexus
1. 启动前后端
2. 创建一个 Space
3. 添加 5-10 张不同类型的卡片
4. 创建一些连线关系
5. 触发几个 Agent 调用
6. 按上述清单逐个截图
