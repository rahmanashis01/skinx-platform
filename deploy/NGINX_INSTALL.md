# Nginx Installation Guide - SkinX Platform

This guide provides step-by-step instructions for installing and configuring Nginx as a reverse proxy for the SkinX platform.

## Prerequisites

- Ubuntu 20.04+ or Debian 11+ VPS
- Docker and Docker Compose installed
- Domain configured in Cloudflare DNS (skin-x.app pointing to VPS IP)
- Root or sudo access

## Step 1: Install Nginx

```bash
# Update package list
sudo apt update

# Install Nginx
sudo apt install -y nginx

# Verify installation
nginx -v
```

## Step 2: Install Certbot (for SSL/TLS)

```bash
# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

## Step 3: Deploy Nginx Configuration

From your local `skinx_platform` repository:

### Option A: Copy Directly from Repository

```bash
# If you have the repository on the server
cd /path/to/skinx_platform

# Copy configuration
sudo cp nginx/skinx.conf /etc/nginx/sites-available/skinx.conf

# Create symbolic link to enable the site
sudo ln -sf /etc/nginx/sites-available/skinx.conf /etc/nginx/sites-enabled/skinx.conf
```

### Option B: Upload from Local Machine

```bash
# From your local machine (in skinx_platform directory)
scp nginx/skinx.conf "${VPS_USER}@${VPS_HOST}:/tmp/"

# Then on the server
sudo mv /tmp/skinx.conf /etc/nginx/sites-available/skinx.conf
sudo ln -sf /etc/nginx/sites-available/skinx.conf /etc/nginx/sites-enabled/skinx.conf
```

## Step 4: Remove Default Nginx Site

```bash
# Disable default site (optional but recommended)
sudo rm /etc/nginx/sites-enabled/default

# Verify it's removed
ls -la /etc/nginx/sites-enabled/
```

## Step 5: Configure WebSocket Support

Edit the main Nginx configuration to add WebSocket map:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add this inside the `http` block (before any `server` or `include` statements):

```nginx
http {
    # ... existing settings ...
    
    # WebSocket upgrade support
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    
    # ... rest of the config ...
}
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

## Step 6: Test Nginx Configuration

```bash
# Test configuration syntax
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If you see errors, review the configuration file and fix any issues.

## Step 7: Restart Nginx

```bash
# Reload Nginx to apply changes
sudo systemctl reload nginx

# Or restart if reload doesn't work
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## Step 8: Configure Firewall

Allow HTTP and HTTPS traffic:

```bash
# Allow Nginx through UFW firewall
sudo ufw allow 'Nginx Full'

# Or manually allow ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

## Step 9: Verify Nginx is Running

```bash
# Check if Nginx is listening on port 80
sudo ss -tlnp | grep :80

# Expected output should show nginx listening on 0.0.0.0:80 and :::80
```

## Step 10: Test HTTP Access (Before SSL)

From your local machine:

```bash
# Should return HTTP 502 (Bad Gateway) if Docker containers aren't running yet
# This is expected - it means Nginx is working
curl -I http://skin-x.app/

# Check Nginx error log if needed
sudo tail -f /var/log/nginx/error.log
```

## Step 11: Start Docker Containers

Make sure Docker containers are running before proceeding:

```bash
# Navigate to your deployment directory
cd /var/www/skinx/app

# Set environment variables
export DOCKERHUB_USERNAME
export IMAGE_TAG

# Pull and start containers
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Verify containers are running
docker compose -f docker-compose.prod.yml ps
```

## Step 12: Configure SSL/TLS with Certbot

**Important**: Ensure DNS is properly configured before running Certbot:
- skin-x.app → Your VPS IP
- www.skin-x.app → Your VPS IP

```bash
# Request SSL certificate
sudo certbot --nginx -d skin-x.app -d www.skin-x.app
```

**Follow the prompts:**
1. Enter email address for renewal notices
2. Agree to Terms of Service
3. Choose whether to share email with EFF (optional)
4. Certbot will automatically modify your Nginx config to add SSL

**Certbot will:**
- Request certificates from Let's Encrypt
- Modify `/etc/nginx/sites-available/skinx.conf` to add SSL configuration
- Set up automatic HTTPS redirect
- Configure SSL certificate paths

## Step 13: Verify SSL Configuration

```bash
# Test Nginx configuration after Certbot modifications
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

