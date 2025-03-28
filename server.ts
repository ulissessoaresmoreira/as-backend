import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import https from 'https';
import http from 'http';
import fs from 'fs';
import siteRoutes from './src/routes/site';
import adminRoutes from './src/routes/admin';
import { requestIntercepter } from './src/utils/requestintercepter';


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', requestIntercepter);

app.use('/admin', adminRoutes);
app.use('/', siteRoutes);

const runServer = (port: number, server: http.Server) => {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

const regularServer = http.createServer(app);
if(process.env.NODE_ENV === 'production') {
  // TODO: CONFIGUAR SSL
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY || ''),
    cert: fs.readFileSync(process.env.SSL_CERT || ''),
  }
  const secServer = https.createServer(options, app);
  runServer(80, regularServer);
  runServer(443, secServer);
  // TODO: RODAR NA PORTA 80 E NA PORTA 443
} else {
  const serverPort: number = process.env.PORT ? parseInt(process.env.PORT) : 9000;
  runServer(serverPort, regularServer);
}