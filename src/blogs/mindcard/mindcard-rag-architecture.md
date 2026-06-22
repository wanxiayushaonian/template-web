---
title: "从 5 级 RAG 到知识图谱：MindCard 的 AI 知识管理架构"
description: "深入解析 MindCard 平台的核心技术：5 级自适应 RAG 检索、自进化知识图谱、对话分支系统，以及如何让 AI 真正理解你的知识库。"
date: "2026-06-20"
tags: ["RAG", "知识图谱", "AI", "FastAPI", "PostgreSQL"]
readTime: "12 分钟阅读"
---

## 引言

大多数 AI 知识管理工具还停留在"问答+引用"的阶段——用户提问，AI 从文档中检索相关内容，生成回答。但这种模式有一个根本问题：**AI 不理解知识之间的关系**。

MindCard 的设计目标是让 AI 不仅能检索知识，还能**理解知识的结构、发现知识的关联、维护知识的演化**。这篇文章将深入解析 MindCard 的核心技术架构。


## 1. 5 级自适应 RAG 检索

传统的 RAG 系统通常只有单一的检索策略：向量相似度搜索。但不同的查询需要不同的检索深度——问"今天天气怎么样"不需要遍历知识图谱，而问"我的研究方向有哪些潜在的跨学科联系"则需要全局分析。

MindCard 实现了 5 级自适应检索：

```
L0 CHAT    → 纯 LLM 对话，无检索（日常闲聊）
L1 SEARCH  → BGE-M3 向量 + PostgreSQL 全文 + RRF 融合（知识查询）
L2 EXPLORE → 图增强检索：实体匹配 → 1/2 跳遍历 → 卡片评分（深度探索）
L3 CONTEXT → EXPLORE + 拓扑路径上下文注入（上下文感知）
L4 INSIGHT → Map-Reduce 社区报告综合（全局问题）
```

### 1.1 混合检索：向量 + 全文 + RRF 融合

L1 级别的检索不是简单的向量搜索，而是三路召回：

```python
# 伪代码
vector_results = bge_m3_embedding.search(query, top_k=20)  # 语义相似
text_results = postgresql_fts.search(query, top_k=20)       # 关键词匹配
final_results = reciprocal_rank_fusion(vector_results, text_results, k=60)
```

**为什么需要 RRF（Reciprocal Rank Fusion）？**

向量搜索擅长语义匹配（"机器学习"能找到"ML"），但可能漏掉精确关键词。全文搜索擅长精确匹配，但不理解同义词。RRF 融合两者的排名，`k=60` 是经验最优值。

### 1.2 图增强检索：从实体到图遍历

L2 级别的检索引入了知识图谱：

```
用户查询 → 实体提取 → 图中匹配实体 → 1/2 跳邻域遍历
    → 遍历路径上的卡片评分 → 返回 Top-K 卡片 + 推理路径
```

关键创新：**推理路径展示**。AI 回答时不仅给出答案，还展示它是如何通过图谱找到答案的——这对于学术研究和知识探索至关重要。

### 1.3 Token 预算分配器

RAG 系统的一个常见问题是上下文窗口溢出。MindCard 实现了 100K token 的全局预算分配器：

```
query_instructions  → 10%（硬保留，永不截断）
current_dialog      → 30%（当前对话历史）
retrieved_cards     → 25%（弹性桶，吸收剩余预算）
graph_paths         → 15%（图遍历路径）
memory              → 10%（工作区记忆）
branch_insights     → 5%（跨分支洞察）
topology            → 5%（拓扑路径）
```

`retrieved_cards` 是弹性桶——如果其他桶没用完，剩余预算会自动分配给检索到的卡片，最大化信息密度。


## 2. 自进化知识图谱

MindCard 的知识图谱不是手动构建的，而是**自动从卡片内容中抽取、链接、聚类**。

### 2.1 三元组抽取（带 Gleaning）

卡片创建时，LLM 自动抽取实体和关系：

```python
# 伪代码
entities = llm.extract_entities(card.content)  # 第一轮抽取
# Gleaning：多轮抽取，提高召回率
for _ in range(gleaning_rounds):
    new_entities = llm.extract_entities(card.content, existing=entities)
    entities.extend(new_entities)
relations = llm.extract_relations(entities, card.content)
```

**Gleaning** 是关键：单轮抽取可能遗漏重要实体，多轮抽取显著提高召回率。

### 2.2 三层实体链接

抽取的实体可能有重复（"机器学习"和"ML"是同一个概念）。MindCard 使用三层去重：

```
第 1 层：精确匹配（name normalization，小写+去空格）
    ↓ 未匹配
第 2 层：嵌入相似度（BGE-M3，阈值 0.85）
    ↓ 未匹配
第 3 层：LLM 共指消解（阈值 0.70-0.85）
```

