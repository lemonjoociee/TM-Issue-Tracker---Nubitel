import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { getLiveSharePointData } from './sharepointHelper';

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
    const forceRefresh = event.queryStringParameters?.force === 'true';
    const liveData = await getLiveSharePointData(forceRefresh);

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
        issues: liveData.issues,
        summaries: liveData.summaries,
        lastSyncTime: liveData.lastSyncTime,
        lastSyncIso: liveData.lastSyncIso,
        totalIssues: liveData.totalIssues,
        status: liveData.status,
        targetUrl: liveData.targetUrl,
        dataHash: liveData.dataHash,
        error: liveData.error,
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
        error: error?.message || 'Internal Server Error in sharepoint-live function',
      }),
    };
  }
};
