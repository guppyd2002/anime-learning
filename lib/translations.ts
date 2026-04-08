// 10 個句子的中文翻譯
export const SENTENCE_ZH: Record<string, string> = {
  "The pirates are here!": "海賊來了！",
  "Why were you in a barrel?": "你為什麼藏在桶子裡？",
  "I want to be King of the Pirates!": "我要成為海賊王！",
  "I'm a pirate!": "我是海賊！",
  "I need a crew!": "我需要夥伴！",
  "Can you guys keep it down?": "你們可以安靜一點嗎？",
  "Join my crew!": "加入我的船員！",
  "I'm not interested in joining your crew.": "我對加入你的船員沒有興趣。",
  "I'm going to be King of the Pirates!": "我要成為海賊王！",
  "I'm going to join the Marines!": "我要加入海軍！",
}

// 單字中文字典
export const WORD_ZH: Record<string, string> = {
  the: "這個／那個",
  pirates: "海賊",
  pirate: "海賊",
  are: "是／在",
  here: "這裡",
  why: "為什麼",
  were: "是（過去式）",
  you: "你",
  in: "在……裡面",
  a: "一個",
  barrel: "桶子",
  i: "我",
  want: "想要",
  to: "去……",
  be: "成為",
  king: "國王",
  of: "……的",
  im: "我是",
  "i'm": "我是",
  need: "需要",
  crew: "船員／夥伴",
  can: "可以",
  guys: "你們",
  keep: "保持",
  it: "它",
  down: "安靜",
  join: "加入",
  my: "我的",
  not: "不是",
  interested: "有興趣的",
  joining: "加入",
  your: "你的",
  going: "要去",
  marines: "海軍",
}

export function getWordZh(word: string): string | null {
  const key = word.toLowerCase().replace(/[^a-z']/g, "")
  return WORD_ZH[key] ?? null
}
