import app from './server.js';
import config from './config/index.js';

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 SuvidhaPay API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.server.nodeEnv}`);
  console.log(`🔐 Frontend URL: ${config.server.frontendUrl}`);
});
