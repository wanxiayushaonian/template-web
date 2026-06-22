---
title: "8 个 AI Agent 如何协作？Nexus 的 LLM Function Calling 元编排架构"
description: "解析 Nexus 的多 Agent 协作系统：蒸馏、苏格拉底、流分析、结论、关系发现、认知辩论、研究路径、知识图谱 8 个专业 Agent 如何通过 LLM Function Calling 实现自主编排。"
date: "2026-06-18"
tags: ["AI Agent", "LLM", "Function Calling", "FastAPI", "TypeScript"]
readTime: "15 分钟阅读"
---

## 引言

大多数 AI 应用的架构是"一个 LLM 处理所有任务"。但随着任务复杂度增加，单个 LLM 的提示词变得越来越长，性能和可控性都会下降。

Nexus 采用了一种不同的架构：**一个主 LLM + 多个专业 Agent**。主 LLM 负责理解用户意图，然后决定调用哪个专业 Agent 来处理具体任务。这种"元编排"模式让系统既能保持灵活性，又能保证每个任务的专业性。


## 1. 架构概览

```
用户输入
  ↓
AgentRouter.classify_intent() — 关键词匹配（中英双语）
  ↓
主聊天 LLM (Claude) — 看到 14 个工具的 function calling schema
  ├─ L2 工具（服务端立即执行）：add_card, edit_card, delete_card, ...
  ├─ L3 工具（服务端 Agent 执行）：
  │     challenge_thinking → SocraticAgent
  │     analyze_flow → FlowAnalyzerAgent
  │     synthesize_cards → ConclusionAgent
  │     discover_relations → RelationDiscovererAgent
  │     debate_mode → CognitiveDebateAgent
  │     research_path → ResearchPathAgent
  └─ 前端执行：普通画布工具等待用户审批
  ↓
SSE Stream → 前端渲染卡片/连接/Markdown
```

关键设计决策：
- **L3 Agent 在服务端执行**——它们内部再调 LLM，用户无需等待
- **最多 3 轮工具调用/消息**——防止无限循环
- **审批系统**——写入/删除操作需要用户确认（有 YOLO 模式可自动审批）


## 2. 8 个专业 Agent 详解

### 2.1 蒸馏 Agent（Distillation Agent）

**工具名**：`distill_text`
**核心功能**：从对话中提取核心洞察，生成结构化卡片

```
输入：最近 10 条对话消息 + 画布现有关键词
  ↓
LLM 提取：
  - 压缩标题（≤50 字符）
  - 3-5 个关键词
  - 推荐的已有关键词（保持一致性）
  - 推理过程
  ↓
输出：distillation 类型卡片
```

**设计亮点**：
- 扫描画布现有关键词，确保新卡片的关键词与已有卡片一致
- `original_text` 字段保留原文，便于溯源

### 2.2 苏格拉底 Agent（Socratic Agent）

**工具名**：`challenge_thinking`
**核心功能**：用苏格拉底式追问挑战用户的思维，发现逻辑漏洞

```
输入：画布所有卡片
  ↓
扫描假设指标："显然"、"清楚"、"当然"（中英双语）
分类卡片状态：pending / verified / conclusion
  ↓
LLM 生成 5 维度追问：
  1. 澄清（Clarification）
  2. 挑战假设（Challenging Assumptions）
  3. 证据（Evidence）
  4. 视角（Perspective）
  5. 后果（Consequences）
  ↓
输出：socratic 类型卡片（含 questions 数组 + identified_gaps）
```

### 2.3 流分析 Agent（Flow Analyzer Agent）

**工具名**：`analyze_flow`
**核心功能**：分析思维过程的结构，检测模式和瓶颈

```
输入：画布所有卡片 + 连接关系
  ↓
构建双向连接图
识别：孤岛卡片（0 连接）、瓶颈卡片（≥4 连接）
  ↓
分析 5 维度：
  1. 流完整性（Flow Completeness）
  2. 逻辑结构（Logical Structure）
  3. 覆盖度（Coverage）
  4. 瓶颈识别（Bottleneck Identification）
  5. 优化建议（Optimization Suggestions）
  ↓
分类结构类型：chain / tree / network / cluster / fragmented
计算完整度评分（0-1）
  ↓
输出：flow_analysis 类型卡片
```

### 2.4 结论 Agent（Conclusion Agent）

**工具名**：`synthesize_cards`
**核心功能**：综合多张卡片生成结构化结论

```
输入：用户指定的卡片 ID / #N 引用 / 所有 pending+verified 卡片
  ↓
分析目标卡片间的连接关系
  ↓
LLM 生成：
  - 标题
  - 摘要
  - 关键要点
  - 共识点
  - 分歧点
  - 优势
  - 缺口
  - 推理过程
  ↓
输出：conclusion 类型卡片（含 chain_ids 链接源卡片）
```

