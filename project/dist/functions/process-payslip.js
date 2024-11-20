"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const openai_1 = __importDefault(require("openai"));
const redis_1 = require("@upstash/redis");
if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY environment variable');
    throw new Error('Missing OPENAI_API_KEY environment variable');
}
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('Missing Upstash Redis credentials');
    throw new Error('Missing Upstash Redis credentials');
}
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const redis = new redis_1.Redis({
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
async function checkRateLimit(ip) {
    const key = `ratelimit:${ip}`;
    const requests = await redis.incr(key);
    if (requests === 1) {
        await redis.expire(key, 86400);
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
function validatePayslipData(data) {
    try {
        if (!data || typeof data !== 'object') {
            console.log('Data validation failed: not an object');
            return false;
        }
        const requiredProps = ['payPeriod', 'workedTime', 'bapsLeave', 'holidayPay', 'ytdEarnings', 'employmentConditions'];
        for (const prop of requiredProps) {
            if (!(prop in data)) {
                console.log(`Data validation failed: missing ${prop}`);
                return false;
            }
        }
        if (!data.payPeriod?.startDate || !data.payPeriod?.endDate) {
            console.log('Data validation failed: invalid payPeriod');
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('Data validation error:', error);
        return false;
    }
}
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
        console.log('Checking rate limit...');
        const withinLimit = await checkRateLimit(ip);
        if (!withinLimit) {
            return {
                statusCode: 429,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Rate limit exceeded' }),
            };
        }
        console.log('Checking budget...');
        const withinBudget = await checkBudget();
        if (!withinBudget) {
            return {
                statusCode: 429,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Monthly budget exceeded' }),
            };
        }
        if (!event.body) {
            console.log('No request body provided');
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Request body is required' }),
            };
        }
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        }
        catch (error) {
            console.error('Failed to parse request body:', error);
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Invalid JSON in request body' }),
            };
        }
        const { image } = requestBody;
        if (!image) {
            console.log('No image data provided');
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Image data is required' }),
            };
        }
        console.log('Calling OpenAI API...');
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
        console.log('OpenAI API response received');
        const result = response.choices[0]?.message?.content;
        if (!result) {
            console.error('No content in OpenAI response');
            await trackUsage(ip, false);
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'No response from AI model' }),
            };
        }
        console.log('Parsing OpenAI response...');
        let parsedResult;
        try {
            parsedResult = JSON.parse(result.trim());
        }
        catch (error) {
            console.error('Failed to parse OpenAI response:', error);
            console.log('Raw response:', result);
            await trackUsage(ip, false);
            return {
                statusCode: 422,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Failed to parse AI response',
                    details: error instanceof Error ? error.message : 'Unknown error',
                    raw: result
                }),
            };
        }
        console.log('Validating parsed data...');
        if (!validatePayslipData(parsedResult)) {
            console.error('Invalid data structure in response');
            await trackUsage(ip, false);
            return {
                statusCode: 422,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid data structure in AI response',
                    raw: parsedResult
                }),
            };
        }
        console.log('Processing successful');
        await trackUsage(ip, true);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedResult),
        };
    }
    catch (error) {
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
exports.handler = handler;
