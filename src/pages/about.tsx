import { Geist, Geist_Mono } from "next/font/google";
import SvgIcon from "@/components/SvgIcon";
import Head from "next/head";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const techStack = [
  { name: "Python", category: "语言" },
  { name: "TypeScript", category: "语言" },
  { name: "FastAPI", category: "后端" },
  { name: "Next.js", category: "前端" },
  { name: "PostgreSQL", category: "数据库" },
  { name: "PyTorch", category: "AI" },
  { name: "Docker", category: "DevOps" },
  { name: "Git", category: "工具" },
];

const researchInterests = [
  {
    title: "RAG 系统",
    description: "检索增强生成、知识图谱、语义检索",
    icon: "search",
  },
  {
    title: "多 Agent 系统",
    description: "LLM 编排、Function Calling、自主协作",
    icon: "comment",
  },
  {
    title: "知识管理",
    description: "个人知识库、笔记系统、知识图谱可视化",
    icon: "docs",
  },
  {
    title: "人机交互",
    description: "AI 辅助思考、对话系统、认知工具",
    icon: "home",
  },
];

const timeline = [
  {
    year: "2026",
    title: "MindCard 发布",
    description: "5 级 RAG + 知识图谱的 AI 知识管理平台",
    link: "https://github.com/wanxiayushaonian/mindcard",
  },
  {
    year: "2025",
    title: "Nexus 开发",
    description: "8 个 Agent 协作的 AI 认知伴侣",
    link: "https://github.com/wanxiayushaonian/OuterBrainSystem",
  },
  {
    year: "2024",
    title: "开始 AI 研究",
    description: "深入学习 RAG、知识图谱、多 Agent 系统",
  },
];

export default function About() {
  return (
    <>
      <Head>
        <title>关于 - liujinbao&apos;s web</title>
        <meta name="description" content="关于 liujinbao 的个人介绍" />
      </Head>

      <div
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-[family-name:var(--font-geist-sans)] custom-scrollbar overflow-x-hidden`}
        style={{
          overflowY: "scroll",
          height: "100vh",
        }}
      >
        {/* 深色遮罩层 */}
        <div className="fixed inset-0 bg-black/60 z-[-1]" />

        {/* 导航按钮 */}
        <div className="fixed top-4 left-4 z-10 flex gap-2">
          <Link
            href="/"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <SvgIcon name="home" width={16} height={16} color="#fff" />
            <span className="text-sm">首页</span>
          </Link>
        </div>

        {/* 主内容 */}
        <div className="max-w-4xl mx-auto px-6 py-20">
          {/* 个人介绍 */}
          <section className="mb-16">
            <h1 className="text-4xl font-bold text-white mb-6">关于我</h1>
            <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-8 backdrop-blur-sm">
              <p className="text-gray-300 leading-relaxed mb-4">
                你好，我是 liujinbao，一名 21 岁的学生，来自杭州。
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                我热衷于探索 AI 技术的边界，特别是 RAG 系统、多 Agent 协作和知识管理领域。
                我相信 AI 不仅能回答问题，更能帮助人类思考和组织知识。
              </p>
              <p className="text-gray-300 leading-relaxed">
                目前我正在开发 MindCard 和 Nexus 两个项目，致力于让 AI 成为人类思维的催化剂。
              </p>
            </div>
          </section>

          {/* 技术栈 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">技术栈</h2>
            <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-6 backdrop-blur-sm">
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className="px-4 py-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] rounded-full text-white text-sm transition-all duration-200"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* 研究兴趣 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">研究兴趣</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {researchInterests.map((interest) => (
                <div
                  key={interest.title}
                  className="bg-[rgba(255,255,255,0.05)] rounded-lg p-6 backdrop-blur-sm hover:bg-[rgba(255,255,255,0.1)] transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <SvgIcon
                      name={interest.icon}
                      width={24}
                      height={24}
                      color="#60a5fa"
                    />
                    <h3 className="text-lg font-semibold text-white">
                      {interest.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm">{interest.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 时间线 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">经历</h2>
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-700 mt-2" />
                    )}
                  </div>
                  <div className="bg-[rgba(255,255,255,0.05)] rounded-lg p-4 backdrop-blur-sm flex-1 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400 font-mono text-sm">
                        {item.year}
                      </span>
                      <span className="text-white font-medium">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block"
                      >
                        查看项目 →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 联系方式 */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">联系方式</h2>
            <div className="bg-[rgba(255,255,255,0.05)] rounded-xl p-8 backdrop-blur-sm">
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/wanxiayushaonian"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg px-4 py-3 text-white transition-all duration-200"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://mindcard.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] rounded-lg px-4 py-3 text-white transition-all duration-200"
                >
                  <SvgIcon name="link" width={20} height={20} color="#fff" />
                  MindCard Demo
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
