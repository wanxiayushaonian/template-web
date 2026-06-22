import { useState, useEffect } from "react";
import Image from "next/image";
import { commentAPI, Comment } from "../../service/api/comment";
import {
  filterProfanity,
  containsProfanity,
  isValidNickname,
  isAuthor,
} from "../utils/contentFilter";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentModal({ isOpen, onClose }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [contentError, setContentError] = useState("");
  // 新增回复相关状态
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyNickname, setReplyNickname] = useState("");
  const [replyNicknameError, setReplyNicknameError] = useState("");
  const [replyContentError, setReplyContentError] = useState("");
  // 加载评论列表
  const loadComments = async () => {
    try {
      const data = await commentAPI.getComments();
      setComments(data);
    } catch (error) {
      console.error("加载评论失败:", error);
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim()) return;

    const finalNickname = replyNickname.trim() || "匿名用户";

    if (!validateReplyInput(replyNickname, replyContent)) {
      return;
    }

    setLoading(true);
    try {
      const filteredContent = filterProfanity(replyContent.trim());

      await commentAPI.addComment({
        nickname: finalNickname,
        content: filteredContent,
        parentId: parentId,
      });

      setReplyContent("");
      setReplyNickname("");
      setReplyingTo(null);
      setReplyNicknameError("");
      setReplyContentError("");
      await loadComments();
    } catch (error) {
      console.error("提交回复失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 新增：验证回复输入
  const validateReplyInput = (nickname: string, content: string): boolean => {
    setReplyNicknameError("");
    setReplyContentError("");

    // 验证昵称
    if (nickname.trim()) {
      if (nickname.trim().length > 10) {
        setReplyNicknameError("昵称不能超过10个字");
        return false;
      }

      if (!isValidNickname(nickname)) {
        const trimmedNickname = nickname.trim().toLowerCase();
        if (trimmedNickname === "liujinbao") {
          setReplyNicknameError("该昵称不可用，请选择其他昵称");
        } else if (containsProfanity(nickname)) {
          setReplyNicknameError("昵称包含不当词汇，请修改后重试");
        } else {
          setReplyNicknameError("该昵称不可用，请选择其他昵称");
        }
        return false;
      }
    }

    // 验证内容长度
    if (content.trim().length > 200) {
      setReplyContentError("回复内容不能超过200个字");
      return false;
    }

    // 验证内容是否包含不文明词汇
    if (containsProfanity(content)) {
      setReplyContentError("回复内容包含不当词汇，请修改后重试");
      return false;
    }

    return true;
  };

  // 新增：处理回复昵称变化
  const handleReplyNicknameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setReplyNickname(value);

    if (value.trim()) {
      if (value.trim().length > 10) {
        setReplyNicknameError("昵称不能超过10个字");
        return;
      }

      if (!isValidNickname(value)) {
        const trimmedNickname = value.trim().toLowerCase();
        if (trimmedNickname === "liujinbao") {
          setReplyNicknameError("该昵称不可用，请选择其他昵称");
        } else if (containsProfanity(value)) {
          setReplyNicknameError("昵称包含不当词汇，请修改后重试");
        } else {
          setReplyNicknameError("该昵称不可用，请选择其他昵称");
        }
      } else {
        setReplyNicknameError("");
      }
    } else {
      setReplyNicknameError("");
    }
  };

  // 新增：处理回复内容变化
  const handleReplyContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setReplyContent(value);

    if (value.trim()) {
      if (value.trim().length > 200) {
        setReplyContentError("回复内容不能超过200个字");
        return;
      }

      if (containsProfanity(value)) {
        setReplyContentError("回复内容包含不当词汇，请修改后重试");
      } else {
        setReplyContentError("");
      }
    } else {
      setReplyContentError("");
    }
  };

  // 新增：渲染评论和回复的递归组件
  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthorComment = isAuthor(comment.nickname || "");

    return (
      <div
        key={comment.id}
        className={`
          ${isReply ? "ml-8 mt-3" : ""}
          bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm
          border border-gray-200/50 dark:border-gray-600/50
          rounded-xl p-4 shadow-sm hover:shadow-md
          transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80
          animate-fade-in
          ${
            isReply ? "border-l-2 border-l-gray-300 dark:border-l-gray-600" : ""
          }
        `}
      >
        {/* 评论头部 - 昵称和时间 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* 头像 */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                isAuthorComment
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                  : "bg-gradient-to-br from-[#1b2c55] to-[#3d85a9]"
              }`}
            >
              {(comment.nickname || "匿名用户").charAt(0).toUpperCase()}
            </div>
            {/* 昵称 */}
            <span
              className={`text-sm ${
                isAuthorComment
                  ? "font-bold text-orange-600 dark:text-orange-400"
                  : "font-medium text-gray-900 dark:text-white"
              }`}
            >
              {comment.nickname || "匿名用户"}
              {isAuthorComment && (
                <span className="ml-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                  作者
                </span>
              )}
              {isReply && (
                <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-900 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full cursor-pointer hidden sm:inline-block">
                  回复
                </span>
              )}
            </span>
          </div>
          {/* 时间和回复按钮 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(comment.createdAt).toLocaleString("zh-CN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {!isReply && (
              <button
                onClick={() => {
                  setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  setReplyContent("");
                  setReplyNickname("");
                  setReplyNicknameError("");
                  setReplyContentError("");
                }}
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              >
                {replyingTo === comment.id ? "取消" : "回复"}
              </button>
            )}
          </div>
        </div>

        {/* 评论内容 */}
        <div
          className={`text-sm leading-relaxed pl-11 ${
            isAuthorComment
              ? "font-semibold text-gray-800 dark:text-gray-200"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {comment.content}
        </div>

        {/* 回复输入框 */}
        {replyingTo === comment.id && (
          <div className="mt-4 pl-11 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="昵称（可选，默认为匿名用户）"
                value={replyNickname}
                onChange={handleReplyNicknameChange}
                disabled={loading}
                maxLength={10}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white/80 dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  replyNicknameError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-500 focus:ring-blue-500"
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {replyNickname.length}/10
              </div>
            </div>
            {replyNicknameError && (
              <p className="text-xs text-red-500">{replyNicknameError}</p>
            )}
            <div className="relative">
              <textarea
                placeholder="写下你的回复..."
                value={replyContent}
                onChange={handleReplyContentChange}
                disabled={loading}
                maxLength={200}
                className={`w-full px-3 py-2 pr-16 text-sm border rounded-lg bg-white/80 dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  replyContentError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-500 focus:ring-blue-500"
                }`}
                rows={2}
              />
              <div className="absolute right-6 bottom-3 text-xs text-gray-400">
                {replyContent.length}/200
              </div>
              <button
                onClick={() => handleReplySubmit(comment.id)}
                disabled={
                  loading ||
                  !replyContent.trim() ||
                  replyNicknameError !== "" ||
                  replyContentError !== ""
                }
                className="absolute right-1 top-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded text-xs font-medium transition-colors disabled:cursor-not-allowed"
              >
                {loading ? "发送中" : "发送"}
              </button>
            </div>
            {replyContentError && (
              <p className="text-xs text-red-500">{replyContentError}</p>
            )}
          </div>
        )}

        {/* 回复列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}

        {/* 底部装饰线 */}
        <div className="mt-3 pl-11">
          <div
            className={`h-px bg-gradient-to-r to-transparent ${
              isAuthorComment
                ? "from-orange-200 dark:from-orange-700"
                : "from-gray-200 dark:from-gray-700"
            }`}
          ></div>
        </div>
      </div>
    );
  };

  // 验证输入内容
  const validateInput = (nickname: string, content: string): boolean => {
    setNicknameError("");
    setContentError("");

    // 验证昵称
    if (nickname.trim()) {
      // 检查昵称长度
      if (nickname.trim().length > 10) {
        setNicknameError("昵称不能超过10个字");
        return false;
      }

      // 检查昵称是否合法
      if (!isValidNickname(nickname)) {
        const trimmedNickname = nickname.trim().toLowerCase();
        if (trimmedNickname === "liujinbao") {
          setNicknameError("该昵称不可用，请选择其他昵称");
        } else if (containsProfanity(nickname)) {
          setNicknameError("昵称包含不当词汇，请修改后重试");
        } else {
          setNicknameError("该昵称不可用，请选择其他昵称");
        }
        return false;
      }
    }

    // 验证内容长度
    if (content.trim().length > 200) {
      setContentError("评论内容不能超过200个字");
      return false;
    }

    // 验证内容是否包含不文明词汇
    if (containsProfanity(content)) {
      setContentError("评论内容包含不当词汇，请修改后重试");
      return false;
    }

    return true;
  };

  // 提交评论
  const handleSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!newComment.trim()) return;

      const finalNickname = nickname.trim() || "匿名用户";

      if (!validateInput(nickname, newComment)) {
        return;
      }

      setLoading(true);
      try {
        // 过滤内容（双重保险）
        const filteredContent = filterProfanity(newComment.trim());

        await commentAPI.addComment({
          nickname: finalNickname,
          content: filteredContent,
        });

        setNewComment("");
        setNickname("");
        setNicknameError("");
        setContentError("");
        await loadComments();
      } catch (error) {
        console.error("提交评论失败:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // 点击发送按钮提交评论
  const handleSendClick = async () => {
    if (!newComment.trim()) return;

    const finalNickname = nickname.trim() || "匿名用户";

    if (!validateInput(nickname, newComment)) {
      return;
    }

    setLoading(true);
    try {
      // 过滤内容（双重保险）
      const filteredContent = filterProfanity(newComment.trim());

      await commentAPI.addComment({
        nickname: finalNickname,
        content: filteredContent,
      });

      setNewComment("");
      setNickname("");
      setNicknameError("");
      setContentError("");
      await loadComments();
    } catch (error) {
      console.error("提交评论失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理昵称输入变化
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);

    // 实时验证昵称
    if (value.trim()) {
      // 检查昵称长度
      if (value.trim().length > 10) {
        setNicknameError("昵称不能超过10个字");
        return;
      }

      // 检查昵称是否合法
      if (!isValidNickname(value)) {
        const trimmedNickname = value.trim().toLowerCase();
        if (trimmedNickname === "liujinbao") {
          setNicknameError("该昵称不可用，请选择其他昵称");
        } else if (containsProfanity(value)) {
          setNicknameError("昵称包含不当词汇，请修改后重试");
        } else {
          setNicknameError("该昵称不可用，请选择其他昵称");
        }
      } else {
        setNicknameError("");
      }
    } else {
      setNicknameError("");
    }
  };

  // 处理内容输入变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    // 实时验证内容
    if (value.trim()) {
      // 检查内容长度
      if (value.trim().length > 200) {
        setContentError("评论内容不能超过200个字");
        return;
      }

      // 检查是否包含不文明词汇
      if (containsProfanity(value)) {
        setContentError("评论内容包含不当词汇，请修改后重试");
      } else {
        setContentError("");
      }
    } else {
      setContentError("");
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* 抽屉式评论弹窗 */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 w-full
          bg-white/80 rounded-t-2xl shadow-2xl
          transform transition-transform duration-500 ease-out
          dark:bg-gray-800
          ${isOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ height: "80vh" }}
      >
        {/* 拖拽指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
        </div>

        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-500 dark:text-white">
            欢迎留言
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 输入区域 */}
        {/* 输入区域 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="昵称（可选，默认为匿名用户）"
                value={nickname}
                onChange={handleNicknameChange}
                disabled={loading}
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-xl bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  nicknameError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-gray-500"
                }`}
              />
              {/* 昵称字符计数 */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {nickname.length}/10
              </div>
            </div>
            {nicknameError && (
              <p className="mt-1 text-sm text-red-500">{nicknameError}</p>
            )}
          </div>
          <div className="relative">
            <textarea
              placeholder="写下你的评论... (按回车发送)"
              value={newComment}
              onChange={handleContentChange}
              onKeyDown={handleSubmit}
              disabled={loading}
              maxLength={200}
              className={`w-full px-4 py-3 pr-20 border rounded-xl bg-white/80 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                contentError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 dark:border-gray-600 focus:ring-gray-500"
              }`}
              rows={3}
            />
            {/* 内容字符计数 */}
            <div className="absolute right-6 bottom-4 text-xs text-gray-400">
              {newComment.length}/200
            </div>
            {contentError && (
              <p className="mt-1 text-sm text-red-500">{contentError}</p>
            )}
            {/* 发送按钮 */}
            <button
              onClick={handleSendClick}
              disabled={
                loading ||
                !newComment.trim() ||
                nicknameError !== "" ||
                contentError !== ""
              }
              className="absolute right-2 top-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>发送中</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span>发送</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 h-[calc(100%-300px)] custom-scrollbar">
          <div className="space-y-4">
            {comments
              .filter((comment) => !comment.parentId) // 只显示顶级评论
              .map((comment, index) => (
                <div
                  key={comment.id}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {renderComment(comment)}
                </div>
              ))}

            {/* 空状态 */}
            {comments.filter((comment) => !comment.parentId).length === 0 && (
              <div className="w-full flex-col text-gray-500 dark:text-gray-400 py-16 flex justify-center items-center">
                <div className="mb-6 opacity-80">
                  <Image
                    src="/images/shafa.png"
                    alt=""
                    width={160}
                    height={160}
                  />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">还没有评论</p>
                  <p className="text-sm opacity-75">
                    快来抢沙发，分享你的想法吧！
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
