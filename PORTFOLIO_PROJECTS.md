# Portfolio 项目描述文案

---

## 项目一：MindCard — AI 知识卡片管理平台

### 一句话描述
AI 驱动的全栈知识卡片管理平台，将卡片式笔记与 RAG 对话、自动知识发现、多端访问深度融合。

### 项目简介（200 字）
MindCard 是一个面向个人知识工作者的 AI 知识管理平台。核心理念是让每张知识卡片都能被 AI 理解和检索，通过 5 级自适应 RAG 检索系统，根据查询复杂度自动选择最优检索策略——从纯对话到混合搜索，再到图增强检索和社区报告综合。

平台构建了自进化的知识图谱：卡片创建时自动抽取三元组，通过 3 层实体去重（精确匹配→嵌入相似度→LLM 共指消解）构建干净的实体网络，再用 Leiden 算法做社区检测，LLM 自动生成社区摘要。对话不再是线性的——分支系统支持 4 种思维模式（深度探索/头脑风暴/总结/挑战），跨分支自动传递洞察，分支可合并。AI 拥有自主记忆，通过指数衰减机制保持记忆的新鲜度。

### 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    客户端层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Next.js  │  │ 微信小程序 │  │ Chrome/Firefox  │   │
│  │ Web App  │  │ (Skyline) │  │ Extension (V3)  │   │
│  └────┬─────┘  └────┬─────┘  └───────┬──────────┘   │
│       │              │                │              │
├───────┼──────────────┼────────────────┼──────────────┤
│       └──────────────┼────────────────┘              │
│                      ▼                               │
│              FastAPI Backend                         │
│  ┌─────────────────────────────────────────────┐     │
│  │  RAG Pipeline (5 级)                        │     │
│  │  ┌─────┐ ┌──────┐ ┌───────┐ ┌──────┐ ┌────┐│     │
│  │  │ CHAT│→│SEARCH│→│EXPLORE│→│CONTEXT│→│INSIGHT│   │
│  │  └─────┘ └──────┘ └───────┘ └──────┘ └────┘│     │
│  └─────────────────────────────────────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ 知识图谱引擎  │  │ 对话分支系统  │  │ 记忆系统  │  │
│  │ Triple Ext.  │  │ Fork/Merge   │  │ Decay     │  │
│  │ Entity Link  │  │ SplitGuard   │  │ Archive   │  │
│  │ Leiden       │  │ NodeRef      │  │ memory_edit│ │
│  └──────────────┘  └──────────────┘  └───────────┘  │
│  ┌─────────────────────────────────────────────┐     │
│  │  LLM Provider Layer (Factory + Registry)    │     │
│  │  DeepSeek | OpenAI | Claude | Gemini | ...  │     │
│  └─────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────┤
│              PostgreSQL + pgvector + Redis            │
└─────────────────────────────────────────────────────┘
```

### 核心技术亮点

#### 1. 5 级自适应 RAG 检索
| 级别 | 名称 | 适用场景 | 检索策略 |
|------|------|----------|----------|
| L0 | CHAT | 日常对话 | 纯 LLM，无检索 |
| L1 | SEARCH | 知识查询 | BGE-M3 向量 + PG 全文 + RRF 融合 |
| L2 | EXPLORE | 深度探索 | 实体匹配 → 1/2 跳图遍历 → 卡片评分 |
| L3 | CONTEXT | 上下文感知 | EXPLORE + 拓扑路径注入 |
| L4 | INSIGHT | 全局问题 | Map-Reduce 社区报告综合 |

- 100K token 全局预算分配器（7 个上下文桶，弹性分配）
- 600 字符分块 + 每块独立向量，细粒度检索

#### 2. 自进化知识图谱
```
卡片创建 → BGE-M3 嵌入 (dim=1024)
         → 话题自适应阈值聚类
         → 拓扑分类 (嵌入相似度)
         → LLM 三元组抽取 (gleaning 多轮)
         → 3 层实体链接:
            1. 精确匹配 (name normalization)
            2. 嵌入相似度 (threshold=0.85)
            3. LLM 共指消解 (0.70-0.85)
         → Leiden 社区检测 (python-igraph)
         → LLM 社区报告 + 评分
