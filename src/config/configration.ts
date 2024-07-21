export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USENAME: process.env.DB_USENAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID,
  AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_SECURE: process.env.MAIL_SECURE,
  SERVER_EMAIL: process.env.SERVER_EMAIL,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,
  MAIL_FROM: process.env.MAIL_FROM,
  STRIPE_KEY: process.env.STRIPE_KEY,
});
