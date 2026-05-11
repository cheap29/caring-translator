# Caring Translator 🎀

> 専門的・難解なテキストを選択するだけで、ギャル語＋比喩に変換してわかりやすく読めるようにする Chrome 拡張機能です。

経済ニュース・技術記事・法律文書など「内容はわかるはずなのに読む気が起きない」テキストを、軽快で親しみやすい文体に変換します。

---

## 変換ロジックの設計方針

ただ口調を変えるだけでなく、**正確さと読みやすさの両立**を設計の核心に置いています。

| 設計上の制約 | 内容 |
|---|---|
| 誤情報を足さない | プロンプトで明示的に「推測しないこと」を指定 |
| 数値・通貨・日付は原文のまま保持 | ギャル語に変換後も数字の改ざんをしない |
| temperature: 0.3 | 出力の一貫性を重視し、揺れを抑えた設定 |
| 中学生にもわかる粒度 | 比喩・身近な例えで概念を置き換える |

出力は「要点 → やさしい説明 → ギャル語版」の3ブロック構成に自動分割して表示します。

---

## 変換例

**原文（英語ニュース）**:
```
The Federal Reserve raised interest rates by 0.25% today, marking the third consecutive increase this year.
```

**変換後**:
```
今日、FRBが金利を0.25%上げたって話っぽい〜 📈
今年で3回目の連続上げやね！💸

要するに、お金を借りるのがちょっと大変になったってことやで〜
でも、インフレ対策としては必要なことらしいよ✨

マジで経済って複雑やね〜😅 でも、これで物価が落ち着いてくれるといいな〜🙏
```

→ 数値「0.25%」「3回目」は原文通り保持されています。

---

## 技術構成

| 項目 | 内容 |
|---|---|
| Chrome API | Manifest V3 / Side Panel API / Service Worker |
| AI | OpenAI gpt-4o-mini（Chat Completions） |
| 通信パターン | Service Worker → Side Panel への `runtime.sendMessage`（content script なし） |
| 出力パース | 見出し行（要点・やさしい説明・ギャル語版）でブロック分割して描画 |

Side Panel API は MV3 で追加された比較的新しい API です。Service Worker（background）から直接 Side Panel に `sendMessage` できるため、content script を挟まずシンプルな構成になっています。

---

## インストール方法

1. Chrome で `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を ON にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトのフォルダを選択
5. 拡張機能アイコンを右クリック → 「オプション」から OpenAI API キーを設定

---

## 使い方

1. 翻訳したいテキストを選択
2. 右クリック → 「ギャル翻訳」を選択
3. 右サイドバーに翻訳結果が表示される

---

## ファイル構成

```
caring-translator/
├── manifest.json      # 拡張機能設定（MV3）
├── background.js      # Service Worker：右クリック検知・OpenAI呼び出し
├── sidepanel.html     # サイドパネルのHTML
├── sidepanel.js       # サイドパネル：メッセージ受信・ブロック分割・描画
├── options.html       # 設定画面のHTML
├── options.js         # 設定画面：APIキー保存
└── icons/
```

---

## 開発・デバッグ

ファイルを編集後、`chrome://extensions/` の「更新」ボタンで変更が反映されます。
サイドパネルは別プロセスで動作するため、拡張機能のデベロッパーツールとは独立してデバッグできます。

---

**注意**: API キーの管理は自己責任でお願いします。

MIT License
