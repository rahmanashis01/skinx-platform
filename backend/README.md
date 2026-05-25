# SkinX Backend API

Backend server for SkinX registration with OTP-based email verification using Node.js, Express, and Nodemailer.

## 🚀 Features

- ✅ Email-based user registration
- 🔐 OTP (One-Time Password) email verification
- ⏱️ Automatic OTP expiration (configurable)
- 🔒 Rate limiting to prevent abuse
- 📧 Beautiful HTML email templates
- 🛡️ Security best practices
- 📱 Mobile-optimized OTP input support

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- A valid email account (Gmail, Outlook, SendGrid, etc.)

## 🔧 Installation

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=5000
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📧 Email Service Setup

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Google account
   - Go to https://myaccount.google.com/security

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
   - Use this as `EMAIL_PASS` in `.env`

3. **Update .env file**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx  # App password (spaces will be ignored)
   ```

### Alternative Email Services

#### SendGrid
```env
EMAIL_SERVICE=SendGrid
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### AWS SES
```env
EMAIL_SERVICE=SES
EMAIL_USER=your-aws-access-key-id
EMAIL_PASS=your-aws-secret-access-key
```

#### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=youremail@outlook.com
EMAIL_PASS=your-password
```

## 🏃‍♂️ Running the Server

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT)

## 🔌 API Endpoints

### 1. Health Check
**GET** `/api/health`

Returns server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Register User (Send OTP)
**POST** `/api/register`

Sends OTP to user's email for verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent successfully to your email",
  "expiresIn": 600
}
```

**Error Responses:**
- `400`: Invalid email or password
- `429`: Rate limit exceeded (wait before requesting new OTP)
- `500`: Server or email sending error

### 3. Verify OTP
**POST** `/api/verify-otp`

Verifies the OTP and completes registration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully! Registration complete.",
  "user": {
    "email": "user@example.com",
    "verified": true
  }
}
```

**Error Responses:**
- `400`: Invalid OTP or expired
- `404`: No registration found
- `429`: Maximum attempts exceeded

### 4. Resend OTP
**POST** `/api/resend-otp`

Resends a new OTP to the user's email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "New OTP sent successfully to your email",
  "expiresIn": 600
}
```

**Error Responses:**
- `404`: No registration found
- `429`: Rate limit exceeded

## 🧪 Testing the API

### Using cURL

#### Register
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Verify OTP
```bash
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Using Postman or Thunder Client

1. Create a new POST request to `http://localhost:5000/api/register`
2. Set Content-Type header to `application/json`
3. Add body with email and password
4. Send request
5. Check your email for OTP
6. Use the OTP in verify-otp endpoint

## 🔒 Security Features

### Current Implementation

- ✅ **Rate Limiting**: Prevents spam requests (60s cooldown between OTP requests)
- ✅ **OTP Expiration**: OTPs expire after 10 minutes
- ✅ **Attempt Limiting**: Maximum 5 attempts per OTP
- ✅ **Input Validation**: Email and password validation
- ✅ **CORS Protection**: Configured CORS headers
- ✅ **Auto Cleanup**: Expired OTPs are automatically removed

### Production Recommendations

```bash
npm install bcryptjs express-rate-limit helmet
```

1. **Hash Passwords**: Use bcrypt before storing
   ```javascript
   const bcrypt = require('bcryptjs');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Add Helmet.js**: Security headers
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

3. **Global Rate Limiting**:
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use(limiter);
   ```

## 💾 Database Integration (Future)

### MongoDB Example

```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// In verify-otp endpoint:
const user = new User({
  email,
  password: hashedPassword,
  verified: true
});
await user.save();
```

### PostgreSQL Example

```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// In verify-otp endpoint:
await pool.query(
  'INSERT INTO users (email, password, verified) VALUES ($1, $2, $3)',
  [email, hashedPassword, true]
);
```

## 🚀 Production Deployment

### Using Redis for OTP Storage

Replace in-memory Map with Redis for better scalability:

```bash
npm install redis
```

```javascript
const redis = require('redis');
const client = redis.createClient();

// Store OTP
await client.setEx(`otp:${email}`, 600, JSON.stringify(otpData));

// Get OTP
const data = await client.get(`otp:${email}`);
const otpData = JSON.parse(data);

// Delete OTP
await client.del(`otp:${email}`);
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
EMAIL_SERVICE=sendgrid  # or SES for production
FRONTEND_URL=https://yourdomain.com
REDIS_URL=redis://your-redis-url
DATABASE_URL=postgresql://your-db-url
```

### Deployment Platforms

#### Heroku
```bash
heroku create skinx-api
heroku config:set EMAIL_USER=your-email
heroku config:set EMAIL_PASS=your-password
git push heroku main
```

#### Railway
```bash
railway login
railway init
railway up
```

#### AWS/DigitalOcean/Linode
- Use PM2 for process management
- Set up Nginx as reverse proxy
- Enable SSL with Let's Encrypt
- Configure firewall rules

## 🔧 Configuration Options

Edit `.env` to customize:

```env
# OTP expires after (in minutes)
OTP_EXPIRY_MINUTES=10

# Maximum OTP verification attempts
MAX_OTP_ATTEMPTS=5

# Cooldown between OTP requests (in seconds)
RESEND_COOLDOWN_SECONDS=60
```

## 📝 Logging

Add logging for production monitoring:

```bash
npm install winston
```

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🐛 Troubleshooting

### Email not sending

1. **Check email credentials** in `.env`
2. **Verify app password** (not regular password for Gmail)
3. **Check firewall/antivirus** blocking SMTP
4. **Enable less secure apps** (if using regular SMTP)

### Port already in use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm start
```

### CORS errors

Update CORS configuration in `server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Express.js Guide](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues or questions:
- Create an issue on GitHub
- Contact: support@skinx.com

---

**Made with ❤️ by SkinX Team**