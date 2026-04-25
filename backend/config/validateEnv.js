// Environment Variable Validation
// Validates required environment variables at startup

const validateEnv = () => {
  const required = [
    'MONGO_URI',
    'CLERK_SECRET_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'ML_SERVICE_URL'
  ];

  // ENCRYPTION_KEY is required outside local development for secure token storage
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment && !process.env.ENCRYPTION_KEY) {
    required.push('ENCRYPTION_KEY');
  }

  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check format of critical variables
  if (process.env.MONGO_URI && !process.env.MONGO_URI.startsWith('mongodb')) {
    warnings.push('MONGO_URI should start with mongodb:// or mongodb+srv://');
  }

  if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.startsWith('sk_')) {
    warnings.push('CLERK_SECRET_KEY should start with sk_');
  }

  if (process.env.ML_SERVICE_URL && !process.env.ML_SERVICE_URL.startsWith('http')) {
    warnings.push('ML_SERVICE_URL should start with http:// or https://');
  }

  if (process.env.GOOGLE_REDIRECT_URI && !process.env.GOOGLE_REDIRECT_URI.startsWith('http')) {
    warnings.push('GOOGLE_REDIRECT_URI should start with http:// or https://');
  }

  // Validate ENCRYPTION_KEY format (must be 64 hex characters for AES-256)
  if (process.env.ENCRYPTION_KEY) {
    if (!/^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_KEY)) {
      warnings.push('ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes for AES-256). Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    }
  } else if (isDevelopment) {
    warnings.push('ENCRYPTION_KEY not set. Using insecure default for development only.');
  }

  // Warn if FRONTEND_URL not set (will default to localhost:3000)
  if (!process.env.FRONTEND_URL) {
    warnings.push('FRONTEND_URL not set. CORS will allow http://localhost:3000 by default. Set this in production!');
  } else if (!process.env.FRONTEND_URL.startsWith('http')) {
    warnings.push('FRONTEND_URL should start with http:// or https://');
  }

  // Report issues
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment variable warnings:');
    warnings.forEach(w => console.warn(`   - ${w}`));
    console.warn('');
  }

  // Success
  console.log('✅ Environment variables validated');
};

module.exports = validateEnv;
