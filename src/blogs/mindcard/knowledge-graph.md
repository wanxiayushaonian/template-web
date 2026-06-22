---
title: "从三元组到力导向图：知识图谱的构建与可视化实践"
description: "解析知识图谱的核心技术：实体抽取、关系建模、社区检测、力导向图可视化，以及如何让 AI 自动从文本中构建结构化知识网络。"
date: "2026-06-15"
tags: ["知识图谱", "NLP", "可视化", "D3.js", "Leiden"]
readTime: "10 分钟阅读"
---

## 引言

知识图谱（Knowledge Graph）是结构化知识的核心表示形式。它将现实世界的概念、实体及其关系组织成网络结构，让机器能够"理解"知识之间的联系。

在 AI 应用中，知识图谱扮演着双重角色：
1. **存储层**：为 RAG 系统提供结构化的知识索引
2. **可视化层**：让用户直观地看到思维的结构

这篇文章将分享我在 MindCard 和 Nexus 两个项目中构建知识图谱的实践经验。


## 1. 实体与关系建模

### 1.1 实体类型设计

不同领域的知识图谱需要不同的实体类型。我在两个项目中设计了不同的本体：

**MindCard（知识管理）**：
```python
ENTITY_TYPES = [
    "concept",    # 概念：机器学习、深度学习、RAG
    "method",     # 方法：微调、提示工程、向量检索
    "tool",       # 工具：LangChain、PostgreSQL、Docker
    "theory",     # 理论：注意力机制、反向传播
    "framework",  # 框架：PyTorch、TensorFlow
    "person",     # 人物：Hinton、LeCun
]
```

**Nexus（思维分析）**：
```python
ENTITY_TYPES = [
    "concept",   # 抽象概念
    "person",    # 相关人物
    "theory",    # 理论模型
    "tool",      # 工具技术
    "method",    # 具体方法
    "event",     # 事件背景
]
```

### 1.2 关系类型设计

关系类型决定了图谱的语义丰富度：

```python
RELATION_TYPES = [
    "is_a",          # 分类关系：RAG is_a 方法
    "part_of",       # 组成关系：向量检索 part_of RAG
    "causes",        # 因果关系：过拟合 causes 性能下降
    "uses",          # 使用关系：MindCard uses PostgreSQL
    "related_to",    # 一般关联：机器学习 related_to 深度学习
    "contradicts",   # 矛盾关系：方法A contradicts 方法B
]
```

### 1.3 数据库 Schema

```sql
-- 实体表
CREATE TABLE entities (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    source_card_ids TEXT,  -- JSON 数组，记录来源卡片
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 关系表
CREATE TABLE entity_relations (
    id INTEGER PRIMARY KEY,
    from_entity_id INTEGER REFERENCES entities(id),
    to_entity_id INTEGER REFERENCES entities(id),
    relation_type TEXT NOT NULL,
    label TEXT,           -- 自然语言标签
    confidence REAL DEFAULT 0.8,  -- 置信度 0-1
    source_card_id INTEGER,       -- 来源卡片
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_entity_name ON entities(name);
CREATE INDEX idx_relation_from ON entity_relations(from_entity_id);
CREATE INDEX idx_relation_to ON entity_relations(to_entity_id);
```


## 2. 实体抽取（NER）

### 2.1 基于 LLM 的实体抽取

传统 NER 使用预训练模型（如 spaCy、BERT-NER），但 LLM 的零样本能力让抽取更灵活：

```python
EXTRACTION_PROMPT = """从以下文本中抽取实体。每个实体包含：
- name: 实体名称
- type: 实体类型（concept/method/tool/theory/framework/person）
- description: 一句话描述

文本：
{content}

返回 JSON 数组，不要返回其他内容。"""
```

### 2.2 Gleaning：多轮抽取提高召回率

单轮抽取可能遗漏重要实体。Gleaning 通过多轮抽取显著提高召回率：

