/**
 * Host half of the model-pick chip.
 *
 * The model menu itself is pure client code. This file exists because the
 * DeepSeek account wallet is only reachable from the Host: the panel asks
 * `POST /mpc/balance` and gets the same envelope `remote.account.getBalance`
 * would have produced. Reading the balance happens here so the request carries
 * the desktop client headers the platform requires (without them the same
 * token is answered with `{"code":40003,"msg":"Authorization Failed"}`, which
 * looks like an expired login and is not one).
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

/** Channel prefix; must match `CHANNEL_PATTERN` in @deepseek-ai/dsh-client-connection. */
const CHANNEL = '/mpc';

/** Wallet endpoint plus the client identity the platform demands. */
const PLATFORM_ORIGIN = 'https://platform.deepseek.com';
const SUMMARY_PATH = '/api/v0/users/get_user_summary';
const CLIENT_HEADERS = {
  'x-client-bundle-id': '',
  'x-client-platform': 'desktop-win',
  'x-client-version': '0.2.2-rc.3',
  'x-client-locale': 'zh_CN',
  'x-client-timezone-offset': String(-new Date().getTimezoneOffset() * 60),
};

/** Grant record name inside `.dsh/.credentials.yaml`. */
const GRANT_KEY = 'deepseek-account-platform/default';

const LOG_FILE = join(tmpdir(), 'mpc-balance.log');
const BALANCE_TIMEOUT_MS = 20_000;

function log(message) {
  try {
    appendFileSync(LOG_FILE, `${new Date().toISOString()} ${message}\n`);
  } catch (error) {
    // Diagnostics must never break a panel request.
  }
}

/**
 * Read the platform grant without the credential service, whose record API is
 * not part of the documented plugin surface. The store is a small YAML file
 * whose `records.<name>` entries are plain `key: value` pairs.
 * @returns `{ token, issuer }` or null when the account never signed in.
 */
function readGrant() {
  const file = join(homedir(), '.dsh', '.credentials.yaml');
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  let current = null;
  const record = {};
  for (const line of lines) {
    const head = /^ {2}([^:\s][^:]*):\s*$/.exec(line);
    if (head !== null) {
      current = head[1].trim();
      continue;
    }
    if (current !== GRANT_KEY) continue;
    const field = /^ {6}([A-Za-z]+):\s*(.*)$/.exec(line);
    if (field !== null) record[field[1]] = field[2].trim();
  }
  if (typeof record.token !== 'string' || record.token === '') return null;
  const issuer = typeof record.issuer === 'string' && record.issuer !== '' ? record.issuer : PLATFORM_ORIGIN;
  return { token: record.token, issuer };
}

function walletList(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((wallet) => wallet !== null && typeof wallet === 'object')
    .map((wallet) => ({ currency: String(wallet.currency || 'CNY'), balance: String(wallet.balance || '0') }));
}

/**
 * Fetch the wallet summary and project it like the account remote does, so the
 * panel can render both paths with one piece of code.
 * @returns `{ ok: true, value }` or `{ ok: false, reason, message }`.
 */
