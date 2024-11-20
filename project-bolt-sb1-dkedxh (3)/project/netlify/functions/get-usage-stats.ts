import { Handler } from '@netlify/functions';
import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis credentials');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const date = new Date().toISOString().split('T')[0];
    const usageKey = `usage:${date}`;
    
    const dailyStats = await redis.hgetall(usageKey);
    
    // Get monthly stats
    const month = new Date().toISOString().slice(0, 7);
    const monthlyUsageKey = `usage:${month}:cost`;
    const monthlyCost = await redis.get(monthlyUsageKey) || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({
        daily: {
          total: Number(dailyStats?.total || 0),
          success: Number(dailyStats?.success || 0),
          failed: Number(dailyStats?.failed || 0),
          cost: Number(dailyStats?.cost || 0) / 100, // Convert cents to dollars
        },
        monthly: {
          cost: Number(monthlyCost) / 100,
        },
      }),
    };
  } catch (error) {
    console.error('Redis error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch usage statistics' }),
    };
  }
};