Test HTTPS access:

```bash
# From your local machine
curl -I https://skin-x.app/

# Should return HTTP 200 or 301/302 redirect
```

## Step 14: Configure Automatic Certificate Renewal

Certbot automatically sets up a systemd timer for renewal. Verify it:

```bash
# Check certbot renewal timer status
sudo systemctl status certbot.timer

# Test renewal process (dry run - doesn't actually renew)
sudo certbot renew --dry-run
```

**Expected output:** All renewals simulated successfully.

## Step 15: Final Verification

Test all public routes:

```bash
# Frontend
curl -I https://skin-x.app/

# Backend health check
curl https://skin-x.app/health

# Verify blocked routes return 404
curl -I https://skin-x.app/debug/config        # Should return 404
curl -I https://skin-x.app/model-api/          # Should return 404
curl -I https://skin-x.app/analyze/            # Should return 404
```

## Maintenance Commands

### View Nginx Logs

```bash
# Error log
sudo tail -f /var/log/nginx/error.log

# Access log
sudo tail -f /var/log/nginx/access.log

# Access log for skin-x.app specifically (if configured)
sudo tail -f /var/log/nginx/skin-x.app.access.log
```

### Reload Nginx After Configuration Changes

```bash
# Always test first
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

### Restart Nginx

```bash
sudo systemctl restart nginx
```

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### Manual SSL Certificate Renewal

```bash
# Renew all certificates
sudo certbot renew

# Reload Nginx after renewal
sudo systemctl reload nginx
```

## Troubleshooting

### Issue: 502 Bad Gateway

**Cause**: Docker containers are not running or not accessible.

**Solution**:
```bash
# Check if containers are running
docker compose -f docker-compose.prod.yml ps

# Check container logs
docker compose -f docker-compose.prod.yml logs

# Verify containers are bound to localhost
docker compose -f docker-compose.prod.yml ps
```

### Issue: 404 Not Found on valid routes

**Cause**: Nginx configuration may have syntax errors or location blocks are misconfigured.

**Solution**:
```bash
# Test configuration
sudo nginx -t

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Issue: SSL Certificate Errors

**Cause**: DNS not configured or propagated, or certificate renewal failed.

**Solution**:
```bash
# Check DNS resolution
dig skin-x.app
nslookup skin-x.app

# Manually renew certificate
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates
```

### Issue: Connection Refused

**Cause**: Firewall blocking connections.

**Solution**:
```bash
# Check firewall status
sudo ufw status

# Allow Nginx
sudo ufw allow 'Nginx Full'
```

### Issue: Cloudflare Challenge Blocking Requests

**Cause**: Cloudflare security settings blocking legitimate traffic.

**Solution**:
- See nginx/README.md for Cloudflare WAF bypass rules
- Configure bypass for /telegram/webhook
- Optionally bypass for /api/* if uploads are blocked

## Post-Installation Checklist

- [ ] Nginx installed and running
- [ ] Configuration file deployed to /etc/nginx/sites-available/skinx.conf
- [ ] Symbolic link created in /etc/nginx/sites-enabled/
- [ ] WebSocket map added to /etc/nginx/nginx.conf
- [ ] Nginx configuration tested (`nginx -t` passes)
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Docker containers running
- [ ] SSL certificate obtained via Certbot
- [ ] HTTPS redirect working
- [ ] Auto-renewal configured
- [ ] Public routes tested and working
- [ ] Internal routes blocked (return 404)
- [ ] Cloudflare DNS configured
- [ ] Telegram webhook URL set

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Let's Encrypt](https://letsencrypt.org/)
- [UFW Firewall Guide](https://help.ubuntu.com/community/UFW)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Next Steps

After successful Nginx installation:

1. Configure Cloudflare WAF rules (see nginx/README.md)
2. Set Telegram webhook URL
3. Monitor logs for errors
4. Set up monitoring/alerting for certificate expiration
5. Configure log rotation if needed
6. Consider setting up fail2ban for additional security
