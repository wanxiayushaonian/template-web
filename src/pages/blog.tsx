import { useState, useEffect, useCallback, JSX, useRef } from "react";
import Head from "next/head";
import SvgIcon from "@/components/SvgIcon";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface BlogArticle {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  readTime: string;
  filename: string;
  category: string;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

interface DirectoryTreeItem {
  id: string;
  name: string;
  isFolder: boolean;
  level: number;
  children: DirectoryTreeItem[];
}

interface BlogStats {
  totalArticles: number;
  totalDirectories: number;
  totalFiles: number;
  lastUpdated: string;
  categoryStats: { [key: string]: number };
  directoryTree: DirectoryTreeItem[];
}

const DirectoryItem = React.memo(
  ({
    item,
    level = 0,
    collapsedFolders,
    toggleFolder,
  }: {
    item: DirectoryTreeItem;
    level?: number;
    collapsedFolders: Set<string>;
    toggleFolder: (folderId: string) => void;
  }) => {
    const isCollapsed = collapsedFolders.has(item.id);

    if (item.isFolder) {
      return (
        <div>
          <div
            className="flex items-center cursor-pointer hover:bg-[rgba(255,255,255,.05)] rounded px-1 py-0.5"
            style={{ paddingLeft: `${level * 12}px` }}
            onClick={() => toggleFolder(item.id)}
          >
            <SvgIcon
              name={isCollapsed ? "right" : "down"}
              width={12}
              height={12}
              color="#9CA3AF"
              className="mr-1 flex-shrink-0"
            />
            <span className="text-yellow-400">📁</span>
            <span className="ml-1 text-gray-300">{item.name}</span>
          </div>
          {!isCollapsed && (
            <div>
              {item.children.map((child, index) => (
                <DirectoryItem
                  key={child.id || `${child.name}-${index}`}
                  item={child}
                  level={level + 1}
                  collapsedFolders={collapsedFolders}
                  toggleFolder={toggleFolder}
                />
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          className="flex items-center"
          style={{ paddingLeft: `${level * 12 + 16}px` }}
        >
          <span className="text-blue-400">📄</span>
          <span className="ml-1 text-gray-300 line-clamp-1">{item.name}</span>
        </div>
      );
    }
  }
);

DirectoryItem.displayName = "DirectoryItem";

// 将打字机动画提取为独立组件
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const typeSpeed = 150;
    const deleteSpeed = 100;
    const pauseTime = 2000;
    const restartPause = 1000;

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < text.length) {
            setDisplayText(text.slice(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
          } else {
            setTimeout(() => setIsDeleting(true), pauseTime);
          }
        } else {
          if (currentIndex > 0) {
            setDisplayText(text.slice(0, currentIndex - 1));
            setCurrentIndex(currentIndex - 1);
          } else {
            setTimeout(() => setIsDeleting(false), restartPause);
          }
        }
      },
      isDeleting ? deleteSpeed : typeSpeed
    );

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, text]);

  return (
    <span className="inline-block">
      {displayText.split(" ").map((word, wordIndex) => {
        if (word === "前端") {
          return (
            <span
              key={wordIndex}
              className="bg-gradient-to-br from-[#1b2c55] to-[#3d85a9] bg-clip-text text-transparent"
            >
              {word}
            </span>
          );
        }
        return (
          <span key={wordIndex}>
            {word}
            {wordIndex < displayText.split(" ").length - 1 ? " " : ""}
          </span>
        );
      })}
      <span className="animate-pulse text-[#3d85a9] pl-[10px] pb-[4px]">|</span>
    </span>
  );
};

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(
    null
  );
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>(
    []
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [loading, setLoading] = useState(true);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const blogContentRef = useRef<HTMLDivElement>(null);
  // 加载文章列表
  useEffect(() => {
    loadArticles();
    loadBlogStats();
  }, []);

  useEffect(() => {
    if (!selectedArticle) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollContainer = document.querySelector(
            ".custom-scrollbar"
          ) as HTMLElement;
          if (!scrollContainer) return;

          const scrollTop = scrollContainer.scrollTop;
          const containerHeight = scrollContainer.clientHeight;

          const headings = tableOfContents
            .map((item) => {
              const element = document.getElementById(item.id);
              if (element) {
                const rect = element.getBoundingClientRect();
                const containerRect = scrollContainer.getBoundingClientRect();
                // 计算相对于滚动容器的位置
                const relativeTop = rect.top - containerRect.top;
                return {
                  id: item.id,
                  top: relativeTop,
                  absoluteTop: scrollTop + relativeTop,
                  element,
                };
              }
              return null;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null); // 类型守卫

          if (headings.length === 0) return;

          // 改进的检测逻辑
          const threshold = 80; // 减小阈值
          let bestHeading = headings[0]; // 默认第一个标题

          // 找到最合适的标题
          for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];

            // 如果标题在视口顶部附近或之上
            if (heading.top <= threshold) {
              bestHeading = heading;
            } else {
              // 如果当前标题在阈值之下，停止查找
              break;
            }
          }

          // 特殊处理：如果没有标题在阈值内，选择最接近顶部的可见标题
          if (bestHeading.top > threshold) {
            const visibleHeadings = headings.filter(
              (h) => h.top >= 0 && h.top <= containerHeight
            );
            if (visibleHeadings.length > 0) {
              bestHeading = visibleHeadings[0];
            }
          }

          // 只有当找到的标题与当前不同时才更新
          if (bestHeading && bestHeading.id !== activeHeading) {
            setActiveHeading(bestHeading.id);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // 获取滚动容器
    const scrollContainer = document.querySelector(".custom-scrollbar");
    if (scrollContainer) {
      // 添加防抖延迟
      let timeoutId: NodeJS.Timeout;
      const debouncedHandleScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 30); // 减少防抖时间
      };

      scrollContainer.addEventListener("scroll", debouncedHandleScroll);
      // 初始检查
      setTimeout(handleScroll, 100); // 延迟初始检查

      return () => {
        clearTimeout(timeoutId);
        scrollContainer.removeEventListener("scroll", debouncedHandleScroll);
      };
    }
  }, [selectedArticle, tableOfContents, activeHeading]);

  // 监听滚动显示/隐藏回到顶部按钮
  useEffect(() => {
    if (selectedArticle) {
      setShowBackToTop(false);
      return;
    }

    // 等待数据加载完成和DOM渲染
    if (loading || articles.length === 0) {
      setShowBackToTop(false);
      return;
    }

    const handleScroll = () => {
      if (blogContentRef.current) {
        const scrollTop = blogContentRef.current.scrollTop;
        const shouldShow = scrollTop > 100;
        console.log("滚动位置:", scrollTop, "是否显示按钮:", shouldShow); // 调试日志
        setShowBackToTop(shouldShow);
      }
    };

    // 延迟设置监听器，确保DOM完全渲染
    const timer = setTimeout(() => {
      const scrollContainer = blogContentRef.current;
      if (scrollContainer) {
        scrollContainer.addEventListener("scroll", handleScroll);
        console.log("回到顶部监听器已添加");

        // 立即检查一次滚动位置
        handleScroll();
      } else {
        console.log("blogContentRef.current 为空");
      }
    }, 300); // 增加延迟时间

    return () => {
      clearTimeout(timer);
      const scrollContainer = blogContentRef.current;
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [selectedArticle, loading, articles.length]);

  // 回到顶部函数
  const scrollToTop = () => {
    if (blogContentRef.current) {
      blogContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // 添加折叠状态管理
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(
    new Set()
  );

  // 切换文件夹折叠状态
  const toggleFolder = useCallback((folderId: string) => {
    setCollapsedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  const loadArticles = async () => {
    try {
      const response = await fetch("/api/blogs");
      if (!response.ok) {
        throw new Error("加载文章失败");
      }
      const data = await response.json();
      setArticles(data.articles || []);
      setCategories(data.categories || ["全部"]);
      setLoading(false);
    } catch (error) {
      console.error("加载文章失败:", error);
      setArticles([]);
      setCategories(["全部"]);
      setLoading(false);
    }
  };

  const loadBlogStats = async () => {
    try {
      const response = await fetch("/api/blog-stats");
      if (response.ok) {
        const stats = await response.json();
        setBlogStats(stats);

        // 默认收缩所有文件夹
        const getAllFolderIds = (items: DirectoryTreeItem[]): string[] => {
          const folderIds: string[] = [];
          items.forEach((item) => {
            if (item.isFolder) {
              folderIds.push(item.id);
              if (item.children && item.children.length > 0) {
                folderIds.push(...getAllFolderIds(item.children));
              }
            }
          });
          return folderIds;
        };

        const allFolderIds = getAllFolderIds(stats.directoryTree || []);
        setCollapsedFolders(new Set(allFolderIds));
      }
    } catch (error) {
      console.error("加载统计信息失败:", error);
    }
  };
  // 过滤文章
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "全部" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // 生成目录
  const generateTableOfContents = (content: string) => {
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    return headings.map((heading, index) => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const title = heading.replace(/^#+\s+/, "");
      return {
        id: `heading-${index}`,
        title,
        level,
      };
    });
  };

  // 打开文章
  const openArticle = (article: BlogArticle) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedArticle(article);
      setTableOfContents(generateTableOfContents(article.content));
      setIsTransitioning(false);
    }, 300);
  };

  // 返回文章列表
  const backToList = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedArticle(null);
      setTableOfContents([]);
      setIsTransitioning(false);
    }, 300);
  };

  // 跳转到指定标题
  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [showToast, setShowToast] = React.useState(false);

  // 渲染 Markdown 内容（增强版）
  const renderMarkdown = (content: string) => {
    const lines = content.split("\n");
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent = "";
    let codeLanguage = "";
    let headingIndex = 0;
    let elementIndex = 0;
    let inList = false;
    let listItems: JSX.Element[] = [];
    let inTable = false;
    let tableRows: JSX.Element[] = [];
    let inBlockquote = false;
    let blockquoteContent = "";

    // 复制代码功能
    const copyToClipboard = (text: string) => {
      const cleanText = text.replace(/\n$/, "");
      navigator.clipboard
        .writeText(cleanText)
        .then(() => {
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 2000);
        })
        .catch((err) => {
          console.error("复制失败:", err);
        });
    };

    // 渲染内联 Markdown（加粗、行内代码、链接）
    const renderInlineMarkdown = (text: string): JSX.Element[] => {
      const parts: JSX.Element[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // 匹配行内代码
        const inlineCodeMatch = remaining.match(/^`([^`]+)`/);
        if (inlineCodeMatch) {
          parts.push(
            <code
              key={key++}
              className="bg-gray-800 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono"
            >
              {inlineCodeMatch[1]}
            </code>
          );
          remaining = remaining.slice(inlineCodeMatch[0].length);
          continue;
        }

        // 匹配加粗
        const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
        if (boldMatch) {
          parts.push(
            <strong key={key++} className="font-bold text-white">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch[0].length);
          continue;
        }

        // 匹配链接
        const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={key++}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {linkMatch[1]}
            </a>
          );
          remaining = remaining.slice(linkMatch[0].length);
          continue;
        }

        // 普通文本（找到下一个特殊字符）
        const nextSpecialIndex = remaining.search(/[`*\[]/);
        if (nextSpecialIndex === -1) {
          parts.push(<span key={key++}>{remaining}</span>);
          break;
        } else if (nextSpecialIndex === 0) {
          // 特殊字符没有匹配到模式，当作普通文本
          parts.push(<span key={key++}>{remaining[0]}</span>);
          remaining = remaining.slice(1);
        } else {
          parts.push(
            <span key={key++}>{remaining.slice(0, nextSpecialIndex)}</span>
          );
          remaining = remaining.slice(nextSpecialIndex);
        }
      }

      return parts;
    };

    // 提交列表
    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`list-${elementIndex++}`}
            className="list-disc list-inside mb-2 text-gray-300 space-y-0.5"
          >
            {listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    // 提交表格
    const flushTable = () => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${elementIndex++}`} className="overflow-x-auto mb-3">
            <table className="w-full text-gray-300 border-collapse">
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    // 提交引用块
    const flushBlockquote = () => {
      if (blockquoteContent) {
        elements.push(
          <blockquote
            key={`quote-${elementIndex++}`}
            className="border-l-4 border-gray-600 pl-3 italic text-gray-400 my-2"
          >
            {blockquoteContent.trim()}
          </blockquote>
        );
        blockquoteContent = "";
        inBlockquote = false;
      }
    };

    lines.forEach((line, index) => {
      // 代码块处理
      if (line.startsWith("```")) {
        flushList();
        flushTable();
        flushBlockquote();

        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockContent = "";
          codeLanguage = line.replace("```", "").trim() || "plaintext";
        } else {
          inCodeBlock = false;
          const currentCodeContent = codeBlockContent;
          const currentLanguage = codeLanguage;

          elements.push(
            <div
              key={`code-${index}`}
              className="bg-gray-900 rounded-lg my-4 overflow-hidden relative group"
            >
              <div className="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-400 uppercase font-mono">
                  {currentLanguage}
                </span>
                <button
                  onClick={() => copyToClipboard(currentCodeContent)}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                  title="复制代码"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  复制
                </button>
              </div>
              <SyntaxHighlighter
                language={
                  currentLanguage === "plaintext" ? "text" : currentLanguage
                }
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "16px",
                  background: "transparent",
                  fontSize: "14px",
                }}
                showLineNumbers={false}
                wrapLines={true}
              >
                {currentCodeContent}
              </SyntaxHighlighter>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        if (codeBlockContent === "") {
          codeBlockContent = line;
        } else {
          codeBlockContent += "\n" + line;
        }
        return;
      }

      // 引用块处理
      if (line.startsWith("> ")) {
        flushList();
        flushTable();
        inBlockquote = true;
        blockquoteContent += line.slice(2) + " ";
        return;
      } else if (inBlockquote) {
        flushBlockquote();
      }

      // 列表处理
      if (line.match(/^[-*] /)) {
        flushTable();
        flushBlockquote();
        inList = true;
        const content = line.replace(/^[-*] /, "");
        listItems.push(
          <li key={index}>{renderInlineMarkdown(content)}</li>
        );
        return;
      } else if (inList) {
        flushList();
      }

      // 表格处理
      if (line.includes("|") && line.trim().startsWith("|")) {
        flushList();
        flushBlockquote();

        // 跳过分隔行
        if (line.match(/^\|[\s-|]+\|$/)) {
          return;
        }

        inTable = true;
        const cells = line
          .split("|")
          .filter((cell) => cell.trim() !== "")
          .map((cell) => cell.trim());

        const isHeader = tableRows.length === 0;
        tableRows.push(
          <tr key={index} className={isHeader ? "bg-gray-800" : ""}>
            {cells.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className={`px-4 py-2 border border-gray-700 ${
                  isHeader ? "font-bold text-white" : ""
                }`}
              >
                {renderInlineMarkdown(cell)}
              </td>
            ))}
          </tr>
        );
        return;
      } else if (inTable) {
        flushTable();
      }

      // 标题处理
      if (line.startsWith("# ")) {
        const id = `heading-${headingIndex}`;
        headingIndex++;
        elements.push(
          <h1
            key={index}
            id={id}
            className="text-3xl font-bold mb-3 text-white mt-6 first:mt-0"
          >
            {renderInlineMarkdown(line.replace("# ", ""))}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        const id = `heading-${headingIndex}`;
        headingIndex++;
        elements.push(
          <h2
            key={index}
            id={id}
            className="text-2xl font-bold mb-2 text-white mt-5"
          >
            {renderInlineMarkdown(line.replace("## ", ""))}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        const id = `heading-${headingIndex}`;
        headingIndex++;
        elements.push(
          <h3
            key={index}
            id={id}
            className="text-xl font-bold mb-2 text-white mt-4"
          >
            {renderInlineMarkdown(line.replace("### ", ""))}
          </h3>
        );
      } else if (line.trim() && !line.startsWith("`")) {
        // 普通段落
        elements.push(
          <p key={index} className="mb-2 text-gray-300 leading-relaxed">
            {renderInlineMarkdown(line)}
          </p>
        );
      } else if (!line.trim()) {
        // 空行：只在段落之间添加小间距，不添加 <br>
        if (elements.length > 0) {
          const lastElement = elements[elements.length - 1];
          // 如果上一个元素是段落，添加 margin 而不是 <br>
          if (lastElement?.type === "p") {
            // 段落已有 mb-4，不需要额外间距
          } else {
            elements.push(<div key={index} className="h-2" />);
          }
        }
      }
    });

    // 处理末尾的列表、表格、引用块
    flushList();
    flushTable();
    flushBlockquote();

    return elements;
  };

  if (loading) {
    return (
      <div
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] font-[family-name:var(--font-geist-sans)] flex items-center justify-center relative z-20`}
      >
        <div className="loader">
          <div className="circle">
            <div className="dot"></div>
            <div className="outline"></div>
          </div>
          <div className="circle">
            <div className="dot"></div>
            <div className="outline"></div>
          </div>
          <div className="circle">
            <div className="dot"></div>
            <div className="outline"></div>
          </div>
          <div className="circle">
            <div className="dot"></div>
            <div className="outline"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>docs - liujinbao&apos;s web</title>
        <meta name="description" content="分享前端开发经验和技术文章" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Toast 提示 */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          代码已复制到剪贴板
        </div>
      )}

      <div
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-[family-name:var(--font-geist-sans)] custom-scrollbar overflow-x-hidden`}
        style={{
          overflowY: "scroll",
          height: "100vh",
        }}
      >
        {/* 导航按钮 */}
        <div className="fixed top-4 left-4 z-10 flex gap-2">
          <Link
            href="/works"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <SvgIcon name="left" width={16} height={16} color="#fff" />
            <span className="text-sm">作品集</span>
          </Link>
          <Link
            href="/"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <SvgIcon name="home" width={16} height={16} color="#fff" />
            <span className="text-sm">首页</span>
          </Link>
        </div>

        <div className="container mx-auto px-4 pt-20 pb-8 max-w-full overflow-x-hidden">
          {/* 文章列表视图 */}
          <div
            className={`transition-all duration-300 ${
              selectedArticle
                ? "opacity-0 pointer-events-none absolute"
                : "opacity-100"
            } ${isTransitioning ? "scale-95" : "scale-100"}`}
          >
            {/* 主要内容区域 - 左右布局 */}
            <div className="max-w-7xl mx-auto flex gap-4 h-[80vh]">
              {/* 左侧分类面板 */}
              <div className="w-64 sticky top-45 h-fit hidden sm:block">
                <div className="bg-[rgba(0,0,0,.3)] rounded-lg p-4 border border-[rgba(255,255,255,.1)]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <SvgIcon name="tag" width={20} height={20} color="#fff" />
                    文章分类
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          selectedCategory === category
                            ? "bg-[#3d85a9] text-white shadow-lg"
                            : "bg-[rgba(0,0,0,.2)] text-gray-300 hover:bg-[rgba(0,0,0,.4)] border border-[rgba(255,255,255,.05)]"
                        }`}
                      >
                        <span>{category}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedCategory === category
                              ? "bg-[rgba(255,255,255,.2)] text-white"
                              : "bg-[rgba(255,255,255,.1)] text-gray-400"
                          }`}
                        >
                          {category === "全部"
                            ? articles.length
                            : articles.filter(
                                (article) => article.category === category
                              ).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 中间文章列表 */}
              <div className="flex-1 w-full">
                {/* 搜索栏 */}
                <div className="mb-4">
                  <div className="max-w-2xl mx-auto">
                    <h1 className="text-[40px] font-bold text-[#fff] text-shadow-sm flex items-end justify-center mb-[10px]">
                      <TypewriterText text="前端 知识库" />
                    </h1>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="搜索文章标题、内容或标签..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-[rgba(0,0,0,.3)] border border-[rgba(255,255,255,.1)] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#3d85a9] transition-colors"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <SvgIcon
                          name="search"
                          width={20}
                          height={20}
                          color="#fff"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 移动端分类tabs */}
                <div className="mt-4 sm:hidden">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1 -mx-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category
                            ? "bg-[#3d85a9] text-white shadow-lg"
                            : "bg-[rgba(0,0,0,.3)] text-gray-300 hover:bg-[rgba(0,0,0,.5)] border border-[rgba(255,255,255,.1)]"
                        }`}
                      >
                        {category}
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            selectedCategory === category
                              ? "bg-[rgba(255,255,255,.2)] text-white"
                              : "bg-[rgba(255,255,255,.1)] text-gray-400"
                          }`}
                        >
                          {category === "全部"
                            ? articles.length
                            : articles.filter(
                                (article) => article.category === category
                              ).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  ref={blogContentRef}
                  className="grid gap-3 max-h-[70vh] overflow-auto custom-scrollbar blog-content relative pb-20"
                >
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => openArticle(article)}
                      className="bg-[rgba(0,0,0,.3)] rounded-lg p-4 cursor-pointer hover:bg-[rgba(0,0,0,.4)] transition-all duration-200 border border-[rgba(255,255,255,.1)] hover:border-[#3d85a9] group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h2 className="text-xl font-bold text-white group-hover:text-[#3d85a9] transition-colors">
                          {article.title}
                        </h2>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm text-gray-400">
                            {article.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-2 leading-relaxed">
                        {article.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-[rgba(61,133,169,.2)] text-[#fff] rounded text-sm">
                            {article.category}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* 回到顶部按钮 */}
                  {showBackToTop && (
                    <div className="sticky bottom-4 flex justify-end pr-4 pointer-events-none ">
                      <button
                        onClick={scrollToTop}
                        className="bg-[rgba(61,133,169,0.9)] hover:bg-[rgba(61,133,169,1)] text-white p-1 rounded-full shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-[rgba(255,255,255,0.1)] pointer-events-auto cursor-pointer"
                        aria-label="回到顶部"
                      >
                        <SvgIcon
                          name="top"
                          width={20}
                          height={20}
                          color="#fff"
                        />
                      </button>
                    </div>
                  )}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">
                      {selectedCategory === "全部"
                        ? "没有找到相关文章"
                        : `在 "${selectedCategory}" 分类中没有找到相关文章`}
                    </p>
                  </div>
                )}
              </div>

              {/* 右侧统计面板 */}
              <div className="w-80 sticky top-49 h-fit hidden lg:block">
                <div className="bg-[rgba(0,0,0,.3)] rounded-lg p-3 border border-[rgba(255,255,255,.1)]">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <SvgIcon name="count" width={20} height={20} color="#fff" />
                    博客统计
                  </h3>

                  {blogStats ? (
                    <div className="space-y-3">
                      {/* 总体统计 */}
                      <div className="bg-[rgba(0,0,0,.2)] rounded-lg p-4">
                        <h4 className="text-sm font-medium text-[#fff] mb-3 flex gap-[5px] items-center">
                          <SvgIcon
                            name="count1"
                            width={15}
                            height={15}
                            color="#fff"
                          />
                          总体统计
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">总文章数</span>
                            <span className="text-white font-medium">
                              {blogStats.totalArticles} 篇
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">总目录数</span>
                            <span className="text-white font-medium">
                              {blogStats.totalDirectories} 个
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">总文件数</span>
                            <span className="text-white font-medium">
                              {blogStats.totalFiles} 个
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 分类统计 */}
                      <div className="bg-[rgba(0,0,0,.2)] rounded-lg p-4">
                        <h4 className="text-sm font-medium text-[#fff] mb-3 flex gap-[5px] items-center">
                          <SvgIcon
                            name="count2"
                            width={15}
                            height={15}
                            color="#fff"
                          />
                          分类统计
                        </h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(blogStats.categoryStats).map(
                            ([category, count]) => (
                              <div
                                key={category}
                                className="flex justify-between items-center"
                              >
                                <span className="text-gray-300">
                                  {category}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-[rgba(255,255,255,.1)] rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-[#3d85a9] to-[#1b2c55] rounded-full transition-all duration-300"
                                      style={{
                                        width: `${
                                          (count / blogStats.totalArticles) *
                                          100
                                        }%`,
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-white font-medium w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* 目录结构 */}
                      <div className="bg-[rgba(0,0,0,.2)] rounded-lg p-4 overflow-y-auto custom-scrollbar h-[150px]">
                        <h4 className="text-sm font-medium text-[#fff] mb-3">
                          📁 目录结构
                        </h4>
                        <div className="text-xs text-gray-300 font-mono leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                          {blogStats?.directoryTree &&
                          blogStats.directoryTree.length > 0 ? (
                            <div className="space-y-1">
                              {blogStats.directoryTree.map(
                                (item: DirectoryTreeItem, index: number) => (
                                  <DirectoryItem
                                    key={item.id || `${item.name}-${index}`}
                                    item={item}
                                    collapsedFolders={collapsedFolders}
                                    toggleFolder={toggleFolder}
                                  />
                                )
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500">暂无目录结构</div>
                          )}
                        </div>
                      </div>

                      {/* 更新时间 */}
                      <div className="text-xs text-gray-400 text-center pt-2 border-t border-[rgba(255,255,255,.1)]">
                        最后更新: {blogStats.lastUpdated}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin w-6 h-6 border-2 border-[#3d85a9] border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-gray-400 text-sm">加载统计信息中...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 文章详情视图 - 响应式优化 */}
          {selectedArticle && (
            <div
              className={`transition-all bg-[rgba(0,0,0,.1)] duration-300 p-10 rounded-lg ${
                isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8">
                {/* 文章内容 */}
                <div className="flex-1 order-2 lg:order-1">
                  {/* 返回按钮 */}
                  <button
                    onClick={backToList}
                    className="mb-4 lg:mb-6 bg-[rgba(0,0,0,.3)] hover:bg-[rgba(0,0,0,.4)] rounded-lg px-3 py-2 lg:px-4 lg:py-2 text-white transition-colors flex items-center gap-2 text-sm lg:text-base"
                  >
                    <SvgIcon name="left" width={16} height={16} color="#fff" />
                    返回文章列表
                  </button>

                  {/* 文章头部 */}
                  <div className="mb-6 lg:mb-8">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 lg:mb-4 leading-tight">
                      {selectedArticle.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-gray-300 mb-3 lg:mb-4 text-sm lg:text-base">
                      <span>{selectedArticle.date}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{selectedArticle.readTime}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{selectedArticle.category}</span>
                      <span className="hidden md:inline">•</span>
                      <span className="hidden md:inline">
                        {selectedArticle.filename}
                      </span>
                    </div>
                  </div>

                  {/* 文章内容 */}
                  <div className="prose prose-invert max-w-none prose-sm lg:prose-base">
                    {renderMarkdown(selectedArticle.content)}
                  </div>
                </div>

                {/* 目录 - 响应式处理 */}
                {tableOfContents.length > 0 && (
                  <div className="w-full max-w-[300px] order-1 lg:order-2 lg:sticky lg:top-20 lg:h-fit">
                    <div className="bg-[rgba(0,0,0,.3)] rounded-lg p-3 lg:p-4 border border-[rgba(255,255,255,.1)]">
                      <h3 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">
                        目录
                      </h3>
                      <nav className="lg:block">
                        {/* 移动端折叠目录 */}
                        <div className="lg:hidden">
                          <details className="group">
                            <summary className="cursor-pointer text-sm text-gray-300 hover:text-white transition-colors list-none flex items-center justify-between">
                              <span>展开目录</span>
                              <SvgIcon
                                name="down"
                                width={16}
                                height={16}
                                color="#9CA3AF"
                                className="group-open:rotate-180 transition-transform"
                              />
                            </summary>
                            <div className="mt-2 max-h-60 overflow-y-auto custom-scrollbar overflow-x-hidden">
                              {tableOfContents.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => scrollToHeading(item.id)}
                                  className={`block w-full text-left py-2 px-2 text-sm hover:bg-[rgba(255,255,255,.1)] rounded transition-colors relative ${
                                    activeHeading === item.id
                                      ? "text-[#214362] font-semibold"
                                      : item.level === 1
                                      ? "text-white font-medium"
                                      : item.level === 2
                                      ? "text-gray-300 ml-4"
                                      : "text-gray-400 ml-8"
                                  }`}
                                >
                                  {activeHeading === item.id && (
                                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-[#214362] rounded-r"></span>
                                  )}
                                  <span
                                    className={
                                      activeHeading === item.id ? "ml-3" : ""
                                    }
                                  >
                                    {item.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </details>
                        </div>

                        {/* 桌面端展开目录 */}
                        <div className="hidden lg:block">
                          {tableOfContents.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => scrollToHeading(item.id)}
                              className={`block w-full text-left py-2 px-2 text-sm hover:bg-[rgba(255,255,255,.1)] rounded transition-colors relative ${
                                activeHeading === item.id
                                  ? "text-[#1E2939] font-semibold pl-4"
                                  : item.level === 1
                                  ? "text-white font-medium"
                                  : item.level === 2
                                  ? "text-gray-300 ml-4"
                                  : "text-gray-400 ml-8"
                              }`}
                            >
                              {activeHeading === item.id && (
                                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-[#1E2939] rounded-r"></span>
                              )}
                              <span
                                className={activeHeading === item.id ? "" : ""}
                              >
                                {item.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="fixed bottom-8 right-8 z-10">
          <Link
            href="/chat"
            className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
          >
            <span className="text-sm">聊天室</span>
            <SvgIcon name="right" width={20} height={20} color="#fff" />
          </Link>
        </div>
      </div>
    </>
  );
}