### 2.5 关系发现 Agent（Relation Discoverer Agent）

**工具名**：`discover_relations`
**核心功能**：发现卡片间的语义关联

```
输入：目标卡片 + 画布所有其他卡片
  ↓
5 维度关系分析：
  1. 语义关系（Semantic）
  2. 因果关系（Causal）
  3. 支持/矛盾（Support/Contradiction）
  4. 扩展关系（Extension）
  5. 类比关系（Analogy）
  ↓
过滤：置信度 ≥ 0.6，排除已存在的连接
  ↓
输出：连接建议（含 reason + label + confidence）
```

### 2.6 认知辩论 Agent（Cognitive Debate Agent）

**工具名**：`debate_mode`
**核心功能**：结构化的正反方辩论分析

```
输入：关键词匹配的相关卡片
  ↓
生成正方论证（Pro）：
  - 支持证据
  - 强度评分
  ↓
生成反方论证（Con）：
  - 反驳证据
  - 逻辑缺口
  ↓
综合评估：
  - 整体强度评分
  - 关键分歧
  - 需要验证的假设
  - 下一步建议
  ↓
输出：debate 类型卡片（含 positions + synthesis）
```

### 2.7 研究路径 Agent（Research Path Agent）

**工具名**：`research_path`
**核心功能**：从主题卡片生成结构化研究简报

```
输入：主题卡片
  ↓
BFS 构建研究图（2 跳）
识别：结论卡片、待定卡片
  ↓
分析：
  - 当前理解状态（含置信度）
  - 盲点（含重要性）
  - 研究路径步骤（含优先级和工作量）
  - 参考建议
  ↓
输出：research_path 类型卡片（含 steps + blind_spots + references）
```

### 2.8 知识图谱 Agent

**核心功能**：从画布卡片抽取实体和关系

```
输入：最多 30 张卡片
  ↓
LLM 抽取：
  - 实体（6 类）：concept / person / theory / tool / method / event
  - 关系（6 类）：is_a / part_of / causes / uses / related_to / contradicts
  - 每个实体链接到源卡片 ID
  - 关系含置信度评分（0.6-1.0）
  ↓
存储：SQLite 表 entities + entity_relations
可视化：力导向图 SVG 渲染
```


## 3. LLM Function Calling 元编排

Nexus 的核心创新在于**让 LLM 自己决定调用哪个 Agent**。

### 3.1 工具定义

主聊天 LLM 看到的工具 schema：

```json
{
  "tools": [
    {
      "name": "add_card",
      "description": "在画布上添加一张新卡片",
      "input_schema": { "type": "object", "properties": { "text": {...} } }
    },
    {
      "name": "challenge_thinking",
      "description": "苏格拉底式质疑，发现逻辑漏洞",
      "input_schema": { "type": "object", "properties": { "target_card_ids": [...] } }
    },
    {
      "name": "analyze_flow",
      "description": "分析思维结构，检测瓶颈和孤岛",
      "input_schema": { "type": "object" }
    },
    ...
  ]
}
```

### 3.2 Agent 执行流程

```python
# 伪代码
async def handle_message(user_input: str):
    # 1. 构建上下文
    context = build_canvas_context(cards, connections)
    
    # 2. 调用主 LLM（带工具定义）
    response = await llm.chat(
        messages=[{"role": "user", "content": user_input}],
        tools=ALL_TOOLS,
        context=context
    )
    
    # 3. 处理工具调用
    for tool_call in response.tool_calls:
        if tool_call.name in L2_TOOLS:
            # 立即执行
            result = await execute_l2_tool(tool_call)
        elif tool_call.name in L3_TOOLS:
            # Agent 内部再调 LLM
            agent = get_agent(tool_call.name)
            result = await agent.execute(tool_call.input, context)
        
        # 4. 将结果注入对话
        messages.append({"role": "tool", "content": result})
    
    # 5. 生成最终回答
    final_response = await llm.chat(messages=messages)
    return final_response
```

### 3.3 混合上下文管理

为了优化 token 使用，Nexus 使用混合上下文加载：

```python
def build_canvas_context(cards, viewport):
    core_cards = []
    peripheral_index = []
    
    for card in cards:
        if is_recent(card, hours=1) or card.type == "conclusion" or in_viewport(card, viewport):
            core_cards.append(card)  # 完整内容
        else:
            peripheral_index.append({"id": card.id, "title": card.title, "status": card.status})
    
    return {
        "core_cards": core_cards,           # 完整内容，供 LLM 深入分析
        "peripheral_index": peripheral_index, # 轻量索引，保持全局感知
        "connections": connections,           # 连接关系
    }
```


