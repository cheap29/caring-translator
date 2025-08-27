// 右クリックメニュー作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "toGal",
    title: "ギャル翻訳",
    contexts: ["selection"],
  });
});

// 選択文字を取得する関数をページ側で実行
async function getSelectedText(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.getSelection()?.toString() || "",
  });
  return result.trim();
}

// OpenAI呼び出し
async function callOpenAI(apiKey, text) {
  const system = `
  あなたは専門記事の翻訳・要約エディタです。
  出力は日本語。
  ギャル語で軽快に、人情あり毒舌まじえて、中学生にもわかりやすく、誤情報は足さないように説明してください。
  語尾に「っていう話っぽい～」とつけてください。
  絵文字をまぜてください。ギャル的な感想も入れてください。
  複雑な内容には比喩や一般的な例を用いて説明してください。
  数値・通貨・銘柄・日付は正確に保持。推測しないこと。
    `.trim();

  const user = `
  【原文】
  ${text}
  `.trim();

  // 2025時点の安定エンドポイント（Chat Completions）
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`OpenAI API error: ${resp.status} ${msg}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "toGal" || !tab?.id) return;

  // ユーザージェスチャーに直接反応してSide Panelを開く
  chrome.sidePanel.open({ tabId: tab.id });

  // Side Panelの読み込みを待つ
  setTimeout(async () => {
    try {
      const text = await getSelectedText(tab.id);
      if (!text) {
        chrome.runtime.sendMessage({
          type: "GAL_RESULT",
          payload: { error: "テキストが選択されてません。" },
        });
        return;
      }

      // 「処理中」を表示させる
      chrome.runtime.sendMessage({
        type: "GAL_RESULT",
        payload: { loading: true },
      });

      // APIキー取得
      const { OPENAI_API_KEY } = await chrome.storage.sync.get(
        "OPENAI_API_KEY"
      );
      if (!OPENAI_API_KEY) {
        chrome.runtime.sendMessage({
          type: "GAL_RESULT",
          payload: { error: "オプションでOpenAI APIキーを設定してください。" },
        });
        return;
      }

      const result = await callOpenAI(OPENAI_API_KEY, text);
      chrome.runtime.sendMessage({
        type: "GAL_RESULT",
        payload: { result },
      });
    } catch (e) {
      chrome.runtime.sendMessage({
        type: "GAL_RESULT",
        payload: { error: String(e.message || e) },
      });
    }
  }, 100); // 100ms待つ
});
