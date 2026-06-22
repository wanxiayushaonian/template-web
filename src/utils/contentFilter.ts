// 不文明词汇字典
const PROFANITY_WORDS = {
  // 中文不文明词汇
  chinese: [
    "鸡鸡很大",
    "你妈的",
    "傻逼",
    "操你妈",
    "草泥马",
    "卧槽",
    "妈的",
    "他妈的",
    "去死",
    "死全家",
    "滚蛋",
    "滚开",
    "白痴",
    "智障",
    "脑残",
    "垃圾",
    "废物",
    "贱人",
    "婊子",
    "妓女",
    "狗屎",
    "屎",
    "尿",
    "屁",
    "放屁",
    "臭",
    "恶心",
    "变态",
    "色狼",
    "流氓",
    "混蛋",
    "王八蛋",
    "龟儿子",
    "狗日的",
    "畜生",
    "你妈逼",
    "你麻痹",
    "你码比",
    "妈逼",
    "出生",
    "妈比",
    "马币",
    "麻痹",
    "尼玛",
    "操你吗",
    "操",
    "草",
    "曹",
    "妈",
    "马",
    "骂",
    "傻",
    "艹",
    "c你m",
    "死",
    "全家",
    "忘本",
    "鸡",
    "鸭",
    "狗",
  ],
  // 英文不文明词汇
  english: [
    "fuck",
    "shit",
    "damn",
    "bitch",
    "asshole",
    "bastard",
    "crap",
    "piss",
    "hell",
    "stupid",
    "idiot",
    "moron",
    "retard",
    "gay",
    "lesbian",
    "whore",
    "slut",
    "prostitute",
    "sex",
    "porn",
    "xxx",
    "dick",
    "cock",
    "pussy",
    "boobs",
    "tits",
    "ass",
    "butt",
    "penis",
    "vagina",
    "c",
    "sab",
    "sha",
    "sa",
    "s",
    "m",
    "dog",
  ],
  // 拼音和缩写
  abbreviations: [
    "nmd",
    "jjhd",
    "cnm",
    "tmb",
    "sb",
    "nc",
    "zz",
    "lj",
    "fw",
    "bt",
    "wtf",
    "omg",
    "fck",
    "sht",
    "dmn",
    "btch",
    "fk",
    "fuk",
    "fuc",
    "cao",
    "ri",
    "gan",
    "ma",
    "bi",
    "sha",
    "zhi",
    "zhang",
    "can",
    "cao",
    "gou",
  ],
};

// 敏感词替换字符
const REPLACEMENT_CHAR = "*";

/**
 * 检查文本是否包含不文明内容
 * @param text 要检查的文本
 * @returns 是否包含不文明内容
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();

  // 检查所有类型的不文明词汇
  const allWords = [
    ...PROFANITY_WORDS.chinese,
    ...PROFANITY_WORDS.english,
    ...PROFANITY_WORDS.abbreviations,
  ];

  return allWords.some((word) => {
    const lowerWord = word.toLowerCase();
    return lowerText.includes(lowerWord);
  });
}

/**
 * 过滤文本中的不文明内容，用星号替换
 * @param text 要过滤的文本
 * @returns 过滤后的文本
 */
export function filterProfanity(text: string): string {
  let filteredText = text;

  // 过滤所有类型的不文明词汇
  const allWords = [
    ...PROFANITY_WORDS.chinese,
    ...PROFANITY_WORDS.english,
    ...PROFANITY_WORDS.abbreviations,
  ];

  allWords.forEach((word) => {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    filteredText = filteredText.replace(
      regex,
      REPLACEMENT_CHAR.repeat(word.length)
    );
  });

  return filteredText;
}

/**
 * 验证昵称是否合法（不能是liujinbao且不能包含不文明词汇）
 * @param nickname 昵称
 * @returns 是否合法
 */
export function isValidNickname(nickname: string): boolean {
  const trimmedNickname = nickname.trim().toLowerCase();

  // 检查是否为liujinbao
  if (trimmedNickname === "liujinbao") {
    return false;
  }

  // 检查是否包含不文明词汇
  if (containsProfanity(nickname)) {
    return false;
  }

  return true;
}

/**
 * 检查昵称是否为作者
 * @param nickname 昵称
 * @returns 是否为作者
 */
export function isAuthor(nickname: string): boolean {
  const trimmedNickname = nickname.trim().toLowerCase();
  return trimmedNickname === "liujinbao";
}
