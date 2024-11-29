// @ts-check
const OpenAI = require('openai');
const { Redis } = require('@upstash/redis');

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
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

const SYSTEM_PROMPT = `
You are a payslip analysis expert. Analyze the payslip image and extract the following information in JSON format:
{
  "payPeriod": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  },
  "workedTime": {
    "workedTime": { "hours": "string", "rate": "string", "total": "string" },
    "overtime": { "hours": "string", "rate": "string", "total": "string" },
    "other": { "hours": "string", "rate": "string", "total": "string" }
  },
  "bapsLeave": {
    "sickLeave": { "time": "string", "rate": "string", "unit": "hours", "total": "string" },
    "publicHolidays": { "time": "string", "rate": "string", "unit": "hours", "total": "string" },
    "other": { "time": "string", "rate": "string", "unit": "hours", "total": "string" }
  },
  "holidayPay": {
    "annualLeave": { "time": "string", "rate": "string", "unit": "hours", "total": "string" },
    "other": { "time": "string", "rate": "string", "unit": "hours", "total": "string" }
  },
  "ytdEarnings": {
    "total": "string"
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
}

Extract all visible amounts, dates, and rates. Use empty strings for missing values. Convert all monetary values to strings without currency symbols.`;

async function checkRateLimit(ip) {
  const key = `ratelimit:${ip}`;
  const requests = await redis.incr(key);
  
  if (requests === 1) {
    await redis.expire(key, 86400); // 24 hours
  }
  
  return requests <= RATE_LIMIT;
}

async function trackUsage(ip, success) {
  const date = new Date().toISOString().split('T')[0];
  const usageKey = `usage:${date}`;
  
  await redis.hincrby(usageKey, 'total', 1);
  await redis.hincrby(usageKey, success ? 'success' : 'failed', 1);
  await redis.hincrby(usageKey, 'cost', Math.floor(COST_PER_REQUEST * 100));
  await redis.expire(usageKey, 7776000); // 90 days
}

async function checkBudget() {
  const month = new Date().toISOString().slice(0, 7);
  const monthlyUsageKey = `usage:${month}:cost`;
  const monthlyUsage = await redis.get(monthlyUsageKey) || 0;
  
  return Number(monthlyUsage) < MONTHLY_BUDGET * 100;
}

/**
 * @type {import('@netlify/functions').Handler}
 */
const handler = async (event) => {
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
        body: JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      };
    }

    const withinBudget = await checkBudget();
    if (!withinBudget) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Monthly processing limit reached. Please try again next month.' }),
      };
    }

    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    const { image } = requestBody;
    if (!image) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Image data is required' }),
      };
    }

    console.log('Sending request to OpenAI...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract payslip information in the specified JSON format.' },
            { 
              type: 'image_url',
              image_url: { url: image }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1,
    });

    console.log('Received response from OpenAI');
    const result = response.choices[0]?.message?.content;
    
    if (!result) {
      console.error('No content in OpenAI response');
      await trackUsage(ip, false);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to process payslip' }),
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
      console.error('Raw response:', result);
      await trackUsage(ip, false);
      return {
        statusCode: 422,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Failed to parse extracted data',
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

module.exports = { handler };