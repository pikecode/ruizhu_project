import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ruizhu API Server</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            h1 { color: #007aff; margin: 0 0 10px 0; }
            .status { display: inline-block; background: #4cd964; color: white; padding: 5px 10px; border-radius: 4px; font-size: 14px; }
            .info { background: #f9f9f9; padding: 15px; border-left: 4px solid #007aff; margin: 20px 0; }
            a { color: #007aff; text-decoration: none; }
            a:hover { text-decoration: underline; }
            ul { list-style-position: inside; }
            li { margin: 8px 0; }
            code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
            hr { border: none; border-top: 1px solid #e0e0e0; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Ruizhu API Server <span class="status">✓ Running</span></h1>

            <div class="info">
              <strong>Server Information:</strong>
              <ul>
                <li>Port: <code>8888</code></li>
                <li>API Prefix: <code>/api/v1</code></li>
                <li>Environment: <code>development</code></li>
              </ul>
            </div>

            <div class="info">
              <strong>Available Endpoints:</strong>
              <ul>
                <li><code>POST /api/v1/auth/login</code> - User authentication</li>
                <li><code>GET /api/v1/users</code> - Get users list</li>
                <li><code>GET /api/v1/products</code> - Get products list</li>
                <li><code>GET /api/v1/orders</code> - Get orders list</li>
              </ul>
            </div>

            <div class="info">
              <strong>Frontend Applications:</strong>
              <ul>
                <li>📱 <a href="http://localhost:5173" target="_blank">Mini Program</a> (Port 5173)</li>
                <li>⚙️ <a href="http://localhost:5174" target="_blank">Admin Dashboard</a> (Port 5174)</li>
              </ul>
            </div>

            <hr>
            <p style="color: #666; font-size: 14px;">
              Ruizhu E-Commerce Platform | Backend API Service
            </p>
          </div>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
