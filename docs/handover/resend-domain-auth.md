通知メールの送信元を独自ドメイン `yingpin.jp` にする作業（Resendのドメイン認証）を進めたいです。手順書はあるので、それに沿って私の操作を案内してください。

まず `docs/progress.md` を読んでください（このプロジェクトの現状がすべて書いてあります）。特に **§26**（ドメイン取得〜接続の全経緯）と **§9**（通知メールの実装）が直近の関係箇所です。続いて `CLAUDE.md` と `AGENTS.md`、そして手順書 **`docs/ops/domain-conoha-vercel-guide.md` の「手順4」** を読んでください。

## なぜやるのか（目的）

いま、新規登録・新規応募のスタッフ通知メールは Resend の**テスト用アドレス `onboarding@resend.dev`** から送られています。この状態では **Resendアカウント所有者（`yazawa-y@partner-japan.biz`）宛にしか届きません。** 他のスタッフを宛先に足しても届きません。

独自ドメインを認証すると、**スタッフ複数名に通知が届く**ようになり、迷惑メールにも入りにくくなります。

## 前提（調査済みの事実。再調査は不要です）

- **ドメイン `yingpin.jp` は 2026-07-29 に取得・接続まで完了**しています（ConoHa／GMO）。`https://yingpin.jp` でサイトが表示され、HTTPSも有効です
- **DNSの管理はConoHa**です。ネームサーバーは `ConoHa(標準)`（`ns-a1〜a3.conoha.io`）。レコードを編集する場所は **ConoHaコントロールパネル → 左メニュー「DNS」→ `yingpin.jp` → 右上の鉛筆アイコン ✏️ → 「＋」で行追加 → 保存**
- **現在入っているDNSレコード（消さないこと）**:

  | タイプ | 名称 | TTL | 値 |
  |---|---|---|---|
  | A(通常) | `@` | 3600 | `216.198.79.1` |
  | CNAME | `www` | 3600 | `e7a29a99ea1defe5.vercel-dns-017.com` |
  | NS | `@` | 3600 | `ns-a1.conoha.io` / `ns-a2.conoha.io` / `ns-a3.conoha.io`（3行） |

- **Vercelの環境変数は `RESEND_API_KEY` と `STAFF_NOTIFY_EMAILS` が既に登録済み**（2026-07-22・本番で到達確認済み）。今回追加・変更するのは **`NOTIFY_FROM_EMAIL`** と、必要なら `STAFF_NOTIFY_EMAILS` の宛先追加です
- **送信処理のコードは `app/src/lib/notify/resend.ts`。今回コードを変更する必要はありません。** 送信元は `NOTIFY_FROM_EMAIL` があればそれを使い、無ければ `onboarding@resend.dev` を使う実装になっています
- **Vercelの本番ブランチは `main` ではなく `claude/skilled-worker-job-site-mock-lk07i6`** です。⚠️ **環境変数を変えただけでは反映されません。再デプロイが必須です**

## あなた（Claude）の役割

**Resend・ConoHa・Vercelの画面操作は私（オーナー）が行います。あなたはログインできません。** あなたの役割は、手順を1つずつ案内し、私が見ている画面の内容（スクリーンショット）を伝えたらそれを読んで次を指示することです。

- 私はプログラミング未経験です。専門用語には一言説明を添えてください
- **一度に全ステップを説明せず、1ステップずつ進めてください**
- 私が画面のエラーやスクリーンショットを送ったら、それを読んで対処を教えてください

## 🔴 このプロジェクトで学んだ教訓（必ず守ってください）

### 1. DNSに入れる値を推測しない

前回のドメイン接続で、**一般に案内されている値（`76.76.21.21` / `cname.vercel-dns.com`）は旧来値で、実際に指示されたのは `216.198.79.1` と `e7a29a99ea1defe5.vercel-dns-017.com` でした。** 推測で案内すると「動くが推奨外」または「まったく繋がらない」状態になります。

**Resendの画面に表示された値のスクリーンショットを私に求め、それを見てから指示してください。** 一般的な例を示すのは構いませんが、**「正解は画面に出ている値」と明示**してください。

