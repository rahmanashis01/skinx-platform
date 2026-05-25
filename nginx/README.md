# SkinX Platform - Nginx Configuration

This directory contains the production Nginx reverse proxy configuration for the SkinX platform.

## Files

- **skinx.conf** - Production reverse proxy configuration for skin-x.app

## Architecture

```
Internet
   ↓
Cloudflare DNS/CDN
   ↓
Nginx Reverse Proxy (this config)
   ↓
┌─────────────────────────────────────────────┐
│  Docker Containers (localhost bindings)    │
├─────────────────────────────────────────────┤
│  Frontend:      127.0.0.1:3000             │
│  Backend:       127.0.0.1:5001             │
│  Model-API:     127.0.0.1:8080 (internal)  │
│  RAG-Backend:   127.0.0.1:8000 (internal)  │
│  Telegram-Bot:  127.0.0.1:5050             │
└─────────────────────────────────────────────┘
```

## Public Routes

The following routes are exposed to the internet:

| Route | Proxy Target | Purpose |
|-------|--------------|---------|
| `/` | `127.0.0.1:3000` | Frontend React SPA |
| `/api/*` | `127.0.0.1:5001` | Backend API endpoints |
| `/auth/*` | `127.0.0.1:5001` | Authentication routes |
| `/uploads/*` | `127.0.0.1:5001` | Static uploaded files |
| `/health` | `127.0.0.1:5001/health` | Health check endpoint |
| `/telegram/webhook` | `127.0.0.1:5050/telegram/webhook` | Telegram bot webhook |

## Blocked Routes (404)

The following routes are intentionally blocked for security:

- `/debug/*` - Debug endpoints
- `/model-api/*` - ML inference service (internal only)
- `/rag-backend/*` - RAG service (internal only)
- `/analyze/*` - Direct analyze endpoints
- `/predict` - Direct prediction endpoint

**Security Note**: Model-API and RAG-Backend are only accessible via internal Docker network calls from Backend and Telegram-Bot services.

## Cloudflare Configuration

### DNS Records

Configure the following DNS A records in Cloudflare:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | skin-x.app | `<VPS_IP_ADDRESS>` | Proxied (Orange Cloud) |
| A | www.skin-x.app | `<VPS_IP_ADDRESS>` | Proxied (Orange Cloud) |

Replace `<VPS_IP_ADDRESS>` with your production server IP address.

### Cloudflare Challenge Bypass

**Important**: Telegram webhooks and API uploads may be blocked by Cloudflare's security challenges.

#### Bypass Telegram Webhook

Create a WAF Custom Rule to bypass challenges for Telegram:

1. Navigate to: **Security** → **WAF** → **Custom rules**
2. Create rule: **Bypass Telegram Webhook**
3. Expression:
   ```
   (http.request.uri.path eq "/telegram/webhook")
   ```
4. Action: **Skip** → Select **All remaining custom rules**
5. Save and Deploy

#### Optional: Bypass API Uploads (if needed)

If users experience issues uploading images via `/api/analyze`:

1. Create rule: **Bypass API Uploads**
2. Expression:
   ```
   (http.request.uri.path contains "/api/")
   ```
3. Action: **Skip** → Select **Challenge (Managed Challenge, JS Challenge, Legacy CAPTCHA)**
4. Save and Deploy

**Note**: Only enable this if you experience upload issues. Consider IP-based restrictions if enabling.

### SSL/TLS Settings

In Cloudflare:
1. **SSL/TLS** → **Overview** → Set to **Full (strict)**
2. This requires a valid certificate on the origin server (configured via Certbot)

### Telegram Webhook URL

After deployment, set your Telegram webhook URL to:

```
https://skin-x.app/telegram/webhook
```

Use Telegram BotFather or the Telegram Bot API to configure:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://skin-x.app/telegram/webhook"}'
```

## Installation

See [deploy/NGINX_INSTALL.md](../deploy/NGINX_INSTALL.md) for installation instructions.

## Security Headers

The configuration includes the following security headers:

- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer policy
- `server_tokens: off` - Hides Nginx version

**CSP Note**: Content-Security-Policy is commented out initially. Add after verifying Auth0, Cloudflare, and other third-party domain requirements.

## Timeout Settings

- `client_max_body_size: 25M` - Maximum upload size (for images)
- `proxy_read_timeout: 120s` - ML inference can take time
- `proxy_connect_timeout: 60s` - Connection timeout
- `proxy_send_timeout: 120s` - Send timeout

## WebSocket Support

WebSocket support is configured via upgrade headers. The map directive for `$connection_upgrade` should be added to `/etc/nginx/nginx.conf` http block:

```nginx
http {
    # ... other settings ...
    
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    
    # ... other settings ...
}
```

## Testing

### Test Nginx Configuration

```bash
sudo nginx -t
```

### Test Public Routes

After deployment:

```bash
# Frontend
curl -I https://skin-x.app/

# Backend health
curl https://skin-x.app/health

# Verify blocked routes return 404
curl -I https://skin-x.app/debug/config
curl -I https://skin-x.app/model-api/
curl -I https://skin-x.app/analyze/
```

## Troubleshooting

### 502 Bad Gateway

- Check if Docker containers are running: `docker compose ps`
- Verify container ports are bound to localhost: `docker compose -f docker-compose.prod.yml ps`
- Check container logs: `docker compose logs [service]`

### 413 Request Entity Too Large

- Increase `client_max_body_size` in nginx.conf
- Reload Nginx: `sudo systemctl reload nginx`

### Telegram Webhook Not Working

- Verify webhook URL is set correctly in Telegram
- Check Cloudflare WAF rules are not blocking the webhook
- Check telegram-bot container logs: `docker compose logs telegram-bot`
- Verify Telegram IPs are not blocked by firewall

### Cloudflare Challenge Blocking Uploads

- Create bypass rule for `/api/*` as described above
- Consider adding IP whitelist for known user IPs
- Check Cloudflare Security Events for details

## Maintenance

### Reload Nginx After Changes

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### View Nginx Logs

```bash
# Error log
sudo tail -f /var/log/nginx/error.log

# Access log
sudo tail -f /var/log/nginx/access.log
```

### SSL Certificate Renewal

Certbot auto-renews certificates. To manually renew:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/)
- [Cloudflare WAF Custom Rules](https://developers.cloudflare.com/waf/custom-rules/)
- [Telegram Bot API - setWebhook](https://core.telegram.org/bots/api#setwebhook)
