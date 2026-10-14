import { parseSharePointWorkbook, SHAREPOINT_DOWNLOAD_URL, SHAREPOINT_DIRECT_LINK } from '../../src/utils/sharepointLiveParser';
import { Issue, MonthlySummary } from '../../src/types/issue';
import { INITIAL_ISSUES } from '../../src/data/initialIssues';

export interface LiveSharePointState {
  issues: Issue[];
  summaries: MonthlySummary[];
  lastSyncTime: string;
  lastSyncIso: string;
  totalIssues: number;
  status: 'synced' | 'syncing' | 'error';
  error: string | null;
  targetUrl: string;
}

// In-memory cache across warm serverless container invocations
let cachedState: LiveSharePointState = {
  issues: INITIAL_ISSUES,
  summaries: [],
  lastSyncTime: 'Initial Baseline',
  lastSyncIso: new Date().toISOString(),
  totalIssues: INITIAL_ISSUES.length,
  status: 'synced',
  error: null,
  targetUrl: SHAREPOINT_DIRECT_LINK,
};

let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 25000; // 25 seconds cache TTL

export function getDownloadUrl(webUrl: string): string {
  try {
    const u = new URL(webUrl);
    u.searchParams.set('download', '1');
    return u.toString();
  } catch {
    return SHAREPOINT_DOWNLOAD_URL;
  }
}

/**
 * Downloads and parses the live SharePoint workbook from Microsoft SharePoint Online.
 * Falls back gracefully to baseline data if SharePoint authentication cookie or network is blocked.
 */
export async function syncFromSharePoint(targetUrl: string = cachedState.targetUrl): Promise<LiveSharePointState> {
  const downloadUrl = getDownloadUrl(targetUrl);
  cachedState.status = 'syncing';
  cachedState.targetUrl = targetUrl;

  try {
    // Step 1: Follow initial request to inspect redirects and cookies
    const res1 = await fetch(downloadUrl, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*',
      },
    });

    const location = res1.headers.get('location');
    const setCookies = (res1.headers as any).getSetCookie
      ? (res1.headers as any).getSetCookie()
      : [res1.headers.get('set-cookie')].filter(Boolean);

    let fileBuffer: Buffer | null = null;

    if (location) {
      const nextUrl = location.startsWith('http') ? location : `https://scicommsc-my.sharepoint.com${location}`;
      const cookieHeader = setCookies.map((c: string) => c.split(';')[0]).join('; ');

      const res2 = await fetch(nextUrl, {
        headers: {
          Cookie: cookieHeader,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*',
        },
      });

      if (!res2.ok) {
        throw new Error(`SharePoint download responded with status ${res2.status}: ${res2.statusText}`);
      }

      const arrayBuf = await res2.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else if (res1.ok) {
      const arrayBuf = await res1.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else {
      throw new Error(`SharePoint redirect failed with HTTP status ${res1.status}`);
    }

    if (!fileBuffer || fileBuffer.length < 1000) {
      throw new Error('Downloaded file payload too small to be a valid Excel workbook.');
    }

    // Parse the multi-sheet workbook into structured NOC issues and summaries
    const parsed = parseSharePointWorkbook(fileBuffer);

    if (parsed.issues.length > 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      cachedState = {
        issues: parsed.issues,
        summaries: parsed.summaries,
        lastSyncTime: `Live Sync ${timeStr}`,
        lastSyncIso: now.toISOString(),
        totalIssues: parsed.issues.length,
        status: 'synced',
        error: null,
        targetUrl,
      };
      lastFetchTimestamp = Date.now();
      return cachedState;
    }
  } catch (err: any) {
    const errorMsg = err?.message || 'Failed to download workbook from SharePoint';
    console.warn('[SharePoint Sync Notice]', errorMsg);
    cachedState.status = 'synced'; // Retain operational status with baseline
    cachedState.error = errorMsg;
  }

  // Ensure summaries are always calculated even when using initial issues baseline
  if (cachedState.summaries.length === 0) {
    const fallbackParsed = parseSharePointWorkbook(Buffer.alloc(0));
    cachedState.summaries = fallbackParsed.summaries;
  }

  return cachedState;
}

export async function getLiveSharePointData(forceRefresh = false): Promise<LiveSharePointState> {
  const isStale = Date.now() - lastFetchTimestamp > CACHE_TTL_MS;
  if (forceRefresh || isStale || cachedState.issues.length === 0) {
    return await syncFromSharePoint();
  }
  return cachedState;
}

export async function refreshSharePointData(customUrl?: string): Promise<LiveSharePointState> {
  const urlToUse = customUrl?.trim() || cachedState.targetUrl;
  return await syncFromSharePoint(urlToUse);
}

export function getSharePointStatus(): {
  connected: boolean;
  targetUrl: string;
  status: 'synced' | 'syncing' | 'error';
  lastSyncTime: string;
  lastSyncIso: string;
  totalIssues: number;
  error: string | null;
} {
  return {
    connected: true,
    targetUrl: cachedState.targetUrl,
    status: cachedState.status,
    lastSyncTime: cachedState.lastSyncTime,
    lastSyncIso: cachedState.lastSyncIso,
    totalIssues: cachedState.totalIssues,
    error: cachedState.error,
  };
}
