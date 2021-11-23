export default {
  host: process.env.HOST || 'localhost',
  port: process.env.NODE_PORT ? parseInt(process.env.NODE_PORT) : 3000,
  jwt: {
    signatureSecret: process.env.JWT_SIGNATURE_SECRET || 'Secret-Pa$$w0rd',
    expiresIn: '8h'
  }
};
