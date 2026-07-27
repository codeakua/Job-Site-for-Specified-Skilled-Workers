// レート制限（一定時間あたりの実行回数の上限）— Issue #30
//
// ■ なぜ「差し替え可能」な形にしてあるか
//   Vercel のサーバーレス関数は **リクエストごとに別のインスタンスで動くことがあり、
//   メモリ上のカウンタは共有されない**。つまりインメモリ実装だけでは
//   「10回に制限したつもりが、インスタンスが5個立てば実質50回」になり得る。
//   これは “偽の安心” なので、外部ストア（Upstash Redis）に差し替えられる形にした。
//
// ■ 使い分け
//   - 環境変数 UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN が **両方**あれば
//     Upstash Redis（全インスタンス共有＝本当の制限）を使う。
//   - 無ければインメモリ（インスタンス単位＝ベストエフォート）にフォールバックする。
//     設定手順は docs/ops/rate-limit-store-guide.md。
//
// ■ 障害時の方針（fail-open）
//   外部ストアが落ちているときに登録できなくなるのは、攻撃されるより損害が大きい。
//   Upstash への通信が失敗したらインメモリ側で判定を続ける（＝守りは弱まるが止まらない）。

export type RateLimitBackend = "upstash" | "memory";

export type RateLimitRule = {
  /** 制限のキー。用途プレフィックス＋識別子（例 "reg:phone:819012345678"）。 */
  key: string;
  /** windowSec の間に許す回数。 */
  limit: number;
  /** 集計する時間の幅（秒）。 */
  windowSec: number;
};

export type RateLimitVerdict = {
  allowed: boolean;
  /** あと何回試せるか（0以上）。 */
  remaining: number;
  /** 制限に掛かったとき、何秒後に再試行できるか。 */
  retryAfterSec: number;
  /** 実際に判定に使ったストア。ログ・デバッグ用。 */
  backend: RateLimitBackend;
  /** 制限に掛かったルールのキー（allowed=false のときだけ入る）。 */
  key?: string;
};

/** Upstash が設定されているか（設定手順は docs/ops/rate-limit-store-guide.md）。 */
export function isSharedStoreConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/** いま使われているストア。PR説明・運用ログ用。 */
export function rateLimitBackend(): RateLimitBackend {
  return isSharedStoreConfigured() ? "upstash" : "memory";
}

/* ------------------------------------------------------------------ *
 * インメモリ（フォールバック）
 * ------------------------------------------------------------------ */

type Bucket = { count: number; resetAtMs: number };

// 開発時のホットリロードでカウンタが消えないよう globalThis に置く。
const globalStore = globalThis as unknown as { __ypRateLimit?: Map<string, Bucket> };
const memoryBuckets: Map<string, Bucket> = (globalStore.__ypRateLimit ??= new Map());

/** メモリを食い潰さないための上限。超えたら期限切れを掃除し、それでも多ければ古い順に捨てる。 */
const MEMORY_MAX_KEYS = 5000;

function pruneMemory(nowMs: number): void {
  if (memoryBuckets.size <= MEMORY_MAX_KEYS) return;
  for (const [k, b] of memoryBuckets) if (b.resetAtMs <= nowMs) memoryBuckets.delete(k);
  if (memoryBuckets.size <= MEMORY_MAX_KEYS) return;
  const oldestFirst = [...memoryBuckets.entries()].sort((a, b) => a[1].resetAtMs - b[1].resetAtMs);
  for (const [k] of oldestFirst.slice(0, memoryBuckets.size - MEMORY_MAX_KEYS)) {
    memoryBuckets.delete(k);
  }
}

function consumeInMemory(rule: RateLimitRule): RateLimitVerdict {
  const nowMs = Date.now();
  pruneMemory(nowMs);

  const current = memoryBuckets.get(rule.key);
  const bucket =
    current && current.resetAtMs > nowMs
      ? current
      : { count: 0, resetAtMs: nowMs + rule.windowSec * 1000 };
  bucket.count += 1;
  memoryBuckets.set(rule.key, bucket);

  const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAtMs - nowMs) / 1000));
  return {
    allowed: bucket.count <= rule.limit,
    remaining: Math.max(0, rule.limit - bucket.count),
    retryAfterSec,
    backend: "memory",
    key: rule.key,
  };
}

/* ------------------------------------------------------------------ *
 * Upstash Redis（REST API・パッケージ追加なし）
 * ------------------------------------------------------------------ */

/** Upstash への通信タイムアウト。登録の体感速度を落とさないよう短くする。 */
const UPSTASH_TIMEOUT_MS = 1500;

/**
 * 固定ウィンドウ方式のカウンタ。
 * `SET key 0 EX <窓> NX` → `INCR key` → `TTL key` を1往復（pipeline）で実行する。
 * `SET ... NX EX` は古いRedisでも使えるため、`EXPIRE ... NX`（Redis 7以降）より安全。
 */
async function consumeInUpstash(rule: RateLimitRule): Promise<RateLimitVerdict | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return null;

  try {
    const res = await fetch(`${base}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["SET", rule.key, "0", "EX", String(rule.windowSec), "NX"],
        ["INCR", rule.key],
        ["TTL", rule.key],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTASH_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[rate-limit] Upstash 応答エラー (${res.status})。インメモリで継続します。`);
      return null;
    }
    const rows = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    const count = Number(rows?.[1]?.result);
    const ttl = Number(rows?.[2]?.result);
    if (!Number.isFinite(count)) {
      console.error("[rate-limit] Upstash の応答を解釈できません。インメモリで継続します。");
      return null;
    }
    const retryAfterSec = Number.isFinite(ttl) && ttl > 0 ? ttl : rule.windowSec;
    return {
      allowed: count <= rule.limit,
      remaining: Math.max(0, rule.limit - count),
      retryAfterSec,
      backend: "upstash",
      key: rule.key,
    };
  } catch (e) {
    console.error("[rate-limit] Upstash への通信に失敗。インメモリで継続します:", e);
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * 公開API
 * ------------------------------------------------------------------ */

/** 1つのルールを1回消費して判定する。 */
export async function consumeRateLimit(rule: RateLimitRule): Promise<RateLimitVerdict> {
  if (isSharedStoreConfigured()) {
    const shared = await consumeInUpstash(rule);
    if (shared) return shared;
  }
  return consumeInMemory(rule);
}

/**
 * 複数ルールをまとめて消費し、**最初に引っかかったもの**を返す。
 * 引っかかっても後続のルールは消費する（同じ攻撃で複数の窓を進めたいため）。
 * 呼び出し側は rules の順序で「どのキーで止まったか」を判断できる。
 */
export async function consumeRateLimits(rules: RateLimitRule[]): Promise<RateLimitVerdict> {
  let denied: RateLimitVerdict | null = null;
  let last: RateLimitVerdict | null = null;
  for (const rule of rules) {
    const verdict = await consumeRateLimit(rule);
    last = verdict;
    if (!verdict.allowed && !denied) denied = verdict;
  }
  return denied ?? last ?? { allowed: true, remaining: 0, retryAfterSec: 0, backend: rateLimitBackend() };
}