async function readBalance() {
  const grant = readGrant();
  if (grant === null) {
    log('no platform grant in .credentials.yaml');
    return { ok: false, reason: 'signed-out' };
  }
  const origin = grant.issuer.replace(/\/+$/, '');
  const url = `${origin}${SUMMARY_PATH}`;
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      redirect: 'error',
      headers: { ...CLIENT_HEADERS, 'x-dsh-auth-token': grant.token, accept: 'application/json' },
      signal: AbortSignal.timeout(BALANCE_TIMEOUT_MS),
    });
  } catch (error) {
    log(`fetch failed: ${(error && error.name) || 'Error'} ${(error && error.message) || error} cause=${(error && error.cause && (error.cause.code || error.cause.message)) || ''}`);
    return { ok: false, reason: 'failed', message: String((error && error.message) || error) };
  }
  const text = await response.text();
  if (!response.ok) {
    log(`http ${response.status} ${text.slice(0, 200)}`);
    return { ok: false, reason: 'failed', message: `HTTP ${response.status}` };
  }
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch (error) {
    log(`not json: ${text.slice(0, 200)}`);
    return { ok: false, reason: 'failed', message: 'platform answered with non-JSON' };
  }
  if (payload === null || typeof payload !== 'object') {
    return { ok: false, reason: 'failed', message: 'platform answered with an empty body' };
  }
  if (payload.code === 40003 || payload.code === 40002) {
    // 40002 = missing token, 40003 = the platform refused this grant.
    log(`auth rejected: ${text.slice(0, 200)}`);
    return { ok: false, reason: 'signed-out', message: String(payload.msg || payload.code) };
  }
  const data = payload.data;
  if (payload.code !== 0 || data === null || typeof data !== 'object' || data.biz_code !== 0) {
    log(`business code rejected: ${text.slice(0, 200)}`);
    return { ok: false, reason: 'failed', message: `biz_code ${data && data.biz_code}` };
  }
  const detail = data.biz_data;
  if (detail === null || typeof detail !== 'object') {
    return { ok: false, reason: 'empty' };
  }
  const value = walletList(detail.normal_wallets);
  const bonusWallets = walletList(detail.bonus_wallets);
  if (value.length === 0 && bonusWallets.length === 0) return { ok: false, reason: 'empty' };
  return { ok: true, value: { status: 'ready', value, bonusWallets } };
}

/** Same envelope shape as the panel's HTTP channel in the sibling plugin. */
const channelHandler = async (endpoint) => {
  if (endpoint !== 'balance') {
    return { ok: false, error: { code: 'gateway/bad-request', message: `unknown endpoint ${JSON.stringify(endpoint)}`, details: {} } };
  }
  try {
    const answer = await readBalance();
    if (answer.ok === true) return { ok: true, value: answer.value };
    return {
      ok: false,
      error: {
        code: 'mpc/balance-failed',
        message: answer.message || answer.reason,
        details: { reason: answer.reason },
      },
    };
  } catch (error) {
    log(`unexpected: ${(error && error.stack) || error}`);
    return {
      ok: false,
      error: { code: 'mpc/balance-failed', message: String((error && error.message) || error), details: { reason: 'error' } },
    };
  }
};

/** Raw fallback used when only `webServer` is reachable. */
const rawRoute = async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  const chunks = [];
  try {
    for await (const chunk of req) chunks.push(chunk);
  } catch (error) {
    res.writeHead(400);
    res.end('body unreadable');
    return;
  }
  let body = null;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    res.writeHead(400);
    res.end('body is not JSON');
    return;
  }
  const result = await channelHandler(body && body.method);
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ type: 'server-response', rpcId: body && body.rpcId, result }));
};

export function apply(ctx) {
  let mounted = false;
  const tryMount = (label, mount) => {
    if (mounted) return;
    try {
      mount();
      mounted = true;
      log(`channel mounted via ${label}`);
    } catch (error) {
      log(`channel ${label} failed: ${(error && error.message) || error}`);
    }
  };

  // `connection.rpc.handle` registers through an effect that cannot resolve
  // `webServer` on every Host build, so every strategy is tried in order.
  ctx.inject(['connection', 'webServer'], (liveCtx) => {
    tryMount('connection.rpc.effect', () => {
      liveCtx.effect(() => liveCtx.connection.rpc.handle(CHANNEL, channelHandler), 'model-pick-chip: rpc channel');
    });
    tryMount('connection.rpc.direct', () => {
      liveCtx.connection.rpc.handle(CHANNEL, channelHandler);
    });
    tryMount('webServer.effect', () => {
      liveCtx.effect(() => liveCtx.webServer.register({ kind: 'prefix', path: CHANNEL, handler: rawRoute }), 'model-pick-chip: raw route');
    });
    tryMount('webServer.direct', () => {
      liveCtx.webServer.register({ kind: 'prefix', path: CHANNEL, handler: rawRoute });
    });
  });
}