## 4. 无限画布系统

Nexus 的前端使用纯 TypeScript（零框架）实现了完整的无限画布。

### 4.1 13 种卡片类型

| 类型 | 图标 | 来源 | 用途 |
|------|------|------|------|
| note | 📝 | 用户 | 基础文本卡片 |
| distillation | 💎 | 蒸馏 Agent | 提炼的洞察 |
| socratic | ❓ | 苏格拉底 Agent | 追问和逻辑缺口 |
| flow_analysis | 🔄 | 流分析 Agent | 思维结构诊断 |
| choice | 🎯 | 用户 | 决策卡片 |
| vote | 🗳️ | 用户 | 投票卡片 |
| conclusion | 🎓 | 结论 Agent | 综合结论 |
| debate | ⚖️ | 辩论 Agent | 正反方分析 |
| research_path | 🗺️ | 研究路径 Agent | 研究路线图 |
| progress | 📊 | 用户 | 进度追踪 |
| checklist | ✅ | 用户 | 任务清单 |
| quote | 💬 | 用户 | 引用内容 |
| image | 🖼️ | 用户 | 粘贴的图片 |

### 4.2 连接系统

```typescript
interface Connection {
  from: number;        // 源卡片 ID
  to: number;          // 目标卡片 ID
  label: string;       // 关系标签
  fromPort?: string;   // 停靠端口（top/bottom/left-N/right-N）
  toPort?: string;
}
```

5 种默认关系标签：
- 🟢 支撑（Supports）
- 🟠 质疑（Questions）
- ⚪ 相关（Related）
- 🔵 导致（Leads to）
- 🔴 反对（Opposes）

4 套自定义标签包：通用 / 软件开发 / 学术研究 / 决策分析

### 4.3 高级功能

- **[[wikilink]]**：在卡片中引用其他卡片
- **#N 引用**：创建指向特定卡片的可点击链接
- **高亮传播**：选中卡片时高亮其邻域（可配置深度）
- **KaTeX LaTeX**：`$...$` 行内公式，`$$...$$` 块级公式
- **50 级撤销/重做**：Ctrl+Z / Ctrl+Y
- **自动保存**：防抖 1.5 秒


## 5. 知识拓扑可视化

### 5.1 力导向图

使用 SVG 渲染力导向图，实现：
- 交互式节点拖拽
- 鼠标滚轮缩放/平移
- 实体类型过滤（6 种可切换）
- 颜色编码（按实体/关系类型）
- 详情面板（实体描述 + 关联卡片）
- 点击跳转到画布卡片

### 5.2 实体和关系类型

**实体类型**：concept / person / theory / tool / method / event

**关系类型**：is_a / part_of / causes / uses / related_to / contradicts


## 6. 工程质量

### 6.1 代码架构

```
backend/
├── agents/           # 8 个 Agent（继承 BaseAgent）
├── api/              # FastAPI 路由
├── core/             # AgentRouter, ContextManager, ToolRegistry
├── llm/              # LLM 客户端 + 提示词
├── providers/        # Anthropic Provider 实现
├── graph/            # 知识图谱存储
└── db/               # SQLite 持久化

frontend/
├── core/             # Runtime, Session, State
├── features/         # Canvas, Chat, Graph, Inbox
├── shared/           # 38 个可复用组件
└── styles/           # 7 个 CSS 文件
```

### 6.2 设计模式

- **抽象基类**：Agent / Tool 都有 ABC
- **Registry 模式**：工具和 Provider 动态注册
- **Strategy 模式**：Runtime Provider 可切换
- **Factory 模式**：LLM Provider 工厂

### 6.3 安全措施

- Token 认证（`NEXUS_API_TOKEN`）
- Rate Limiting（LLM 10/min，其他 30/min）
- Prompt 注入防护（HTML 转义）
- CORS 配置


## 总结

Nexus 的核心理念是：**让 AI 成为思维的催化剂，而不是替代品**。通过 8 个专业 Agent，系统能在不同维度分析用户的思考——从微观的逻辑漏洞（苏格拉底 Agent）到宏观的思维结构（流分析 Agent），从正反方论证（认知辩论 Agent）到未来方向（研究路径 Agent）。

LLM Function Calling 元编排让这一切自动化——用户只需要思考，系统会自动选择最合适的分析工具。

技术栈：FastAPI + TypeScript + Vite + SQLite + Claude API + Docker

项目地址：https://github.com/wanxiayushaonian/OuterBrainSystem