特に **DKIMの値は数百文字のランダムな文字列**です。`0`（ゼロ）と `O`（オー）、`1`（イチ）と `l`（エル）の区別が目視では危ういので、**必ずコピーボタンを使うよう**指示してください。あなたが書き写した文字列を私にコピーさせるのは禁止です。

### 2. 🔴 `NOTIFY_FROM_EMAIL` は Resend が **Verified になってから**設定する

`app/src/lib/notify/resend.ts` は **通知の失敗を捕捉して例外を投げない設計**です（応募や登録の主処理を通知失敗で止めないため）。

つまり、**未認証のドメインのアドレスを `NOTIFY_FROM_EMAIL` に設定すると、Resendが送信を拒否しても画面上は何も起きず、通知メールが静かに届かなくなります。** ログ（Vercelの Logs）を見ないと気づけません。

**順番を必ず守ってください: ①DNSレコードを追加 → ②Resendで Verified を確認 → ③その後に `NOTIFY_FROM_EMAIL` を設定 → ④再デプロイ → ⑤テスト登録で実際に届くか確認。**

### 3. ConoHaの既存レコードを消さない

上の表の5行（A・CNAME・NS×3）は**サイトの表示そのもの**です。追加だけを行うよう指示してください。

### 4. CNAMEの末尾のドット

Resendが `...com.` のようにドット付きで表示した場合、**ドットごと貼り付けて保存すれば ConoHa 側が自動で外します**（前回それで正常に動きました）。エラーになったらドットを外して再保存です。

## 最初に決めること（私に尋ねてください）

Resendのドメイン認証は、**ルートドメイン `yingpin.jp` で行うか、サブドメイン `send.yingpin.jp` で行うか**を選べます。**着手前にこれを私に確認してください**（後から変えるとDNSレコードの入れ直しになります）。

| | ルート `yingpin.jp` | サブドメイン `send.yingpin.jp` |
|---|---|---|
| 送信元の見え方 | `no-reply@yingpin.jp`（きれい） | `no-reply@send.yingpin.jp`（やや技術的） |
| 評価の分離 | 無し | メール送信の評価がルートに影響しない |
| 向く場面 | 送信量が少ない・将来会員にも送る | 大量配信・複数用途 |

**推奨はルートドメイン `yingpin.jp`** です。理由: ①通知の宛先は当面スタッフだが、将来会員へ送る可能性があり、その時に `@yingpin.jp` の方が信頼されやすい ②送信量がごく少なく評価分離の実益が小さい ③`yingpin.jp` で他のメールを送る予定が無いためSPFの衝突が起きない（会社のメールは `@partner-japan.biz` を継続。`docs/ops/domain-setup-guide.md` §4）。

⚠️ **ただし Resend の画面がサブドメインを強く推奨してくる場合は、その表示内容を私に見せて判断させてください。** サービス側の仕様が変わっている可能性があります。

## 進め方

手順書「手順4」の順に進めます。まず上の「最初に決めること」を私に尋ね、決まったら Resend の **Domains → Add Domain** から1ステップずつ案内してください。

## DNSの反映を客観的に確認する方法（あなたが使えます）

このサンドボックスから**名前解決はできます**（Supabase等のHTTPS通信は遮断されていますが、DNSは通ります）。ブラウザのキャッシュに左右されない判定ができるので活用してください。

- `dig` / `nslookup` / `whois` は**入っていません**
- A / CNAME は `getent hosts <名前>` または Python の `socket.getaddrinfo` で引けます
- **TXT / MX（今回必要なのはこちら）は生のDNSクエリで引けます。** `8.8.8.8` へのUDP問い合わせが通ることを 2026-07-29 に確認済みです:

