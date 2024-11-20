# NZ Leave Calculator

A web application for calculating and verifying New Zealand leave entitlements and payments.

## Manual Deployment Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd nz-leave-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
Create a `.env` file in the root directory with the following variables:
```env
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
OPENAI_API_KEY=your_openai_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

4. Build the project:
```bash
npm run build:all
```

5. Deploy to Netlify:
   - Install Netlify CLI: `npm install -g netlify-cli`
   - Login to Netlify: `netlify login`
   - Initialize site: `netlify init`
   - Deploy: `netlify deploy --prod`

   Or deploy manually through Netlify UI:
   - Go to [Netlify](https://app.netlify.com)
   - Drag and drop the `dist` folder
   - Configure environment variables in site settings

## Environment Variables Setup in Netlify

Add these environment variables in Netlify (Site settings > Environment variables):

- `OPENAI_API_KEY`: Your OpenAI API key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `UPSTASH_REDIS_REST_URL`: Your Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis REST token

## Build Settings

If deploying through Netlify UI, use these build settings:
- Build command: `npm run build:all`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Development

Start the development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

## License

MIT License - see LICENSE file for details