```

#### 3. 对话分支系统 (Graph-of-Thought)
- 4 种分支 Profile：deep_dive / explore / summarize / challenge
- 上下文压缩：none / inherit / compress（LLM 摘要，500 token 上限）
- SplitGuard 速率限制器（3 条件 DB 驱动检查）
- 跨分支洞察自动传递（NodeRef 语义边：related/contradicts/extends）
- 分支合并：LLM 综合两个分支生成新对话

#### 4. AI 自主记忆系统
- `memory_edit` 工具：LLM 实时管理持久记忆（upsert/delete）
- 指数衰减：`decayed = base * exp(-days_unused / 30)`
- 归档机制：decay < 0.1 且 age > 90 天 → 自动归档
- RAG 注入时按 importance 过滤

#### 5. 多模型架构 (Factory + Registry)
```python
# 零 SDK 依赖，全部 raw httpx + exponential backoff
PROVIDERS = {
    "deepseek": ProviderSpec(default_model="deepseek-chat", ...),
    "openai":   ProviderSpec(default_model="gpt-4o", ...),
    "claude":   ProviderSpec(default_model="claude-sonnet-4-20250514", ...),
    "gemini":   ProviderSpec(default_model="gemini-2.5-flash", ...),
    "moonshot": ProviderSpec(default_model="moonshot-v1-8k", ...),
    "custom":   ProviderSpec(default_model="...", ...),
}
```

### 项目数据

| 指标 | 数值 |
|------|------|
| 开发周期 | 30 天 |
| Git Commits | 231 |
| Python 代码行 | ~14,300 |
| TypeScript 代码行 | ~21,500 |
| 后端 Service | 20 个 |
| API Router | 19 个 |
| 数据库模型 | 17 个 |
| Alembic 迁移 | 40 次 |
| 前端组件 | 49 个 |
| 前端页面 | 21 个 |
| AI Provider | 6 个 |
| 在线地址 | mindcard.online |

---

## 项目二：Nexus — 外脑思维链路管理系统

### 一句话描述
基于 COP 模型的 AI 认知伴侣，通过 8 个专业 AI Agent 和无限画布，让思维可见、可塑、可扩展。

### 项目简介（200 字）
Nexus 是一个面向深度思考者和研究者的 AI 认知伴侣。核心理念基于 COP 模型：Capture（捕捉灵感碎片）→ Orchestrate（AI 编排分析）→ Produce（产出结构化结论）。

系统的核心创新在于 LLM Function Calling 元编排：主聊天 LLM 拥有 14 个工具，自主决定何时调用哪个专业 Agent。8 个 Agent 各司其职——蒸馏 Agent 提取核心洞察，苏格拉底 Agent 追问逻辑漏洞，流分析 Agent 诊断思维结构，结论 Agent 综合多卡片输出，关系发现 Agent 探索语义关联，认知辩论 Agent 构建正反论证，研究路径 Agent 规划探索方向，知识图谱 Agent 构建实体网络。

前端使用纯 TypeScript 零框架实现无限画布，支持 13 种卡片类型、贝塞尔曲线连接、LaTeX/Markdown 渲染、50 级撤销重做。知识拓扑通过力导向图可视化，支持交互式拖拽和实体过滤。

### 技术架构

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (Vite + TS)                │
│  ┌─────────────────────────────────────────────┐     │
│  │  Infinite Canvas Engine                      │     │
│  │  - 13 card types + specialized renderers     │     │
│  │  - Bezier connections + multi-dock ports     │     │
│  │  - LaTeX (KaTeX) + Markdown rendering        │     │
│  │  - 50-level undo/redo + auto-save            │     │
│  │  - Highlight propagation + card grouping     │     │
│  └─────────────────────────────────────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Chat Panel  │  │ Graph View   │  │  Inbox    │  │
│  │  (1259 lines)│  │ (490 lines)  │  │  + Outline│  │
│  │  SSE Stream  │  │ Force Layout │  │           │  │
│  └──────┬───────┘  └──────────────┘  └───────────┘  │
├─────────┼───────────────────────────────────────────┤
│         ▼                                           │
│              FastAPI Backend                         │
│  ┌─────────────────────────────────────────────┐     │
│  │  Agent Router (Intent Classification)        │     │
│  │  → LLM (Claude) + 14 Function Calling Tools │     │
│  │  → 3 rounds max per message                 │     │
│  └─────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────┐     │
│  │  8 Professional Agents                      │     │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │     │
│  │  │Distill   │ │Socratic  │ │Flow Anal.  │  │     │
│  │  │Extract   │ │Challenge │ │Diagnose    │  │     │
│  │  └──────────┘ └──────────┘ └────────────┘  │     │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │     │
│  │  │Conclusion│ │Relation  │ │Cognitive   │  │     │
│  │  │Synthesize│ │Discover  │ │Debate      │  │     │
│  │  └──────────┘ └──────────┘ └────────────┘  │     │
│  │  ┌──────────┐ ┌──────────┐                 │     │
│  │  │Research  │ │Knowledge │                 │     │
│  │  │Path      │ │Graph     │                 │     │
│  │  └──────────┘ └──────────┘                 │     │
│  └─────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────┐     │
│  │  Hybrid Context Manager                     │     │
│  │  Core: recent + conclusions + viewport      │     │
│  │  Peripheral: lightweight index (id/title)   │     │
│  └─────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────┤
│              SQLite (WAL Mode) + Docker               │
└─────────────────────────────────────────────────────┘
```

