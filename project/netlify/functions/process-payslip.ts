import { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { Redis } from '@upstash/redis';

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable');
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash Redis credentials');
  throw new Error('Missing Upstash Redis credentials');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const RATE_LIMIT = 10;
const COST_PER_REQUEST = 0.03;
const MONTHLY_BUDGET = 50;

const SYSTEM_PROMPT = `You are a payslip analysis assistant. Extract the following information from the payslip image and format it exactly as shown in the example:
{
  "payPeriod": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  },
  "workedTime": {
    "workedTime": { "hours": "", "rate": "", "total": "" },
    "overtime": { "hours": "", "rate": "", "total": "" },
    "other": { "hours": "", "rate": "", "total": "" }
  },
  "bapsLeave": {
    "sickLeave": { "time": "", "rate": "", "unit": "hours", "total": "" },
    "publicHolidays": { "time": "", "rate": "", "unit": "hours", "total": "" },
    "other": { "time": "", "rate": "", "unit": "hours", "total": "" }
  },
  "holidayPay": {
    "annualLeave": { "time": "", "rate": "", "unit": "hours", "total": "" },
    "other": { "time": "", "rate": "", "unit": "hours", "total": "" }
  },
  "ytdEarnings": {
    "total": ""
  },
  "employmentConditions": {
    "hoursPerDay": "8",
    "daysPerWeek": "5",
    "startDate": "",
    "ordinaryPay": {
      "amount": "",
      "type": "hourly",
      "allowBelowMinimum": false
    }
  }
}`;

async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const requests = await redis.incr(key);
  
  if (requests === 1) {
    await redis.expire(key, 86400);
  }
  
  return requests <= RATE_LIMIT;
}

async function trackUsage(ip: string, success: boolean): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  const usageKey = `usage:${date}`;
  
  await redis.hincrby(usageKey, 'total', 1);
  await redis.hincrby(usageKey, success ? 'success' : 'failed', 1);
  await redis.hincrby(usageKey, 'cost', Math.floor(COST_PER_REQUEST * 100));
  await redis.expire(usageKey, 7776000);
}

async function checkBudget(): Promise<boolean> {
  const month = new Date().toISOString().slice(0, 7);
  const monthlyUsageKey = `usage:${month}:cost`;
  const monthlyUsage = await redis.get(monthlyUsageKey) || 0;
  
  return Number(monthlyUsage) < MONTHLY_BUDGET * 100;
}

export const handler: Handler = async (event) => {
  console.log('Function invoked with method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const ip = event.headers['x-forwarded-for'] || 'unknown';

  try {
    const withinLimit = await checkRateLimit(ip);
    if (!withinLimit) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Rate limit exceeded' }),
      };
    }

    const withinBudget = await checkBudget();
    if (!withinBudget) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Monthly budget exceeded' }),
      };
    }

    const { image } = JSON.parse(event.body || '{}');
    if (!image) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Image data is required' }),
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this payslip and extract the information in the specified JSON format.'
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      await trackUsage(ip, false);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No response from AI model' }),
      };
    }

    try {
      const parsedResult = JSON.parse(result.trim());
      await trackUsage(ip, true);
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedResult),
      };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      await trackUsage(ip, false);
      return {
        statusCode: 422,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Failed to parse AI response',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
      };
    }
  } catch (error) {
    console.error('Function error:', error);
    await trackUsage(ip, false);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};