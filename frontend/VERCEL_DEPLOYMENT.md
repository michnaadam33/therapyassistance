# 🚀 Vercel Deployment Guide - TherapyAssistance Frontend

## 📋 Quick Deploy

### Prerequisites
- GitHub account
- Vercel account (free): https://vercel.com
- Backend deployed on Mikrus VPS

---

## 🎯 Step-by-Step Deployment

### 1. Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

### 2. Import Project to Vercel

1. Go to: https://vercel.com/new
2. Click **"Import Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository: `therapyassistance`

---

### 3. Configure Project Settings

#### Framework Preset
- **Framework:** Vite
- **Root Directory:** `frontend`

#### Build Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

#### Node.js Version
- **Recommended:** 18.x

---

### 4. Environment Variables

Click **"Environment Variables"** and add:

| Name | Value | Description |
|------|-------|-------------|
| `VITE_API_URL` | `http://api.therapyassistance.io` | Your backend API URL |

**⚠️ IMPORTANT:** Make sure your backend is accessible at this URL!

---

### 5. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://therapyassistance.vercel.app`

---

## 🔧 Post-Deployment Configuration

### Update Backend CORS

After getting your Vercel URL, update CORS on your backend:

```bash
# SSH to your VPS (if applicable)
ssh root@your-server.com

# Edit .env
cd /opt/apps/therapyassistance
nano .env

# Update:
ALLOWED_ORIGINS=https://therapyassistance.vercel.app

# Restart backend
./deploy-mikrus.sh restart

# Update Nginx
nano /etc/nginx/sites-available/therapyassistance

# Find and update:
add_header Access-Control-Allow-Origin "https://therapyassistance.vercel.app" always;

# Reload Nginx
nginx -t && systemctl reload nginx
```

---

## 🌐 Custom Domain (Optional)

### 1. Buy a Domain
- nazwa.pl (~50 zł/year)
- OVH (~60 zł/year)
- Cloudflare (~50 zł/year)

### 2. Add to Vercel

1. Vercel Dashboard → Your Project
2. **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain: `therapyassistance.pl`
5. Follow DNS configuration instructions

### 3. Configure DNS

Add these records to your domain DNS:

**For apex domain (therapyassistance.pl):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. Wait for SSL

Vercel automatically provisions SSL certificate (5-10 minutes).

---

## 🔄 Automatic Deployments

### Production Deployments
- **Trigger:** Push to `main` branch
- **URL:** Your production URL
- **Automatic:** Yes

### Preview Deployments
- **Trigger:** Push to any other branch or Pull Request
- **URL:** Unique preview URL
- **Automatic:** Yes

### Manual Redeploy

If you need to redeploy without code changes:

1. Vercel Dashboard → Your Project
2. **Deployments**
3. Click **⋯** menu on latest deployment
4. Click **"Redeploy"**

---

## 🛠️ Updating Environment Variables

### When to Update:
- Backend URL changed
- New environment variable added
- Switching from HTTP to HTTPS

### How to Update:

1. Vercel Dashboard → Your Project
2. **Settings** → **Environment Variables**
3. Edit `VITE_API_URL` or add new variables
4. Click **"Save"**
5. **⚠️ IMPORTANT:** Redeploy project!
   - Go to Deployments → ⋯ → Redeploy

---

## 📊 Monitoring & Analytics

### Build Logs

View build logs for each deployment:
1. Deployments → Click on deployment
2. See **Building** tab

### Runtime Logs

View runtime logs:
1. Project → Runtime Logs
2. Filter by time period

### Analytics (Optional)

Enable Vercel Analytics:
1. Project → Analytics
2. Click **"Enable"**
3. Follow instructions to add to React app

---

## 🐛 Troubleshooting

### Build Failed

**Check Build Logs:**
1. Deployments → Failed deployment → Building tab

**Common Issues:**
- TypeScript errors → Fix locally first
- Missing dependencies → Check `package.json`
- Wrong Node.js version → Settings → Node.js Version → 18.x

**Fix Locally:**
```bash
cd frontend
npm install
npm run build
npm run preview  # Test production build
```

### Frontend Can't Connect to Backend

**Checklist:**
1. ✅ `VITE_API_URL` set in Vercel?
2. ✅ URL uses HTTPS (not HTTP)?
3. ✅ CORS configured on backend?
4. ✅ Backend is accessible: `curl https://m1234.mikr.us/health`
5. ✅ Browser Console shows no CORS errors?

**Test Backend:**
```bash
curl http://api.therapyassistance.io/health
# Should return: {"status":"healthy"}
```

### Blank Page / White Screen

**Possible Causes:**
- Build errors (check logs)
- JavaScript errors (check Browser Console - F12)
- Incorrect `base` in vite.config.ts

**Debug:**
1. Open Browser Console (F12)
2. Look for errors
3. Check Network tab for failed requests

### 404 on Routes

**Add to `vercel.json`:**
```json
{
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

This enables client-side routing.

---

## 💡 Performance Tips

### Enable Compression
Already configured in `vercel.json` via headers.

### Optimize Images
```bash
npm install sharp
# Use next/image or optimize images before deployment
```

### Code Splitting
Vite automatically does this. Check build output:
```bash
npm run build
# See chunk sizes in dist/
```

### Lazy Loading
```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

---

## 🔒 Security

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Vercel Environment Variables
- ✅ Prefix with `VITE_` for Vite apps
- ❌ Don't expose secrets in frontend

### HTTPS
- ✅ Automatic with Vercel
- ✅ SSL certificate auto-renewed
- ✅ Force HTTPS (automatic)

### Headers
Already configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 📈 Scaling

### Free Tier Limits
- **Bandwidth:** 100 GB/month
- **Build Time:** 6,000 minutes/month
- **Deployments:** Unlimited
- **Team Members:** 1

**For this app:** Free tier is more than enough!

### If You Exceed Limits
Vercel will email you. You can:
1. Upgrade to Pro ($20/month)
2. Optimize assets (smaller images, etc.)
3. Use CDN for large files

---

## 🆘 Support

### Documentation
- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev

### Community
- Vercel Discord: https://vercel.com/discord
- GitHub Discussions: https://github.com/vercel/vercel/discussions

### Contact
- Vercel Support: https://vercel.com/support
- Email: support@vercel.com

---

## ✅ Deployment Checklist

### Before Deploy:
- [ ] Code pushed to GitHub
- [ ] Backend deployed and accessible
- [ ] Backend URL: http://api.therapyassistance.io
- [ ] Vercel account created

### During Deploy:
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend`
- [ ] Framework set to Vite
- [ ] `VITE_API_URL` environment variable set
- [ ] Build successful

### After Deploy:
- [ ] Frontend accessible at Vercel URL
- [ ] CORS updated on backend (.env)
- [ ] CORS updated in Nginx config
- [ ] Backend restarted
- [ ] Login works
- [ ] All features work
- [ ] No console errors

---

## 🎉 Success!

Your frontend is now live on Vercel!

**Next Steps:**
1. ✅ Test all features
2. ✅ Setup custom domain (optional)
3. ✅ Enable analytics (optional)
4. ✅ Share with users!

**Auto-deploy is enabled:** Just `git push` to update! 🚀

---

**Questions?** Check the main [DEPLOYMENT_FAQ.md](../DEPLOYMENT_FAQ.md)