### 2.3 Leiden 社区检测

使用 `python-igraph + leidenalg` 对知识图谱进行社区检测：

```python
import igraph as ig
import leidenalg

# 构建图
g = ig.Graph.DataFrame(edges, directed=False)
# Leiden 算法检测社区
partition = leidenalg.find_partition(g, leidenalg.ModularityVertexPartition)
# 为每个社区生成 LLM 报告
for community in partition:
    report = llm.generate_community_report(community)
```

Leiden 算法比 Louvain 更快且保证连通性，适合大规模知识图谱。


## 3. 对话分支系统（Graph-of-Thought）

传统 AI 对话是线性的——一个问题接一个回答。但深度思考往往是**分支式的**：一个想法可能引发多个方向的探索。

### 3.1 分支 Profile

MindCard 支持 4 种分支模式：

| Profile | 策略 | 适用场景 |
|---------|------|----------|
| deep_dive | 压缩父上下文 | 深入研究某个子问题 |
| explore | 压缩父上下文 | 发散性头脑风暴 |
| summarize | 继承父上下文 | 回顾和总结 |
| challenge | 压缩父上下文 | 质疑和批判性分析 |

### 3.2 SplitGuard 速率限制

自动分支可能导致无限分裂。SplitGuard 通过 3 个条件限制分支速率：

```python
def can_fork(chat):
    # 条件 1：分支内消息数 >= 最小阈值
    if chat.message_count < MIN_MESSAGES:
        return False
    # 条件 2：同级分支数 < 最大限制
    if sibling_count(chat) >= MAX_SIBLINGS:
        return False
    # 条件 3：全局冷却时间
    if time_since_last_fork() < COOLDOWN:
        return False
    return True
```

### 3.3 跨分支洞察传递

分支之间不是孤立的。MindCard 实现了自动的跨分支洞察传递：

```
分支 A 产生新洞察
    → NodeRef 语义边（related/contradicts/extends）
    → 自动注入到兄弟分支的上下文
    → 兄弟分支的 AI 回答能感知到其他分支的发现
```


## 4. AI 自主记忆系统

MindCard 的记忆系统不是简单的键值存储，而是让 **LLM 自主管理**持久记忆。

### 4.1 memory_edit 工具

LLM 在对话过程中可以调用 `memory_edit` 工具：

```json
{
  "tool": "memory_edit",
  "action": "upsert",
  "slug": "research-focus",
  "title": "研究方向",
  "body": "用户主要研究 HDR 图像重建，特别是 Flow Matching 方法",
  "memory_type": "fact",
  "importance": 0.8
}
```

### 4.2 指数衰减机制

记忆不是永久有效的。MindCard 使用指数衰减：

```
decayed_importance = base_importance × exp(-days_unused / 30)
```

- 半衰期 30 天：如果 30 天没被访问，重要性减半
- 归档阈值：`decayed < 0.1` 且 `age > 90 天` → 自动归档
- 归档的记忆不参与 RAG 注入，但可手动恢复


## 5. 多模型架构（Factory + Registry）

MindCard 支持 6 个 AI Provider，使用 Factory + Registry 模式：

```python
# 注册表
PROVIDERS = {
    "deepseek": ProviderSpec(default_model="deepseek-chat", ...),
    "openai":   ProviderSpec(default_model="gpt-4o", ...),
    "claude":   ProviderSpec(default_model="claude-sonnet-4-20250514", ...),
    ...
}

# 工厂
def make_provider(name: str) -> LLMProvider:
    spec = PROVIDERS[name]
    return spec.cls(spec)  # 返回具体实现

# 所有 Provider 使用 raw httpx，零 SDK 依赖
class OpenAICompatProvider(LLMProvider):
    async def chat_stream(self, messages, model, ...):
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", url, json=payload) as resp:
                async for line in resp.aiter_lines():
                    yield parse_sse(line)
```

**为什么用 raw httpx 而不是 SDK？**

1. 减少依赖，降低冲突风险
2. 更好的错误控制和重试逻辑
3. 所有 Provider 统一接口，SDK 差异被屏蔽


## 总结

MindCard 的核心理念是：**知识管理不只是存储，而是理解**。通过 5 级 RAG 让 AI 根据查询复杂度自适应检索深度，通过知识图谱让 AI 理解知识间的关联，通过对话分支让深度思考成为可能，通过自主记忆让 AI 真正"记住"你的知识。

技术栈：FastAPI + PostgreSQL + pgvector + BGE-M3 + D3.js + Next.js

项目地址：https://github.com/wanxiayushaonian/mindcard
在线体验：http://mindcard.online
