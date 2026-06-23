// 作品数据类型定义
export interface WorkItem {
  title: string;
  description: string;
  image: string;
  tech: string[];
  link: string;
  features: string[];
  desc?: string;
  download_url?: string;
  function?: {
    name: string;
    description?: string;
    img1: string;
    img2?: string;
    img3?: string;
  }[];
}

// 作品数据
export const worksData: WorkItem[] = [
  {
    title: "MindCard",
    description:
      "AI 驱动的全栈知识卡片管理平台。将卡片式笔记与 RAG 对话、自动知识发现、多端访问深度融合。核心创新在于 5 级自适应 RAG 检索、自进化知识图谱、对话分支系统，以及跨对话共享记忆——让 AI 真正成为个人知识的外脑，永不遗忘。",
    image: "/images/mindcard-cover.png",
    tech: [
      "Next.js 14",
      "FastAPI",
      "PostgreSQL + pgvector",
      "BGE-M3",
      "D3.js",
      "WeChat Mini-Program",
      "Chrome Extension",
      "Docker",
    ],
    link: "https://github.com/wanxiayushaonian/mindcard",
    features: [
      "5 级自适应 RAG 检索 ",
      "自进化知识图谱 (LLM 三元组抽取 + Leiden 社区检测)",
      "对话分支系统 (4 种模式 + 分支合并)",
      "跨对话共享记忆 (断言提取 + 指数衰减)",
      "跨分支链接 (相关/矛盾/扩展关系网络)",
      "联网搜索 (DuckDuckGo/SearXNG/Brave)",
      "知识洞察 (主题/趋势/未探索领域分析)",
      "100K Token 全局预算分配器",
      "多模型架构 (6 Provider 零 SDK 依赖)",
      "跨平台统一 (Web + 小程序 + 浏览器插件)",
    ],
    desc: "30 天从零到上线，231 次提交，后端 14,300 行 Python（20 个 Service，14 个 API 模块），前端 21,500 行 TypeScript（49 组件，21 页面），数据库 17 个模型、40 次 Alembic 迁移。架构上，所有 LLM 调用通过 Provider Registry 统一管理（工厂 + 注册表模式），6 个提供商（DeepSeek / OpenAI / Claude / Gemini / Moonshot / 自定义）全部使用 raw httpx 调用，零 SDK 依赖。搜索采用 RRF（Reciprocal Rank Fusion）融合 BGE-M3 向量检索和 PostgreSQL 全文检索，兼顾语义理解和关键词精确匹配。卡片创建触发异步任务链：嵌入生成 → 话题分配 → 拓扑分类 → 知识图谱三元组抽取，全程不阻塞用户操作。数据库使用 PostgreSQL 15 + pgvector 扩展，支持中文分词（zhparser），采用游标分页（keyset pagination）保证大数据量下的查询性能。前端使用 Next.js 14 App Router + Zustand 状态管理 + SWR 数据获取，AI 对话通过 SSE 流式传输实现打字机效果。",
    function: [
      {
        name: "自进化知识图谱：让知识自动连接",
        description:
          "你记录了 30 张关于 AI 的卡片，但从来没注意到「Transformer」和「BERT」之间有什么关系。\n\nMindCard 的做法是：每张卡片保存时，LLM 自动抽取实体和关系三元组——比如「Transformer —是基础→ BERT」「注意力机制 —是核心组件→ Transformer」。这些三元组经过 3 层去重（精确匹配 → 模糊匹-配 → 嵌入相似度）后写入 PostgreSQL，构建出一张干净的知识网络。Leiden 社区检测算法自动发现知识簇——比如「深度学习基础」「NLP 模型」「优化方法」——生成一棵可交互的 D3.js 力导向图。你可以缩放、拖拽、点击任意实体节点，右侧面板立刻展示关联卡片列表和关系路径。\n\n和 Obsidian 的手动双向链接不同，MindCard 的知识图谱是完全自动的——你只管写卡片，关联由 AI 发现。和 Notion 的数据库视图不同，MindCard 的图谱支持多跳关系查询和社区聚类，真正让你看到知识的全貌。",
        img1: "/images/mindcard-cover.png",
        img2: "/images/mindcard-graph.png",
        img3: "/images/mindcard-fork.png",
      },
      {
        name: "5 级自适应 RAG：AI 真正理解你的知识",
        description:
          "你问「注意力机制是什么？」——AI 回答了，但你不知道它参考了哪些笔记，回答是否准确。\n\nMindCard 的 RAG 系统分 5 个级别，根据查询复杂度自动选择最优策略：\n\n• CHAT（闲聊级）：直接对话，不检索卡片——适合「今天天气怎么样」\n• SEARCH（检索级）：混合向量搜索 + 全文搜索——BGE-M3 嵌入模型生成 1024 维向量，PostgreSQL FTS 处理关键词，RRF 算法融合两种排序结果\n• EXPLORE（图谱级）：在检索基础上引入知识图谱的实体关联——当你问「Transformer 和 BERT 的关系」时，系统会沿着图谱路径找到关联卡片\n• CONTEXT（全景级）：注入拓扑路径和社区上下文——适合「帮我梳理一下深度学习的知识体系」\n• INSIGHT（总览级）：激活跨分支洞察——综合所有对话分支的知识，适合「我在这个领域还缺什么」\n\n每次 AI 回答末尾标注源卡片（如 [注意力机制笔记]），点击即可跳转原文。你还可以手动指定引用哪些卡片（@mention），或者开启联网搜索补充最新信息。\n\n和 ChatGPT 的 RAG 不同，MindCard 的 5 级系统是自适应的——简单问题不浪费检索资源，复杂问题自动激活深度检索。和 Perplexity 不同，MindCard 检索的是你自己的知识库，不是互联网。",
        img1: "/images/mindcard-rag.png",
        img2: "/images/mindcard-web.png",
      },
      {
        name: "对话分支与合并：思维的树状展开与汇聚",
        description:
          "你在讨论「深度学习优化方法」，突然想深入研究「Adam 和 SGD 的区别」——但你不想打断当前的讨论。\n\n点击对话中的「分叉」按钮，选择 4 种思维模式之一：\n\n• 深入探讨：聚焦细节，系统会用更详细的提示词引导 AI 深挖\n• 发散探索：横向联想，系统会鼓励 AI 联系相关但不同的领域\n• 总结提炼：归纳要点，系统会要求 AI 提取核心观点和关键结论\n• 质疑挑战：反向思考，系统会让 AI 提出反对意见和替代方案\n\n系统创建一个子对话，主线保持不变。你可以在子对话中自由探索，面包屑导航（主线 > 卡片笔记法介绍 > 自注意力机制）让你随时看清思维的树状结构。\n\n更强大的是「合并分支」功能：探索完两条平行思路后，选择它们，AI 自动综合两条线的核心观点，生成一个新的合并对话。你可以选择把合并产物挂在源分支还是目标分支下，系统会预览合并后的深度和层级关系，甚至会检测祖先-后代关系并给出警告。\n\n和 ChatGPT 的分支对话不同，MindCard 的分支是有结构的——每个分支对应一个拓扑节点，支持跨分支链接（相关/矛盾/扩展关系）。和线性笔记工具不同，MindCard 的对话是树状的，思维可以展开也可以汇聚。",
        img1: "/images/mindcard-fork.png",
        img2: "/images/mindcard-rag.png",
      },
      {
        name: "跨对话共享记忆：AI 永不遗忘",
        description:
          "你和 ChatGPT 聊了一小时关于「注意力机制」，第二天再问它，它完全不记得你昨天说过什么。每次都要重复背景，效率极低。\n\nMindCard 的共享记忆系统彻底解决了这个问题。它有三层机制：\n\n第一层——工作区记忆：你手动创建的知识条目（事实、偏好、洞察），所有对话共享，AI 每次回答都会参考。\n\n第二层——分支断言提取：每次创建分支时，系统异步从父对话中抽取 3-7 条关键知识断言（如「注意力机制的核心是计算 Query 和 Key 的相似度」「多头注意力通过并行多个注意力头捕获不同子空间的信息」），存入子对话的共享记忆。子对话的 AI 回答会自动注入这些断言——不用重复解释背景，AI 跨对话记住你的知识。\n\n第三层——记忆衰减与归档：记忆有指数衰减机制（30 天半衰期），根据最后访问时间动态计算有效重要性。90 天未访问且衰减后重要性低于 0.1 的记忆自动归档，不再注入对话——保持知识库新鲜，避免过时信息干扰 AI 回答。\n\n全局 Token 预算分配器（100K tokens）确保长对话不会静默溢出模型上下文窗口：7 个源桶（指令 / 当前对话 / 检索卡片 / 图路径 / 记忆 / 分支洞察 / 拓扑）按比例分配，超限按相关性裁剪，余量回填给弹性桶。\n\n这是 MindCard 最核心的差异化——不是简单的「记忆存储」，而是一套完整的知识生命周期管理系统。",
        img1: "/images/mindcard-web.png",
      },
      {
        name: "联网搜索 + 知识洞察 + 上下文调试",
        description:
          "你的卡片库是你的私有知识，但有时候你需要补充最新信息。\n\n开启「联网搜索」后，AI 对话时同时检索你的卡片库和互联网。系统支持 3 个搜索引擎：DuckDuckGo（无需 API Key，开箱即用）、SearXNG（自托管元搜索引擎）、Brave Search（API Key 驱动）。搜索结果以折叠面板展示，点击链接跳转原文。AI 回答融合了卡片库知识和网络信息——你的笔记是基础，网络是补充。\n\n「知识洞察」功能从更高的视角审视你的知识体系：AI 分析你的所有卡片和对话，识别核心主题（你最关注什么）、趋势变化（你的兴趣如何演变）、未探索领域（你还没覆盖什么），并给出具体建议。\n\n「上下文调试面板」让你看到 AI 每次回答的「思考过程」：使用了哪些卡片、每个检索源的 token 预算分配、推理路径（实体关系链）、源引用列表。这不是给普通用户的功能——它是 RAG 系统的「X 光片」，让你验证 AI 是否真的理解了你的知识。",
        img1: "/images/mindcard-rag.png",
      },
      {
        name: "跨平台统一 + 协作空间",
        description:
          "灵感不挑时间和地点——地铁上、咖啡厅、睡前，你都可能想到一个好点子。\n\n微信小程序：手机上随时创建卡片，AI 自动生成关键词标签和摘要。支持离线创建，联网后自动同步到 Web 端。小程序界面针对移动端优化，单手即可完成所有操作。\n\nWeb 应用：三栏工作台是深度整理的核心。左侧卡片列表支持筛选、排序、批量操作；中间 Markdown 编辑器支持实时预览、Wiki 链接（[[卡片名]]）、选中文本一键「沉淀」为新卡片；右侧 AI 对话面板支持 RAG 检索、分支探索、联网搜索。Cmd+K 全局搜索随时可用。\n\n浏览器插件：Chrome/Firefox 扩展，一键保存当前网页内容为卡片，自动提取标题、正文和关键信息。\n\n多人协作空间：四级角色系统（创建者 > 管理员 > 编辑者 > 查看者），通过邀请码加入。编辑者可以创建和编辑自己的卡片，管理员可以管理所有卡片和成员。空间内有活动日志（谁在什么时候做了什么）和通知系统。API Key 管理功能为浏览器插件等外部工具提供认证。\n\n所有平台共享同一 PostgreSQL 数据库，实时同步，无缝切换。",
        img1: "/images/mindcard-web.png",
        img2: "/images/mindcard-miniapp.png",
        img3: "/images/mindcard-extension.png",
      },
    ],
  },
  {
    title: "Nexus",
    description:
      "基于 COP 模型（Capture → Orchestrate → Produce）的 AI 认知伴侣。将碎片化灵感捕捉到无限画布，通过 8 个专业 AI Agent 进行分析、质疑、综合和关系发现，让思维可见、可塑、可扩展。核心创新在于 LLM Function Calling 元编排——主聊天 LLM 自主决定调用哪个专业 Agent。",
    image: "/images/nexus-cover.png",
    tech: [
      "FastAPI",
      "TypeScript",
      "Vite",
      "SQLite (WAL)",
      "Claude API",
      "Hydra + OmegaConf",
      "Docker",
      "KaTeX",
    ],
    link: "https://github.com/wanxiayushaonian/OuterBrainSystem",
    features: [
      "8 个专业 AI Agent 协作系统",
      "LLM Function Calling 元编排",
      "无限画布 + 13 种卡片类型",
      "知识拓扑力导向可视化",
      "混合上下文管理 (Core/Peripheral)",
      "多空间 + Git-like 版本管理",
      "中英双语 i18n",
      "Docker 单容器部署",
    ],
    desc: "~41,000 行代码，169 个源文件。后端 Python 实现 8 个专业 Agent（蒸馏、苏格拉底、流分析、结论、关系发现、认知辩论、研究路径、知识图谱），前端纯 TypeScript 零框架实现无限画布系统。主聊天 LLM 拥有 14 个工具，自主决定 Agent 调用顺序，最多 3 轮工具调用/消息。",
    function: [
      {
        name: "8 Agent 协作架构",
        img1: "/images/nexus-agents.png",
      },
      {
        name: "无限画布 + 卡片系统",
        img1: "/images/nexus-canvas.png",
      },
    ],
  },
];
