# Vercel Deployment Guide for DoorMedExpress

## Prerequisites
1. A Vercel account
2. A PostgreSQL database (Vercel Postgres, Neon, Supabase, or any other provider)
3. All required API keys and credentials

## Step 1: Set Up Database

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Create a new Postgres database
4. Vercel will automatically provide `DATABASE_URL` and `DIRECT_URL`

### Option B: External Database (Neon, Supabase, etc.)
1. Create a PostgreSQL database with your provider
2. Get both connection strings:
   - **DATABASE_URL**: Pooled connection (for queries)
   - **DIRECT_URL**: Direct connection (for migrations)

## Step 2: Configure Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

### Required Variables:

```bash
# Database (automatically set if using Vercel Postgres)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# JWT Secret (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# App URL (your Vercel deployment URL)
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Xendit (Payment Gateway)
XENDIT_SECRET_KEY="xnd_development_your_secret_key"
XENDIT_PUBLIC_KEY="xnd_public_development_your_public_key"

# Resend (Email Service)
RESEND_API_KEY="re_your_api_key"
RESEND_FROM="DoorMedExpress <onboarding@resend.dev>"

# Stripe (Optional - if using Stripe)
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

## Step 3: Push Database Schema

After setting up environment variables, you need to push your Prisma schema to the database:

### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Push database schema
npx prisma db push

# (Optional) Seed the database
npm run db:seed
```

### Option B: Manually
1. Copy your `DATABASE_URL` from Vercel
2. Add it to your local `.env` file temporarily
3. Run: `npx prisma db push`
4. Run: `npm run db:seed` (optional)
5. Remove the production DATABASE_URL from your local `.env`

## Step 4: Deploy

### Automatic Deployment (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on every push to main branch

### Manual Deployment
```bash
vercel --prod
```

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Check that the homepage loads correctly
3. Try signing up for a new account
4. Test the onboarding flow
5. Check admin panel (if you have admin credentials)

## Troubleshooting

### Build Error: "Prisma Client not generated"
- **Solution**: The `postinstall` script in `package.json` should handle this automatically
- If it persists, check that `prisma` is in `devDependencies`

### Database Connection Error
- **Solution**: Verify `DATABASE_URL` and `DIRECT_URL` are correctly set in Vercel
- For Vercel Postgres, make sure the database is in the same region as your deployment

### Environment Variables Not Working
- **Solution**: Make sure to redeploy after adding/changing environment variables
- Variables are only available after a new deployment

### Images Not Uploading
- **Solution**: Verify Cloudinary credentials are correct
- Check that `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set

### Email Not Sending
- **Solution**: Verify Resend API key is correct
- Check that `RESEND_API_KEY` and `RESEND_FROM` are set
- Make sure the sender email is verified in Resend

## Important Notes

1. **Database Migrations**: Always run `prisma db push` or `prisma migrate deploy` after schema changes
2. **Environment Variables**: Never commit `.env` file to Git
3. **Secrets**: Use strong, random strings for `JWT_SECRET`
4. **Production URLs**: Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
5. **Payment Gateway**: Use test keys for development, production keys for live deployment

## Post-Deployment Checklist

- [ ] Database schema pushed successfully
- [ ] All environment variables configured
- [ ] Homepage loads without errors
- [ ] User signup/login works
- [ ] Onboarding flow completes
- [ ] Admin panel accessible
- [ ] Image uploads work (Cloudinary)
- [ ] Email sending works (Resend)
- [ ] Payment processing works (Xendit)
- [ ] Rider registration works
- [ ] Order flow works end-to-end

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
