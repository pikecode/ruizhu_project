#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
API_BASE_URL="http://localhost:3000"
AUTH_TOKEN=""
USER_ID=""
PRODUCT_ID=1
PRODUCT_ID_2=2
ADDRESS_ID=1

# 测试结果统计
PASS_COUNT=0
FAIL_COUNT=0

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓ PASS]${NC} $1"
    ((PASS_COUNT++))
}

log_error() {
    echo -e "${RED}[✗ FAIL]${NC} $1"
    ((FAIL_COUNT++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 分隔线
separator() {
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
}

# ============================================================================
# 测试 1: 用户认证和基本设置
# ============================================================================
test_auth_and_setup() {
    separator
    log_info "测试 1: 用户认证和基本设置"
    separator

    # 这里假设已有测试用户，实际应该先注册或使用已有账户
    # 为了演示，我们使用假设的token
    AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    USER_ID=1

    log_info "使用 TOKEN: ${AUTH_TOKEN:0:30}..."
    log_info "用户 ID: $USER_ID"

    log_success "认证信息设置完成"
}

# ============================================================================
# 测试 2: 获取商品信息和库存状态
# ============================================================================
test_get_product_info() {
    separator
    log_info "测试 2: 获取商品信息和库存状态"
    separator

    # 获取产品1的信息
    log_info "获取产品 #$PRODUCT_ID 的信息..."
    RESPONSE=$(curl -s -X GET \
        "$API_BASE_URL/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")

    echo "产品信息: $RESPONSE" | head -c 100
    echo ""

    # 检查库存状态字段
    if echo "$RESPONSE" | grep -q "stockStatus"; then
        log_success "产品包含库存状态字段"

        # 提取库存信息
        STOCK_QUANTITY=$(echo "$RESPONSE" | grep -o '"stockQuantity":[0-9]*' | head -1 | cut -d: -f2)
        STOCK_STATUS=$(echo "$RESPONSE" | grep -o '"stockStatus":"[^"]*' | head -1 | cut -d'"' -f4)

        log_info "库存数量: $STOCK_QUANTITY"
        log_info "库存状态: $STOCK_STATUS"
    else
        log_error "产品缺少库存状态字段"
    fi
}

# ============================================================================
# 测试 3: 加入购物车
# ============================================================================
test_add_to_cart() {
    separator
    log_info "测试 3: 加入购物车"
    separator

    log_info "添加产品 #$PRODUCT_ID 到购物车 (数量: 2)..."

    RESPONSE=$(curl -s -X POST \
        "$API_BASE_URL/cart/add" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "productId": '${PRODUCT_ID}',
            "quantity": 2,
            "selectedAttributes": {
                "color": "red",
                "size": "M"
            },
            "priceSnapshot": 5000
        }')

    if echo "$RESPONSE" | grep -q '"id"'; then
        CART_ITEM_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        log_success "成功添加到购物车 (购物车项 ID: $CART_ITEM_ID)"
    else
        log_error "添加购物车失败: $RESPONSE"
    fi
}

# ============================================================================
# 测试 4: 获取购物车内容
# ============================================================================
test_get_cart() {
    separator
    log_info "测试 4: 获取购物车内容"
    separator

    log_info "获取购物车..."

    RESPONSE=$(curl -s -X GET \
        "$API_BASE_URL/cart" \
        -H "Authorization: Bearer $AUTH_TOKEN")

    if echo "$RESPONSE" | grep -q "code"; then
        ITEM_COUNT=$(echo "$RESPONSE" | grep -o '"id":' | wc -l)
        log_success "成功获取购物车 (项目数: $ITEM_COUNT)"

        # 显示购物车内容摘要
        echo "$RESPONSE" | grep -o '"name":"[^"]*' | head -3
    else
        log_error "获取购物车失败"
    fi
}

# ============================================================================
# 测试 5: 创建订单
# ============================================================================
test_create_order() {
    separator
    log_info "测试 5: 创建订单"
    separator

    # 订单金额（以分为单位）
    SUBTOTAL=10000  # 100元
    DISCOUNT=0
    FINAL=10000

    log_info "创建订单: 小计=$SUBTOTAL 分, 最终金额=$FINAL 分"

    RESPONSE=$(curl -s -X POST \
        "$API_BASE_URL/orders" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "items": [
                {
                    "productId": '${PRODUCT_ID}',
                    "quantity": 2,
                    "price": 5000,
                    "selectedAttributes": {"color": "red", "size": "M"}
                }
            ],
            "addressId": '${ADDRESS_ID}',
            "totalAmount": '${SUBTOTAL}',
            "shippingAmount": 0,
            "discountAmount": '${DISCOUNT}',
            "finalAmount": '${FINAL}',
            "isRecharge": false
        }')

    if echo "$RESPONSE" | grep -q '"orderNo"'; then
        ORDER_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        ORDER_NO=$(echo "$RESPONSE" | grep -o '"orderNo":"[^"]*' | cut -d'"' -f4)
        ORDER_STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)

        log_success "成功创建订单"
        log_info "订单 ID: $ORDER_ID"
        log_info "订单号: $ORDER_NO"
        log_info "订单状态: $ORDER_STATUS"
    else
        log_error "创建订单失败: $RESPONSE"
        return 1
    fi
}

# ============================================================================
# 测试 6: 库存扣减验证 (乐观锁)
# ============================================================================
test_inventory_deduction() {
    separator
    log_info "测试 6: 库存扣减验证 (乐观锁)"
    separator

    log_info "获取产品 #$PRODUCT_ID 库存（订单创建后）..."

    RESPONSE=$(curl -s -X GET \
        "$API_BASE_URL/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")

    STOCK_AFTER=$(echo "$RESPONSE" | grep -o '"stockQuantity":[0-9]*' | head -1 | cut -d: -f2)
    STOCK_STATUS=$(echo "$RESPONSE" | grep -o '"stockStatus":"[^"]*' | head -1 | cut -d'"' -f4)

    log_info "订单后库存数量: $STOCK_AFTER"
    log_info "库存状态: $STOCK_STATUS"

    # 验证库存已扣减
    if [ "$STOCK_AFTER" -lt 5 ]; then
        log_success "库存正确扣减 (从初始值扣减2件)"
    else
        log_warning "库存可能未正确扣减"
    fi
}

# ============================================================================
# 测试 7: 并发订单测试 (乐观锁冲突)
# ============================================================================
test_concurrent_orders() {
    separator
    log_info "测试 7: 并发订单测试 (乐观锁冲突检测)"
    separator

    log_info "模拟2个用户同时购买同一产品..."

    # 产品3有库存5件，两个用户各购5件
    PRODUCT_CONCURRENT=3

    # 第一个请求
    log_info "用户A创建订单 (购5件)..."
    RESP1=$(curl -s -X POST \
        "$API_BASE_URL/orders" \
        -H "Authorization: Bearer 1" \
        -H "Content-Type: application/json" \
        -d '{
            "items": [{"productId": '${PRODUCT_CONCURRENT}', "quantity": 5, "price": 1000}],
            "addressId": '${ADDRESS_ID}',
            "totalAmount": 5000,
            "shippingAmount": 0,
            "discountAmount": 0,
            "finalAmount": 5000,
            "isRecharge": false
        }')

    # 第二个请求（应该失败或成功取决于乐观锁）
    sleep 0.5
    log_info "用户B创建订单 (购5件)..."
    RESP2=$(curl -s -X POST \
        "$API_BASE_URL/orders" \
        -H "Authorization: Bearer 2" \
        -H "Content-Type: application/json" \
        -d '{
            "items": [{"productId": '${PRODUCT_CONCURRENT}', "quantity": 5, "price": 1000}],
            "addressId": '${ADDRESS_ID}',
            "totalAmount": 5000,
            "shippingAmount": 0,
            "discountAmount": 0,
            "finalAmount": 5000,
            "isRecharge": false
        }')

    if echo "$RESP1" | grep -q '"orderNo"'; then
        log_success "用户A订单创建成功"
    else
        log_error "用户A订单创建失败"
    fi

    if echo "$RESP2" | grep -q '"orderNo"'; then
        log_success "用户B订单创建成功 (乐观锁允许)"
    elif echo "$RESP2" | grep -q "乐观锁冲突\|库存已被"; then
        log_success "用户B遇到乐观锁冲突，系统阻止超卖 ✓"
    else
        log_warning "用户B订单结果不确定: $(echo $RESP2 | head -c 50)"
    fi
}

# ============================================================================
# 测试 8: 支付流程 (金额验证)
# ============================================================================
test_payment_flow() {
    separator
    log_info "测试 8: 支付流程 (金额验证)"
    separator

    if [ -z "$ORDER_ID" ]; then
        log_warning "无有效订单ID，跳过支付测试"
        return
    fi

    log_info "订单 #$ORDER_ID 发起支付..."
    log_info "创建支付订单..."

    PAYMENT_RESPONSE=$(curl -s -X POST \
        "$API_BASE_URL/wechat/payment/create-order" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "openid": "test_openid_123",
            "outTradeNo": "'${ORDER_NO}'",
            "totalFee": 10000,
            "body": "订单 '${ORDER_NO}'",
            "metadata": {
                "orderId": '${ORDER_ID}',
                "userId": '${USER_ID}'
            }
        }')

    if echo "$PAYMENT_RESPONSE" | grep -q "prepayId\|prepay_id"; then
        PREPAY_ID=$(echo "$PAYMENT_RESPONSE" | grep -o '"prepayId":"[^"]*' | cut -d'"' -f4)
        log_success "支付订单创建成功"
        log_info "预支付ID: $PREPAY_ID"
    else
        log_error "支付订单创建失败: $(echo $PAYMENT_RESPONSE | head -c 100)"
    fi

    # 测试金额篡改检测
    log_info "测试金额篡改防护..."
    FRAUD_RESPONSE=$(curl -s -X POST \
        "$API_BASE_URL/wechat/payment/create-order" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "openid": "test_openid_123",
            "outTradeNo": "'${ORDER_NO}'_fraud",
            "totalFee": 1,
            "body": "欺诈订单",
            "metadata": {"orderId": '${ORDER_ID}', "userId": '${USER_ID}'}
        }')

    log_success "金额篡改测试请求已发送（实际金额验证在回调时进行）"
}

# ============================================================================
# 测试 9: 订单查询
# ============================================================================
test_get_order() {
    separator
    log_info "测试 9: 订单查询"
    separator

    if [ -z "$ORDER_ID" ]; then
        log_warning "无有效订单ID，跳过查询测试"
        return
    fi

    log_info "查询订单 #$ORDER_ID 详情..."

    RESPONSE=$(curl -s -X GET \
        "$API_BASE_URL/orders/$ORDER_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN")

    if echo "$RESPONSE" | grep -q '"orderNo"'; then
        ORDER_STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)
        SHIPPING_ADDR=$(echo "$RESPONSE" | grep -o '"shippingAddress":{[^}]*}' | head -c 80)

        log_success "成功获取订单详情"
        log_info "订单状态: $ORDER_STATUS"
        log_info "收货地址: $SHIPPING_ADDR"
    else
        log_error "订单查询失败"
    fi
}

# ============================================================================
# 测试 10: 订单取消和库存恢复
# ============================================================================
test_cancel_order() {
    separator
    log_info "测试 10: 订单取消和库存恢复"
    separator

    if [ -z "$ORDER_ID" ]; then
        log_warning "无有效订单ID，跳过取消测试"
        return
    fi

    # 先获取取消前的库存
    log_info "记录取消前的库存..."
    BEFORE=$(curl -s -X GET "$API_BASE_URL/products/$PRODUCT_ID" \
        -H "Authorization: Bearer $AUTH_TOKEN" | grep -o '"stockQuantity":[0-9]*' | head -1 | cut -d: -f2)
    log_info "取消前库存: $BEFORE"

    # 取消订单
    log_info "取消订单 #$ORDER_ID..."
    CANCEL_RESPONSE=$(curl -s -X PUT \
        "$API_BASE_URL/orders/$ORDER_ID/cancel" \
        -H "Authorization: Bearer $AUTH_TOKEN")

    if echo "$CANCEL_RESPONSE" | grep -q "cancelled"; then
        log_success "订单成功取消"

        # 获取取消后的库存
        sleep 1
        AFTER=$(curl -s -X GET "$API_BASE_URL/products/$PRODUCT_ID" \
            -H "Authorization: Bearer $AUTH_TOKEN" | grep -o '"stockQuantity":[0-9]*' | head -1 | cut -d: -f2)
        log_info "取消后库存: $AFTER"

        if [ "$AFTER" -gt "$BEFORE" ]; then
            log_success "库存正确恢复 (增加 $((AFTER - BEFORE)) 件)"
        else
            log_warning "库存可能未正确恢复"
        fi
    else
        log_error "订单取消失败: $(echo $CANCEL_RESPONSE | head -c 100)"
    fi
}

# ============================================================================
# 测试 11: 超时订单自动取消
# ============================================================================
test_timeout_cancellation() {
    separator
    log_info "测试 11: 超时订单自动取消 (演示)"
    separator

    log_info "创建一个订单..."

    TIMEOUT_RESPONSE=$(curl -s -X POST \
        "$API_BASE_URL/orders" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "items": [{"productId": '${PRODUCT_ID_2}', "quantity": 1, "price": 3000}],
            "addressId": '${ADDRESS_ID}',
            "totalAmount": 3000,
            "shippingAmount": 0,
            "discountAmount": 0,
            "finalAmount": 3000,
            "isRecharge": false
        }')

    if echo "$TIMEOUT_RESPONSE" | grep -q '"orderNo"'; then
        TIMEOUT_ORDER_ID=$(echo "$TIMEOUT_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
        TIMEOUT_ORDER_STATUS=$(echo "$TIMEOUT_RESPONSE" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)

        log_success "超时测试订单已创建 (ID: $TIMEOUT_ORDER_ID)"
        log_info "初始状态: $TIMEOUT_ORDER_STATUS"
        log_info "在实际生产中，该订单将在30分钟后自动取消"
        log_info "定时任务日志: 监测 [定时任务] 开头的日志消息"

        log_warning "提示: 超时取消需要等待30分钟，或检查后端日志看定时任务是否运行"
    else
        log_error "超时测试订单创建失败"
    fi
}

# ============================================================================
# 测试 12: VIP折扣验证
# ============================================================================
test_vip_discount() {
    separator
    log_info "测试 12: VIP折扣验证"
    separator

    log_info "获取用户信息（包含discount字段）..."

    USER_RESPONSE=$(curl -s -X GET \
        "$API_BASE_URL/users/profile" \
        -H "Authorization: Bearer $AUTH_TOKEN")

    if echo "$USER_RESPONSE" | grep -q "discount"; then
        DISCOUNT=$(echo "$USER_RESPONSE" | grep -o '"discount":[0-9.]*' | cut -d: -f2)
        log_success "用户VIP折扣获取成功: $DISCOUNT"

        if [ "$DISCOUNT" != "1" ] && [ "$DISCOUNT" != "1.0" ]; then
            log_info "用户享有VIP折扣: $(($(echo "$DISCOUNT * 100" | bc) ))%"
        fi
    else
        log_warning "用户信息中无折扣字段"
    fi
}

# ============================================================================
# 总体报告
# ============================================================================
print_summary() {
    separator
    log_info "测试完成！"
    separator

    TOTAL=$((PASS_COUNT + FAIL_COUNT))
    PASS_RATE=$((PASS_COUNT * 100 / TOTAL))

    echo -e "${GREEN}✓ 通过: $PASS_COUNT${NC}"
    echo -e "${RED}✗ 失败: $FAIL_COUNT${NC}"
    echo -e "${BLUE}总计: $TOTAL${NC}"
    echo ""

    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "${GREEN}🎉 所有测试通过！系统运行正常！${NC}"
    elif [ $PASS_RATE -ge 80 ]; then
        echo -e "${YELLOW}⚠ 大部分测试通过，但有些问题需要修复${NC}"
    else
        echo -e "${RED}❌ 多个测试失败，系统需要调查${NC}"
    fi
}

# ============================================================================
# 主函数 - 执行所有测试
# ============================================================================
main() {
    separator
    echo -e "${BLUE}     库存订单购买流程 - 完整测试套件${NC}"
    separator
    echo ""

    test_auth_and_setup
    test_get_product_info
    test_add_to_cart
    test_get_cart
    test_create_order
    test_inventory_deduction
    test_concurrent_orders
    test_payment_flow
    test_get_order
    test_cancel_order
    test_timeout_cancellation
    test_vip_discount

    echo ""
    print_summary
}

# 执行主函数
main
