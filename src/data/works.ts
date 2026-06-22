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
      "AI 驱动的全栈知识卡片管理平台。将卡片式笔记与 RAG 对话、自动知识发现、多端访问深度融合，核心创新在于 5 级自适应 RAG 检索、自进化知识图谱和对话分支系统，让 AI 真正成为个人知识的外脑。",
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
      "5 级自适应 RAG 检索",
      "自进化知识图谱 (Leiden 社区检测)",
      "对话分支系统 (Graph-of-Thought)",
      "AI 自主记忆 + 指数衰减",
      "多模型架构 (6 Provider)",
      "微信小程序 + 浏览器插件",
      "知识拓扑可视化 (D3.js)",
      "100K Token 全局预算分配",
    ],
    desc: "30 天开发完成，231 次提交，已上线部署。后端 14,300 行 Python（20 个 Service），前端 21,500 行 TypeScript（49 组件，21 页面），数据库 17 个模型，40 次 Alembic 迁移。支持 DeepSeek / OpenAI / Claude / Gemini / Moonshot 等 6 个 AI Provider，全部使用 raw httpx 零 SDK 依赖。",
    function: [
      {
        name: "5 级 RAG 检索系统",
        img1: "/images/mindcard-rag.png",
      },
      {
        name: "知识图谱 + Leiden 社区检测",
        img1: "/images/mindcard-graph.png",
      },
      {
        name: "对话分支 (Graph-of-Thought)",
        img1: "/images/mindcard-fork.png",
      },
      {
        name: "多端统一 (Web / 小程序 / 插件)",
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
  {
    title: "liujinbao's web",
    description:
      "基于Next.js开发的个人介绍网站，简单介绍了我自己个儿，歌和视频都很有品！！！！。",
    image: "/images/work1.jpg",
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    link: "#",
    features: ["个人介绍", "作品集", "喜好", "留言"],
  },
];
