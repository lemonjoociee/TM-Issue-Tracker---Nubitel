import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { refreshSharePointData } from './sharepointHelper';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Pragma, Cache-Control',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    let customUrl: string | undefined;

    if (event.body) {
      try {
        const payload = JSON.parse(event.body);
        if (payload && typeof payload.url === 'string' && payload.url.trim().length > 0) {
          customUrl = payload.url.trim();
        }
      } catch {
        // Body was not JSON; ignore and proceed with default link
      }
    }

    const refreshed = await refreshSharePointData(customUrl);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
      body: JSON.stringify({
        success: true,
        issues: refreshed.issues,
        summaries: refreshed.summaries,
        lastSyncTime: refreshed.lastSyncTime,
        lastSyncIso: refreshed.lastSyncIso,
        totalIssues: refreshed.totalIssues,
        status: refreshed.status,
        targetUrl: refreshed.targetUrl,
        dataHash: refreshed.dataHash,
        error: refreshed.error,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache',
      },
      body: JSON.stringify({
        success: false,
        error: error?.message || 'Failed to refresh SharePoint workbook',
      }),
    };
  }
};
