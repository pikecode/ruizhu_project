# FastAPI Backend

Python FastAPI 项目，用于电商平台后端 API。

## 项目结构

```
fastapi/
├── main.py              # 应用入口
├── config.py            # 配置文件
├── database.py          # 数据库配置
├── requirements.txt     # 依赖
├── .env                 # 环境变量
├── models/              # SQLAlchemy 模型
│   ├── user.py
│   ├── product.py
│   ├── order.py
│   └── payment.py
├── schemas/             # Pydantic 数据模型
│   ├── user.py
│   ├── product.py
│   ├── order.py
│   └── payment.py
└── routers/             # API 路由
    ├── health.py
    ├── users.py
    ├── products.py
    ├── orders.py
    └── payments.py
```

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行项目

```bash
python main.py
```

或使用 uvicorn：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API 端点

### 健康检查
- `GET /health` - 检查 API 状态

### 用户管理
- `POST /api/v1/users/register` - 注册用户
- `GET /api/v1/users/{user_id}` - 获取用户详情
- `GET /api/v1/users/` - 获取用户列表

### 产品管理
- `POST /api/v1/products/` - 创建产品
- `GET /api/v1/products/{product_id}` - 获取产品详情
- `GET /api/v1/products/` - 获取产品列表
- `PUT /api/v1/products/{product_id}` - 更新产品
- `DELETE /api/v1/products/{product_id}` - 删除产品

### 订单管理
- `POST /api/v1/orders/` - 创建订单
- `GET /api/v1/orders/{order_id}` - 获取订单详情
- `GET /api/v1/orders/` - 获取订单列表
- `PUT /api/v1/orders/{order_id}/status` - 更新订单状态

### 支付管理
- `POST /api/v1/payments/create` - 创建支付订单
- `GET /api/v1/payments/{transaction_no}` - 查询支付状态
- `POST /api/v1/payments/wechat/callback` - 微信支付回调

## 数据库

使用 MySQL 作为数据库，SQLAlchemy ORM。

数据库配置在 `.env` 文件中：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=ruizhu
```

## 环境变量

编辑 `.env` 文件：

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Pp123456
DB_NAME=ruizhu

# FastAPI
API_PORT=8000
API_HOST=0.0.0.0

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
```

## 开发

### 添加新的 API 端点

1. 在 `models/` 中创建数据模型
2. 在 `schemas/` 中创建 Pydantic 模型
3. 在 `routers/` 中创建路由
4. 在 `main.py` 中注册路由

## API 文档

启动服务后，访问以下地址查看 API 文档：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

MIT