```python
async def extract_with_gleaning(content: str, rounds: int = 3) -> list[Entity]:
    all_entities = []
    seen_names = set()
    
    for i in range(rounds):
        # 第一轮：完整抽取
        if i == 0:
            prompt = EXTRATION_PROMPT.format(content=content)
        # 后续轮：避免重复
        else:
            prompt = f"""已抽取的实体：{seen_names}
请抽取更多上述列表中没有的实体。
文本：{content}"""
        
        entities = await llm.extract(prompt)
        for entity in entities:
            if entity.name not in seen_names:
                all_entities.append(entity)
                seen_names.add(entity.name)
    
    return all_entities
```

### 2.3 实体链接（去重）

抽取的实体可能有重复（"机器学习"和"ML"是同一个概念）。MindCard 使用三层去重：

```python
def deduplicate_entities(entities: list[Entity]) -> list[Entity]:
    # 第 1 层：精确匹配（小写+去空格）
    normalized = {}
    for entity in entities:
        key = entity.name.strip().lower()
        if key in normalized:
            # 合并 source_card_ids
            normalized[key].source_card_ids.extend(entity.source_card_ids)
        else:
            normalized[key] = entity
    
    # 第 2 层：嵌入相似度（阈值 0.85）
    unique_entities = list(normalized.values())
    embeddings = await bge_m3.encode([e.name for e in unique_entities])
    
    merged = set()
    for i, e1 in enumerate(unique_entities):
        if i in merged:
            continue
        for j, e2 in enumerate(unique_entities[i+1:], i+1):
            if j in merged:
                continue
            similarity = cosine_similarity(embeddings[i], embeddings[j])
            if similarity > 0.85:
                # 合并 e2 到 e1
                e1.source_card_ids.extend(e2.source_card_ids)
                merged.add(j)
    
    # 第 3 层：LLM 共指消解（阈值 0.70-0.85）
    # 对边界情况使用 LLM 判断
    ...
    
    return [e for i, e in enumerate(unique_entities) if i not in merged]
```


## 3. Leiden 社区检测

### 3.1 为什么选择 Leiden？

知识图谱中的实体往往形成社区——一组紧密连接的实体。社区检测帮助理解知识的宏观结构。

**Louvain vs Leiden**：
- Louvain：经典算法，但可能产生断开的社区
- Leiden：改进版，保证社区连通性，更快

### 3.2 实现

```python
import igraph as ig
import leidenalg

def detect_communities(graph: ig.Graph) -> list[Community]:
    # 使用 Leiden 算法检测社区
    partition = leidenalg.find_partition(
        graph, 
        leidenalg.ModularityVertexPartition,
        resolution_parameter=1.0  # 控制社区粒度
    )
    
    communities = []
    for community in partition:
        # 为每个社区生成报告
        nodes = [graph.vs[i] for i in community]
        report = generate_community_report(nodes)
        
        communities.append(Community(
            nodes=nodes,
            report=report,
            modularity=partition.q  # 模块度
        ))
    
    return communities

async def generate_community_report(nodes: list[Node]) -> str:
    """使用 LLM 生成社区摘要"""
    node_descriptions = "\n".join([
        f"- {n['name']} ({n['type']}): {n['description']}"
        for n in nodes
    ])
    
    prompt = f"""以下是一组相关实体。请用 2-3 句话总结它们的核心内容：

{node_descriptions}

用中文回答。"""
    
    return await llm.chat(prompt)
```

### 3.3 模块度（Modularity）

模块度 Q 衡量社区结构的质量：

```
Q = (实际内部边数 - 期望内部边数) / 总边数
```

- Q > 0.3 → 显著的社区结构
- Q ≈ 0 → 随机连接
- Q < 0 → 社区内连接比随机少


## 4. 力导向图可视化

### 4.1 基于 D3.js 的力导向图

力导向图是知识图谱可视化的标准方式：