### 核心技术亮点

#### 1. 8 Agent 协作系统

| Agent | 工具名 | 输入 | 输出卡片类型 |
|-------|--------|------|-------------|
| 蒸馏 Agent | `distill_text` | 对话历史 + 画布关键词 | `distillation` (标题+关键词+推理) |
| 苏格拉底 Agent | `challenge_thinking` | 画布卡片 + 假设指标 | `socratic` (5 维追问 + 逻辑漏洞) |
| 流分析 Agent | `analyze_flow` | 画布连接图 | `flow_analysis` (结构类型+完整度评分) |
| 结论 Agent | `synthesize_cards` | 目标卡片 ID / `#N` 引用 | `conclusion` (摘要+共识+分歧) |
| 关系发现 Agent | `discover_relations` | 目标卡片 + 所有画布卡片 | 连接建议 (5 维度+置信度) |
| 认知辩论 Agent | `debate_mode` | 关键词匹配的相关卡片 | `debate` (正反论证+综合评估) |
| 研究路径 Agent | `research_path` | 主题卡片 (BFS 2 跳) | `research_path` (步骤+盲点+参考) |
| 知识图谱 Agent | — | 最多 30 张卡片 | 实体(6 类) + 关系(6 类) |

#### 2. LLM Function Calling 元编排
```
用户输入
  ↓
AgentRouter.classify_intent() — 关键词匹配 (中英双语)
  ↓
主聊天 LLM (Claude) — 看到 CANVAS_TOOLS + Agent 工具的 function calling schema
  ├─ L2 工具 (服务端立即执行): add_card, edit_card, delete_card, ...
  ├─ L3 工具 (服务端 Agent 执行):
  │     challenge_thinking → SocraticAgent
  │     analyze_flow → FlowAnalyzerAgent
  │     synthesize_cards → ConclusionAgent
  │     ...
  └─ 前端执行: 普通画布工具等待用户审批
  ↓
SSE Stream → 前端渲染卡片/连接/Markdown
```

#### 3. 无限画布系统
- **13 种卡片类型**：note / distillation / socratic / flow_analysis / choice / vote / conclusion / debate / research_path / progress / checklist / quote / image
- **5 种默认关系标签**：支撑 / 质疑 / 相关 / 导致 / 反对
- **4 套自定义标签包**：通用 / 软件开发 / 学术研究 / 决策分析
- **连接系统**：贝塞尔曲线 + 箭头 + 颜色编码 + 多停靠端口
- **高级功能**：`[[wikilink]]` 引用、`#N` 卡片引用、高亮传播、分组折叠、KaTeX LaTeX

#### 4. 混合上下文管理
```
Core Region (完整内容):
  - 最近 1 小时的卡片
  - 结论类卡片
  - 当前视口内的卡片

Peripheral Region (轻量索引):
  - 其他所有卡片 → 仅 id, title, status
  - 减少 LLM token 使用，同时保持全画布感知
```

#### 5. 知识拓扑可视化
- LLM 抽取实体（6 类：concept/person/theory/tool/method/event）
- LLM 抽取关系（6 类：is_a/part_of/causes/uses/related_to/contradicts）
- 力导向布局 SVG 渲染
- 交互式拖拽 + 实体类型过滤 + 详情面板
- 点击跳转到画布卡片

### 项目数据

| 指标 | 数值 |
|------|------|
| 总代码行 | ~41,134 |
| 源文件数 | 169 |
| Python 文件 | 57 |
| TypeScript 文件 | 63 |
| AI Agent 数 | 8 |
| LLM 工具数 | 14 |
| 卡片类型数 | 13 |
| 数据库表 | 4 (SQLite WAL) |
| i18n 语言 | 3 (中/英/双语) |
| 测试文件 | 6 |

---

## 使用建议

### 在作品集页面展示时

1. **封面图**：需要准备每个项目的截图
   - MindCard: RAG 流程图 / 知识图谱可视化 / 多端界面
   - Nexus: 8 Agent 架构图 / 无限画布截图 / 力导向图

2. **功能展示顺序**：
   - MindCard: 5 级 RAG → 知识图谱 → 对话分支 → 多端
   - Nexus: 8 Agent → 无限画布 → 知识拓扑 → 元编排

3. **技术深度展示**：
   - 强调"自研"部分（RAG Pipeline、Agent 系统、知识图谱）
   - 强调"工程复杂度"（多端、多 Provider、Docker 部署）
   - 强调"创新点"（对话分支、LLM 元编排、记忆衰减）

4. **在线 Demo**：
   - MindCard: mindcard.online（可直接访问）
   - Nexus: 需要 Docker 部署或提供演示视频
