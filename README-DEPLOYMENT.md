# OneGateway Website - aaPanel Deployment Guide

This guide will help you deploy the OneGateway website on your aaPanel server.

## Prerequisites

- aaPanel installed and configured
- Node.js 18+ installed on your server
- Domain name configured (onegateway.in)
- SSL certificate (Let's Encrypt recommended)

## Deployment Steps

### 1. Server Setup

1. **Install Node.js 18+**
   ```bash
   # Through aaPanel Software Store or manually:
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2 globally**
   ```bash
   npm install -g pm2
   ```

### 2. Project Deployment

1. **Upload project files** to `/www/wwwroot/onegateway.in/`

2. **Set up environment variables**
   ```bash
   cp .env.production .env
   # Edit .env with your actual values
   nano .env
   ```

3. **Run deployment script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 3. aaPanel Configuration

1. **Create Website in aaPanel**
   - Domain: `onegateway.in`
   - Document Root: `/www/wwwroot/onegateway.in/dist`
   - PHP Version: Not required (Static site)

2. **Configure Nginx**
   - Copy the contents of `nginx.conf` to your site's Nginx configuration
   - Or use the aaPanel interface to set up the configuration

3. **SSL Certificate**
   - Use aaPanel's SSL feature to install Let's Encrypt certificate
   - Enable "Force HTTPS"

4. **Set up Reverse Proxy** (if using PM2)
   - Target URL: `http://127.0.0.1:3000`
   - Enable for dynamic content if needed

### 4. Environment Variables

Update `.env` file with your actual values:

```env
NODE_ENV=production
PORT=3000

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Analytics
VITE_GA_MEASUREMENT_ID=GA_MEASUREMENT_ID
VITE_FB_PIXEL_ID=YOUR_PIXEL_ID
```

### 5. Monitoring and Maintenance

1. **Check PM2 Status**
   ```bash
   pm2 status
   pm2 logs onegateway-website
   ```

2. **Restart Application**
   ```bash
   pm2 restart onegateway-website
   ```

3. **Update Deployment**
   ```bash
   git pull origin main  # if using git
   npm run build:production
   pm2 restart onegateway-website
   ```

## File Structure

```
/www/wwwroot/onegateway.in/
├── dist/                 # Built files (served by Nginx)
├── src/                  # Source code
├── public/               # Static assets
├── logs/                 # Application logs
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── ecosystem.config.js   # PM2 configuration
├── deploy.sh            # Deployment script
└── nginx.conf           # Nginx configuration
```

## Performance Optimization

1. **Enable Gzip** in aaPanel
2. **Set up CDN** for static assets
3. **Configure caching** headers
4. **Monitor performance** with PM2

## Security

1. **Firewall**: Only allow necessary ports (80, 443, 22)
2. **SSL**: Always use HTTPS
3. **Headers**: Security headers are configured in Nginx
4. **Updates**: Keep Node.js and dependencies updated

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change PORT in .env if 3000 is occupied
2. **Permission issues**: Ensure proper file permissions
3. **Build failures**: Check Node.js version and dependencies
4. **SSL issues**: Verify certificate installation in aaPanel

### Logs

- **Application logs**: `pm2 logs onegateway-website`
- **Nginx logs**: `/www/wwwlogs/onegateway.in.log`
- **Error logs**: `/www/wwwlogs/onegateway.in.error.log`

## Support

For deployment issues:
1. Check the logs first
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Contact support at support@onegateway.in

## Backup

Regular backups recommended:
- Database (Supabase handles this)
- Environment files
- Custom configurations
- SSL certificates (if self-managed)