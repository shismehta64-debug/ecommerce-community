import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Community Connect API running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS origin: ${process.env.FRONTEND_ORIGIN || 'http://localhost:5173'}`);
});
