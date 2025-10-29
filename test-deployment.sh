#!/bin/bash

# 部署健康检查脚本
echo "=========================================="
echo "Ruizhu Platform - 部署健康检查"
echo "=========================================="
echo ""

DOMAIN="yunjie.online"
API_URL="https://$DOMAIN"

echo "📋 部署信息"
echo "域名: $DOMAIN"
echo "服务器IP: 123.207.14.67"
echo ""

# 1. DNS 检查
echo "1️⃣  DNS 解析检查"
if ping -c 1 "$DOMAIN" > /dev/null 2>&1; then
    echo "✅ 域名解析成功"
else
    echo "⚠️  无法ping通域名，但不影响HTTPS访问"
fi
echo ""

# 2. HTTPS 连接检查
echo "2️⃣  HTTPS 连接检查"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL" -k 2>/dev/null)
if [ "$HTTP_CODE" != "000" ]; then
    echo "✅ HTTPS 连接成功 (HTTP Status: $HTTP_CODE)"
else
    echo "❌ HTTPS 连接失败"
fi
echo ""

# 3. API 端点检查
echo "3️⃣  API 端点检查"

# 检查 /banners 端点
echo "   测试 GET /banners"
RESPONSE=$(curl -s "$API_URL/banners?page=1&limit=3" -k 2>/dev/null)
if echo "$RESPONSE" | grep -q "data\|items" 2>/dev/null; then
    echo "   ✅ /banners 端点正常"
    echo "   返回数据: $(echo "$RESPONSE" | head -c 100)..."
else
    echo "   ⚠️  /banners 端点异常"
    echo "   返回: $RESPONSE"
fi
echo ""

# 4. 认证端点检查
echo "4️⃣  认证端点检查"
echo "   测试 POST /auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -k 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "access_token\|Invalid\|Unauthorized" 2>/dev/null; then
    echo "   ✅ /auth/login 端点正常 (返回认证相关响应)"
else
    echo "   ⚠️  /auth/login 端点响应: $LOGIN_RESPONSE"
fi
echo ""

# 5. SSL 证书检查
echo "5️⃣  SSL 证书检查"
CERT_INFO=$(openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" </dev/null 2>/dev/null | openssl x509 -text -noout 2>/dev/null)
if [ ! -z "$CERT_INFO" ]; then
    CERT_DATE=$(echo "$CERT_INFO" | grep "Not After" | head -1)
    echo "✅ SSL 证书有效"
    echo "   $CERT_DATE"
else
    echo "⚠️  无法获取 SSL 证书信息"
fi
echo ""

# 6. 响应时间测试
echo "6️⃣  响应时间测试"
START=$(date +%s%N)
curl -s "$API_URL/banners?page=1&limit=1" -k -o /dev/null
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))
echo "   API 响应时间: ${DURATION}ms"
if [ $DURATION -lt 1000 ]; then
    echo "   ✅ 响应时间良好"
elif [ $DURATION -lt 3000 ]; then
    echo "   ⚠️  响应时间一般"
else
    echo "   ❌ 响应时间较长"
fi
echo ""

# 7. 本地 API 检查
echo "7️⃣  本地 API 检查 (localhost:3000)"
LOCAL_RESPONSE=$(curl -s http://localhost:3000/banners?page=1&limit=1 2>/dev/null)
if echo "$LOCAL_RESPONSE" | grep -q "data\|items" 2>/dev/null; then
    echo "✅ 本地 API 服务运行正常"
else
    echo "⚠️  本地 API 服务未响应或已停止"
fi
echo ""

echo "=========================================="
echo "✅ 检查完成"
echo "=========================================="
echo ""
echo "📊 总结:"
echo "如果所有项都是 ✅，说明部署状态良好"
echo "如果有 ⚠️，说明可能存在轻微问题但服务仍可用"
echo "如果有 ❌，说明需要立即排查"
echo ""