```bash
python3 - <<'PY'
import socket, struct
def query(name, qtype):   # qtype: 16=TXT, 15=MX
    parts = b"".join(bytes([len(l)]) + l.encode() for l in name.split(".")) + b"\x00"
    pkt = struct.pack(">HHHHHH", 0x1234, 0x0100, 1, 0, 0, 0) + parts + struct.pack(">HH", qtype, 1)
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.settimeout(5)
    s.sendto(pkt, ("8.8.8.8", 53))
    return s.recvfrom(4096)[0]
for name, qt, label in [("yingpin.jp", 16, "TXT"), ("resend._domainkey.yingpin.jp", 16, "DKIM"), ("send.yingpin.jp", 15, "MX")]:
    try:
        d = query(name, qt)
        txt = b"".join(c for c in d.split(b"\x00") if c)
        print(f"{label:5} {name}: 応答 {len(d)}バイト / 回答数 {struct.unpack('>H', d[6:8])[0]}")
    except Exception as e:
        print(f"{label:5} {name}: 失敗 {type(e).__name__}")
PY
```

⚠️ **DNSは「答えが無かった」という結果も一定時間キャッシュされます**（TTL 3600＝最大1時間）。レコード追加直後に Resend が「未検証」と出しても故障ではありません。前回も `Failed To Generate Cert` が出ましたが、待って再確認したら解決しました。**焦らせず、待って再確認するよう案内してください。**

## 完了したら、あなたが行う後片付け

1. **HSTS 第2段への引き上げ**（この作業を待っていた項目）
   - `app/next.config.ts` の `HSTS_MAX_AGE_SECONDS` を `31_536_000`（1年）にし、`Strict-Transport-Security` に `; includeSubDomains` を付ける
   - ⚠️ **その前に、今回作られたサブドメイン（`send.yingpin.jp` など）を確認してください。** メール用のDNSレコードだけならブラウザからアクセスされないため影響はありませんが、**Resendのクリック追跡などでHTTPSのページが載る構成になっていないか**を見てから判断すること
   - `preload`（第3段）は**付けないでください**。解除に数か月かかるため見送り中です
   - **検証は設定ファイルを読むだけで済ませないこと。** ローカルで本番ビルドを起動し、実レスポンスのヘッダを確認してください:
     ```bash
     cd app && npm ci && NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy npm run build
     NEXT_PUBLIC_SUPABASE_URL=https://dummy.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy PORT=3111 npm start &
     curl -sS -D - -o /dev/null http://127.0.0.1:3111/ | grep -i strict-transport
     ```
2. **`app/.env.example` の `NOTIFY_FROM_EMAIL` のコメント**を、実際に採用した形式に更新
3. **手順書 `docs/ops/domain-conoha-vercel-guide.md` の「手順4」を「実施済みの記録」に切り替える**
   - 実際に入れたDNSレコード（種類・名称・値の形）と、引っかかった点を残すこと。前回の手順1〜3がこの形式になっているので合わせる
   - **値の実物を残す**こと（次に同じ作業をする人が「一般的な値」を推測しないで済むように）
4. **`docs/progress.md` を更新**
   - §1 の環境変数の記述（送信元がテストモードである旨の記述を削除）
   - §26 に結果を追記、🧭 節の残作業から2件（Resend・HSTS第2段）を消す
   - 冒頭の「最終更新」行に要約を追記（既存の書式に合わせる）
5. **`docs/handover/README.md`** の表で、この引継ぎプロンプトを実施済みに更新
6. **コミットしてPRを出す**（本番ブランチは保護されているので直pushは不可）

## 注意

- **`@phone.yingpin.app` は絶対に変更しないでください。** 電話番号ログインの内部実装で使う**架空の**メールアドレスで（`app/src/lib/auth/phone-email.ts`）、今回のメール送信ドメインとは無関係です。「揃えた方がよいのでは」と考えて書き換えると、**既存の会員全員がログインできなくなります**
- 通知メールの宛先（`STAFF_NOTIFY_EMAILS`）に実在のスタッフのアドレスを追加する場合、**そのアドレスは実在個人の情報なのでコミットしないこと**（Vercelの環境変数にのみ設定）
- 最後の確認は**実際にテスト登録を1件行い、設定した全員に通知が届くこと**まで見てください。「Verifiedになった」で終わらせないこと（前項の「静かに失敗する」性質があるため）
