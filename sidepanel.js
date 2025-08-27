function render({ loading, error, result }) {
  const status = document.getElementById("status");
  const content = document.getElementById("content");
  console.log(loading, error, result);
  if (loading) {
    status.textContent = "ギャルが翻訳中…ちょい待ち〜";
    content.innerHTML = "";
    return;
  }

  if (error) {
    status.textContent = "エラー発生";
    content.innerHTML = `<div class="card"><h3>エラー</h3><pre>${error}</pre></div>`;
    return;
  }

  if (result) {
    status.textContent = "できたよ。";
    // ざっくり3部構成に分割（見出しで分けてくれる前提。なければそのまま表示）
    const blocks = splitBlocks(result);
    content.innerHTML = blocks
      .map(
        (b) => `
        <div class="card">
          <h3>${escapeHtml(b.title)}</h3>
          <pre>${escapeHtml(b.body)}</pre>
        </div>
      `
      )
      .join("");
  }
}

// 見出しらしき行で分割（軽めの規則）
function splitBlocks(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let cur = { title: "結果", body: "" };

  for (const line of lines) {
    if (/^\s*(要点|やさしい説明|ギャル語版)/.test(line)) {
      if (cur.body.trim()) blocks.push(cur);
      cur = { title: line.trim(), body: "" };
    } else {
      cur.body += line + "\n";
    }
  }
  if (cur.body.trim()) blocks.push(cur);
  return blocks.length ? blocks : [{ title: "結果", body: text }];
}

function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

// Side Panelはタブとは別プロセス。background→tab→ここ、の順にメッセ受けるため、content scriptなしでruntime.onMessageを受けられるようにする
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "GAL_RESULT") render(msg.payload || {});
});
