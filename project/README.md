# NZ Leave Calculator

A web application for calculating and verifying New Zealand leave entitlements and payments.

## Manual Deployment Instructions

1. **Prerequisites**
   - Node.js 18 or higher
   - npm 9 or higher
   - Git (optional)

2. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   ```

3. **Installation**
   ```bash
   # Install dependencies
   npm install
   ```

4. **Build**
   ```bash
   # Build the application and serverless functions
   npm run build:all
   ```

5. **Deploy to Netlify**
   
   Option 1: Using Netlify CLI
   ```bash
   # Install Netlify CLI globally
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Initialize site (first time only)
   netlify init

   # Deploy
   netlify deploy --prod
   ```

   Option 2: Manual Upload
   - Go to [Netlify](https://app.netlify.com)
   - Drag and drop the `dist` folder
   - Configure environment variables in site settings

## Environment Variables Setup

Add these environment variables in Netlify (Site settings > Environment variables):

- `OPENAI_API_KEY`: Your OpenAI API key
- `UPSTASH_REDIS_REST_URL`: Your Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis REST token

## Build Settings

If deploying through Netlify UI, use these build settings:
- Build command: `npm run build:all`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test
```

## License

MIT License - see LICENSE file for details