```typescript
// 初始化力导向模拟
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id(d => d.id).distance(150))
  .force("charge", d3.forceManyBody().strength(-500))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide().radius(80));

// 拖拽交互
function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
```

### 4.2 颜色编码

不同实体类型使用不同颜色：

```typescript
const entityColors: Record<string, string> = {
  concept: "#2196F3",   // 蓝色
  person: "#FF9800",    // 橙色
  theory: "#9C27B0",    // 紫色
  tool: "#4CAF50",      // 绿色
  method: "#F44336",    // 红色
  event: "#795548",     // 棕色
};

// 关系箭头颜色
const relationColors: Record<string, string> = {
  is_a: "#2196F3",
  part_of: "#9C27B0",
  causes: "#F44336",
  uses: "#4CAF50",
  related_to: "#FF9800",
  contradicts: "#795548",
};
```

### 4.3 交互功能

**过滤**：按实体类型过滤显示
```typescript
const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
  new Set(Object.keys(entityColors))
);

const filteredNodes = nodes.filter(n => visibleTypes.has(n.type));
```

**详情面板**：点击实体显示详情
```typescript
function handleNodeClick(node: GraphNode) {
  setSelectedNode(node);
  setShowDetail(true);
  loadRelatedCards(node.source_card_ids);
}
```

**缩放和平移**：
```typescript
const zoom = d3.zoom()
  .scaleExtent([0.1, 4])
  .on("zoom", (event) => {
    svgGroup.attr("transform", event.transform);
  });

svg.call(zoom);
```


## 5. 实践经验

### 5.1 实体数量控制

**问题**：实体太多导致图谱混乱

**解决方案**：
- 设置最大实体数（30-50）
- 只抽取高频/高置信度的实体
- 使用 `top_k` 参数控制

```python
# 只保留置信度 > 0.7 的实体
entities = [e for e in entities if e.confidence > 0.7]

# 如果超过 50 个，按置信度排序取 Top 50
if len(entities) > 50:
    entities = sorted(entities, key=lambda e: e.confidence, reverse=True)[:50]
```

### 5.2 边密度控制

**问题**：关系太多导致图谱变成"毛线球"

**解决方案**：
- 设置最小置信度阈值
- 限制每个实体的最大关系数
- 只保留 `related_to` 以外的强关系

```python
# 只保留置信度 > 0.6 的关系
relations = [r for r in relations if r.confidence > 0.6]

# 限制每个实体最多 5 个关系
for entity in entities:
    entity.relations = sorted(
        entity.relations, 
        key=lambda r: r.confidence, 
        reverse=True
    )[:5]
```

### 5.3 性能优化

**问题**：大量节点导致 SVG 渲染卡顿

**解决方案**：
- 节点数 > 100 时使用 Canvas 而非 SVG
- 实现视口裁剪（只渲染可见区域）
- 使用 Web Worker 计算力导向布局


## 6. 两个项目的对比

| 维度 | MindCard | Nexus |
|------|----------|-------|
| 实体来源 | 知识卡片内容 | 思维画布卡片 |
| 抽取方式 | Gleaning（多轮） | 单轮 + 后处理 |
| 存储 | PostgreSQL + pgvector | SQLite |
| 可视化 | D3.js 力导向图 | SVG 力导向图 |
| 社区检测 | Leiden | 无（实时抽取） |
| 更新频率 | 卡片创建时 | 请求时动态生成 |


## 总结

知识图谱的核心价值在于**将非结构化的文本转化为结构化的知识网络**。通过 LLM 实体抽取、三层去重、Leiden 社区检测、力导向图可视化，我们让 AI 能够"看见"知识的结构。

关键经验：
1. **Gleaning** 显著提高实体召回率
2. **三层去重** 平衡精度和召回
3. **Leiden** 比 Louvain 更可靠
4. **边密度控制** 是可视化清晰度的关键

项目地址：
- MindCard：https://github.com/wanxiayushaonian/mindcard
- Nexus：https://github.com/wanxiayushaonian/OuterBrainSystem
