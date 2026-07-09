import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useTheme } from "@/contexts/ThemeContext";
import SvgIcon from "@/components/SvgIcon";
import GitHubHeatmap from "@/components/GitHubHeatmap";
import ImageModal from "@/components/ImageModal";
import MusicModal from "@/components/MusicModal";
import VideoModal from "@/components/VideoModal";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  tagConfigs,
  ImageModalConfig,
  MusicModalConfig,
  VideoModalConfig,
} from "@/data/tagConfigs";
import { experienceData } from "@/data/experience";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { theme } = useTheme();
  // 弹窗状态
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    title: "",
    images: [] as string[],
    danmakuText: "",
    enableDanmaku: true,
    imageWidth: 500,
    imageHeight: 500,
  });
  const [musicModal, setMusicModal] = useState({
    isOpen: false,
    title: "",
    musicUrl: "",
    cover: "",
    author: "",
    danmakuText: "",
    enableDanmaku: true,
  });
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    videoUrl: "",
    danmakuText: "",
    enableDanmaku: true,
  });

  // 打字机动画状态
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fullText = "Hello, I'm liujinbao";

  // 打字机动画效果
  useEffect(() => {
    const typeSpeed = 150; // 打字速度
    const deleteSpeed = 100; // 删除速度
    const pauseTime = 2000; // 完整显示后的暂停时间
    const restartPause = 1000; // 删除完后重新开始的暂停时间

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          // 逐字添加
          if (currentIndex < fullText.length) {
            setDisplayText(fullText.slice(0, currentIndex + 1));
            setCurrentIndex(currentIndex + 1);
          } else {
            // 完整显示后暂停，然后开始删除
            setTimeout(() => {
              setIsDeleting(true);
            }, pauseTime);
          }
        } else {
          // 逐字删除
          if (currentIndex > 0) {
            setDisplayText(fullText.slice(0, currentIndex - 1));
            setCurrentIndex(currentIndex - 1);
          } else {
            // 删除完后暂停，然后重新开始
            setTimeout(() => {
              setIsDeleting(false);
            }, restartPause);
          }
        }
      },
      isDeleting ? deleteSpeed : typeSpeed
    );

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, fullText]);

  // 标签点击处理函数
  const handleTagClick = (tagName: string) => {
    const tagConfig = tagConfigs[tagName];

    if (!tagConfig) {
      return;
    }

    switch (tagConfig.type) {
      case "image":
        setImageModal(tagConfig.config as ImageModalConfig);
        break;
      case "music":
        setMusicModal(tagConfig.config as MusicModalConfig);
        break;
      case "video":
        setVideoModal(tagConfig.config as VideoModalConfig);
        break;
      case "link":
        const linkConfig = tagConfig.config as { url: string };
        window.open(linkConfig.url, "_blank");
        break;
      default:
        break;
    }
  };

  // 添加GitHub和QQ点击处理函数
  const handleGithubClick = () => {
    window.open("https://github.com/wanxiayushaonian", "_blank");
  };

  const handleQQClick = () => {
    setImageModal({
      isOpen: true,
      title: "QQ",
      images: ["/images/qq.jpg"],
      danmakuText: "联系我",
      enableDanmaku: true,
      imageWidth: 500,
      imageHeight: 500,
    });
  };

  const tags = [
    {
      name: "瞎捣鼓",
    },
    {
      name: "爱研究",
    },
    {
      name: "看论文",
    },
    {
      name: "音乐",
    },
  ];

  const express = experienceData;

  return (
    <>
      <Head>
        <title>首页 - liujinbao&apos;s web</title>
        <meta name="description" content="liujinbao的个人网站首页" />
      </Head>
      <div className="relative">
        {/* 弹窗组件 */}
        <ImageModal
          isOpen={imageModal.isOpen}
          onClose={() => setImageModal({ ...imageModal, isOpen: false })}
          title={imageModal.title}
          images={imageModal.images}
          danmakuText={imageModal.danmakuText}
          enableDanmaku={imageModal.enableDanmaku}
          imageWidth={imageModal.imageWidth}
          imageHeight={imageModal.imageHeight}
        />

        <MusicModal
          isOpen={musicModal.isOpen}
          onClose={() => setMusicModal({ ...musicModal, isOpen: false })}
          title={musicModal.title}
          musicUrl={musicModal.musicUrl}
          author={musicModal.author}
          cover={musicModal.cover}
          danmakuText={musicModal.danmakuText}
          enableDanmaku={musicModal.enableDanmaku}
        />

        <VideoModal
          isOpen={videoModal.isOpen}
          onClose={() => setVideoModal({ ...videoModal, isOpen: false })}
          videoUrl={videoModal.videoUrl}
          danmakuText={videoModal.danmakuText}
          enableDanmaku={videoModal.enableDanmaku}
        />

        {/* 主要内容区域 */}
        <div
          className={`${geistSans.className} ${geistMono.className} items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)] flex justify-center px-4 md:px-0 `}
        >
          <div className="flex flex-col w-full max-w-3xl h-[100vh] md:h-auto overflow-y-auto md:overflow-y-visible custom-scrollbar pb-20 md:pb-0 hide-scrollbar">
            {/* 头部区域 - 头像和基本信息 */}
            <div className="flex gap-[10px] flex-col md:flex-row pt-[100px] md:pt-0">
              <div className="relative w-full md:w-[250px] flex justify-center items-center mx-auto md:mx-0">
                <Image
                  src="/images/avatar.jpg"
                  alt="Logo"
                  width={200}
                  height={200}
                  className="rounded-[50%] shadow-lg w-[150px] h-[150px] md:w-[200px] md:h-[200px]"
                />
                {theme !== "dark" ? (
                  <Image
                    src="/images/smoke.png"
                    alt="Logo"
                    width={200}
                    height={200}
                    className="top-[-135px] md:top-[-180px] left-[50%] translate-x-[-50%] absolute w-[150px] h-[150px] md:w-[200px] md:h-[200px]"
                  />
                ) : (
                  ""
                )}
              </div>
              <div className="flex flex-col gap-[10px] text-center md:text-left px-4 md:px-0">
                <div className="text-[28px] md:text-[40px] font-bold text-[#fff] text-shadow-sm">
                  <span className="inline-block">
                    {displayText.split(" ").map((word, wordIndex) => {
                      if (word === "liujinbao") {
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
                          {wordIndex < displayText.split(" ").length - 1
                            ? " "
                            : ""}
                        </span>
                      );
                    })}
                    <span className="animate-pulse text-[#3d85a9]">|</span>
                  </span>
                </div>
                <div className="text-shadow-sm text-[#fff] text-[14px] md:text-[16px]">
                  <span className="bg-gradient-to-br from-[#1b2c55] to-[#3d85a9] bg-clip-text text-transparent text-[16px] md:text-[18px]">
                    Student
                  </span>{" "}
                  (在读学生)
                </div>
                <div className="text-shadow-sm text-[#fff] text-[14px] md:text-[16px]">
                  <span className="bg-gradient-to-br from-[#1b2c55] to-[#3d85a9] bg-clip-text text-transparent text-[16px] md:text-[18px]">
                    21
                  </span>{" "}
                  years old (21岁)
                </div>
                <div className="text-shadow-sm text-[#fff] text-[14px] md:text-[16px]">
                  <span className="bg-gradient-to-br from-[#1b2c55] to-[#3d85a9] bg-clip-text text-transparent text-[16px] md:text-[18px]">
                    AI
                  </span>{" "}
                  enthusiast (AI 爱好者)
                </div>
                <div className="flex mt-[10px] gap-[10px] justify-center md:justify-start">
                  <div
                    className="bg-[rgba(0,0,0,.5)] rounded-[5px] p-[8px] cursor-pointer"
                    onClick={handleGithubClick}
                  >
                    <SvgIcon
                      name="github"
                      width={20}
                      height={20}
                      color="#fff"
                    />
                  </div>
                  <div
                    className="bg-[rgba(0,0,0,.5)] rounded-[5px] p-[8px] cursor-pointer"
                    onClick={handleQQClick}
                  >
                    <SvgIcon name="qq" width={20} height={20} color="#fff" />
                  </div>
                </div>
              </div>
            </div>

            {/* 内容区域 - 在800px以下变为垂直布局 */}
            <div className="flex gap-[10px] mt-[20px] flex-col md:flex-row px-4 md:px-0">
              {/* 左侧/中间区域 */}
              <div className="flex order-2 md:order-1 w-full md:w-auto">
                <div className="flex flex-col gap-[10px] w-full md:w-[250px]">
                  <div className="flex gap-[10px] flex-col flex-row">
                    <div className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] text-[14px] gap-[10px] flex flex-col flex-1">
                      <div className="flex items-center gap-[5px]">
                        <SvgIcon
                          name="address"
                          width={20}
                          height={20}
                          color="#fff"
                        />
                        杭州
                      </div>
                      <div className="flex items-center gap-[5px]">
                        <SvgIcon
                          name="work"
                          width={20}
                          height={20}
                          color="#fff"
                        />
                        在校
                      </div>
                    </div>
                    <div className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] text-[14px] gap-[10px] flex flex-col flex-1">
                      <div className="flex items-center gap-[5px]">
                        <SvgIcon
                          name="address"
                          width={20}
                          height={20}
                          color="#fff"
                        />
                        杭州
                      </div>
                      <div className="flex items-center gap-[5px]">
                        <SvgIcon
                          name="home"
                          width={20}
                          height={20}
                          color="#fff"
                        />
                        家
                      </div>
                    </div>
                  </div>
                  <div className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] gap-[10px] flex flex-wrap text-[12px]">
                    {tags.map((tag) => (
                      <div
                        className="bg-[rgba(255,255,255,.1)] rounded-[5px] p-[5px] w-fit cursor-pointer hover:bg-[rgba(255,255,255,.2)] transition-all duration-200 transform hover:scale-105"
                        key={tag.name}
                        onClick={() => handleTagClick(tag.name)}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                  <div className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] text-[14px] gap-[10px] flex flex-col">
                    <div className="relative">
                      {express.map((item, index) => (
                        <div
                          key={index}
                          className="relative flex items-start last:mb-0"
                        >
                          {/* 时间线左侧圆点 */}
                          <div className="relative flex flex-col items-center mr-[15px]">
                            <div
                              className={`w-[12px] h-[12px] rounded-full border-2 border-white ${
                                index === express.length - 1
                                  ? "bg-[#3d85a9]"
                                  : "bg-[#1b2c55]"
                              }`}
                            ></div>
                            {/* 连接线 */}
                            {index < express.length - 1 && (
                              <div className="w-[2px] h-[40px] bg-gradient-to-b from-[#1b2c55] to-[#3d85a9] mt-[5px]"></div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="font-semibold text-[#fff] mb-[2px] text-[13px] md:text-[14px]">
                              {item.name}
                            </div>
                            <div className="text-[11px] md:text-[12px] text-[rgba(255,255,255,0.7)]">
                              {item.date}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* 右侧/底部区域 */}
              <div className="flex flex-col gap-[10px] order-1 md:order-2 w-full md:w-auto">
                {/* GitHub贡献热力图 */}
                <div className="w-full overflow-x-auto">
                  <GitHubHeatmap username="wanxiayushaonian" year={2026} />
                </div>

                <div className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] text-[14px] gap-[10px] flex flex-col">
                  <div className="font-bold text-[16px] flex items-center gap-[5px]">
                    <SvgIcon name="site" width={20} height={20} color="#fff" />
                    <div className="flex flex-col">
                      Navigation
                      <span className="text-[11px] font-[400]">导航</span>
                    </div>
                  </div>
                  <div className="flex gap-[10px] flex-col sm:flex-row">
                    <Link
                      href="/works"
                      className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] text-[14px] gap-[10px] flex flex-col cursor-pointer flex-1"
                    >
                      <div className="flex justify-between items-center">
                        作品集
                        <SvgIcon
                          name="zuopin"
                          width={25}
                          height={25}
                          color="#fff"
                        />
                      </div>
                      <span className="text-[12px]">记录前端作品</span>
                    </Link>
                    <Link
                      href="/blog"
                      className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] text-[14px] gap-[10px] flex flex-col cursor-pointer flex-1"
                    >
                      <div className="flex justify-between items-center">
                        文章
                        <SvgIcon
                          name="docs"
                          width={25}
                          height={25}
                          color="#fff"
                        />
                      </div>
                      <span className="text-[12px]">记录前端知识</span>
                    </Link>
                    <Link
                      href="/chat"
                      className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] text-[14px] gap-[10px] flex flex-col cursor-pointer flex-1"
                    >
                      <div className="flex justify-between items-center">
                        聊天室
                        <SvgIcon
                          name="comment"
                          width={25}
                          height={25}
                          color="#fff"
                        />
                      </div>
                      <span className="text-[12px]">实时聊天交流</span>
                    </Link>
                    <Link
                      href="/about"
                      className="bg-[rgba(0,0,0,.3)] rounded-[5px] p-[10px] text-[#fff] text-[14px] gap-[10px] flex flex-col cursor-pointer flex-1"
                    >
                      <div className="flex justify-between items-center">
                        关于
                        <SvgIcon
                          name="home"
                          width={25}
                          height={25}
                          color="#fff"
                        />
                      </div>
                      <span className="text-[12px]">个人介绍</span>
                    </Link>
                  </div>
                  <div className="text-[12px] md:text-[14px]">
                    2025年开始持续更新中...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 滚动到作品页按钮 */}
          <div className="fixed bottom-8 right-8 z-10">
            <Link
              href="/works"
              className="bg-[rgba(0,0,0,.5)] hover:bg-[rgba(0,0,0,.7)] rounded-[5px] p-[8px] cursor-pointer transition-all duration-200 flex items-center gap-2 text-white backdrop-blur-sm"
            >
              <span className="text-sm">作品集</span>
              <SvgIcon name="right" width={20} height={20} color="#fff" />
            </Link>
          </div>

          {/* 彩蛋悬浮按钮 */}
          <a
            href="/games/2048"
            target="_blank"
            className="fixed bottom-8 left-8 z-10 group"
          >
            <div className="relative w-[45px] h-[45px] rounded-full border-[3px] border-[#1b2c55] shadow-[3px_3px_0px_0px_rgba(27,44,85,0.8)] bg-gradient-to-br from-[#FFE600] to-[#FF8C42] cursor-pointer transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(27,44,85,0.8)] hover:rotate-12 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(27,44,85,0.8)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[15px] h-[15px] border-[3px] border-[#1b2c55] rounded-sm transform group-hover:rotate-45 transition-transform duration-300"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-[12px] h-[12px] bg-[#FF4757] rounded-full border-[2px] border-[#1b2c55] animate-pulse"></div>
            </div>
          </a>
        </div>
      </div>
    </>
  );
}
