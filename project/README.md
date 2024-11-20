# NZ Leave Calculator

A web application for calculating and verifying New Zealand leave entitlements and payments.

## Deployment Instructions

1. Fork or clone this repository
2. Set up environment variables in Netlify:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `UPSTASH_REDIS_REST_URL`: Your Upstash Redis REST URL
   - `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis REST token

3. Connect your GitHub repository to Netlify:
   - Go to Netlify dashboard
   - Click "Add new site" > "Import an existing project"
   - Choose your GitHub repository
   - Use these build settings:
     - Build command: `npm run build:all`
     - Publish directory: `dist`
     - Functions directory: `dist/functions`

4. Deploy:
   - Netlify will automatically deploy when you push to the main branch
   - You can also trigger manual deploys from the Netlify dashboard

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build:all

# Run tests
npm test
```

## Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Redis Configuration
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## License

MIT License - see LICENSE file for details