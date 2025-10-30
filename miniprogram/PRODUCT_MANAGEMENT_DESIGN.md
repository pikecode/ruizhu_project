# 商品管理系统设计方案

## 一、问题分析

商品管理中的**分类**、**标签**、**分组**容易混淆。让我先区分这些概念：

```
分类（Category）  - 商品的自然分类（包、鞋、钱包等）
标签（Tags）     - 商品的属性标签（新品、热销、推荐等）
分组（Group）    - 为了运营目标的人工分组（限时折扣、爆款等）
```

---

## 二、三维度对比

### 2.1 分类 vs 标签 vs 分组

```
维度          分类             标签            分组
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
定义          商品自然属性      商品运营属性    临时活动分组
数量          3-5级，固定       10-20个，多个   5-10个，临时
一对多        1个商品1个分类    1个商品多个标签 1个商品多个分组
树形          ✅ 树形结构       ❌ 平面结构     ❌ 平面结构
更新频率      低（很少改）      高（经常改）   高（活动改）
示例          女性包 > 单肩包   热销、推荐     七夕特惠、爆款
```

### 2.2 PRADA小程序的具体应用

```
分类体系：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ 女性包款
│  ├─ 手袋
│  │  ├─ 单肩包
│  │  ├─ 斜挎包
│  │  └─ 手提包
│  ├─ 背包
│  └─ 钱包
│
├─ 男性配饰
│  ├─ 皮鞋
│  ├─ 腰带
│  └─ 帽子
│
└─ 配件
   ├─ 围巾
   ├─ 手套
   └─ 眼镜

标签系统：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
√ 新品     - 最近上架的商品
√ 热销     - 销量最高的商品
√ 推荐     - 运营精选推荐
√ 特价     - 打折促销的商品
√ 限量     - 库存有限的商品
√ 明星款   - 明星同款
√ 粉丝同款 - 粉丝推荐款

分组系统（活动分组）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
活动ID | 活动名称    | 参与商品
────────┼────────────┼────────────
001   | 七夕特惠    | 精选5件商品
002   | 爆款推荐    | 热销TOP10
003   | 新品上市    | 最近新增10件
004   | 限时折扣    | 指定8件商品
005   | VIP专享    | 会员专属商品
```

---

## 三、数据库设计

### 3.1 分类表（categories）

```sql
CREATE TABLE categories (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  parent_id       INT,                    -- 父分类ID（null表示一级分类）
  name            VARCHAR(100) NOT NULL,  -- 分类名称
  icon            VARCHAR(255),           -- 分类图标URL
  description     TEXT,                   -- 分类描述
  sort_order      INT DEFAULT 0,          -- 排序（从小到大）
  status          TINYINT DEFAULT 1,      -- 状态：1正常 0禁用
  seo_title       VARCHAR(100),           -- SEO标题
  seo_keywords    VARCHAR(200),           -- SEO关键词
  seo_description VARCHAR(200),           -- SEO描述
  created_at      DATETIME,
  updated_at      DATETIME,

  FOREIGN KEY (parent_id) REFERENCES categories(id),
  KEY idx_parent_id (parent_id),
  KEY idx_status (status)
);
```

**示例数据：**
```
id | parent_id | name    | sort_order | status
───┼───────────┼─────────┼────────────┼────────
1  | NULL      | 女性包款 | 1         | 1
2  | 1         | 手袋    | 1         | 1
3  | 2         | 单肩包  | 1         | 1
4  | 2         | 斜挎包  | 2         | 1
5  | NULL      | 男性配饰 | 2         | 1
6  | 5         | 皮鞋    | 1         | 1
```

### 3.2 标签表（tags）

```sql
CREATE TABLE tags (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(50) NOT NULL UNIQUE,  -- 标签名称
  color           VARCHAR(20),                  -- 标签颜色（十六进制）
  description     TEXT,                        -- 标签说明
  icon            VARCHAR(255),                -- 标签图标
  is_system       TINYINT DEFAULT 0,           -- 是否系统标签（不可删除）
  sort_order      INT DEFAULT 0,               -- 排序
  status          TINYINT DEFAULT 1,           -- 状态
  created_at      DATETIME,
  updated_at      DATETIME,

  KEY idx_status (status)
);
```

**示例数据：**
```
id | name    | color   | is_system | sort_order
───┼─────────┼─────────┼───────────┼───────────
1  | 新品    | #FF5733 | 1         | 1
2  | 热销    | #E74C3C | 1         | 2
3  | 推荐    | #F39C12 | 1         | 3
4  | 特价    | #27AE60 | 1         | 4
5  | 限量    | #8E44AD | 1         | 5
6  | 明星款  | #3498DB | 0         | 6
```

### 3.3 商品-标签关联表（product_tags）

```sql
CREATE TABLE product_tags (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  product_id      INT NOT NULL,
  tag_id          INT NOT NULL,
  created_at      DATETIME,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id),
  UNIQUE KEY unique_product_tag (product_id, tag_id),
  KEY idx_tag_id (tag_id)
);
```

**示例数据：**
```
id | product_id | tag_id | 说明
───┼────────────┼────────┼──────────────────────────
1  | 1001       | 1      | 商品1001打上"新品"标签
2  | 1001       | 3      | 商品1001打上"推荐"标签
3  | 1002       | 2      | 商品1002打上"热销"标签
4  | 1002       | 4      | 商品1002打上"特价"标签
```

### 3.4 分组表（product_groups）

```sql
CREATE TABLE product_groups (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(100) NOT NULL,  -- 分组名称
  description     TEXT,                   -- 分组描述
  group_type      VARCHAR(50),            -- 分组类型：activity/recommend/sale
  image_url       VARCHAR(255),           -- 分组封面图
  start_date      DATETIME,               -- 开始时间
  end_date        DATETIME,               -- 结束时间
  sort_order      INT DEFAULT 0,          -- 排序
  status          TINYINT DEFAULT 1,      -- 状态：1活跃 0已结束
  created_at      DATETIME,
  updated_at      DATETIME,

  KEY idx_status (status),
  KEY idx_group_type (group_type)
);
```

**示例数据：**
```
id | name      | group_type | start_date    | end_date      | status
───┼───────────┼────────────┼───────────────┼───────────────┼────────
1  | 七夕特惠  | activity   | 2024-08-20    | 2024-08-30    | 1
2  | 爆款推荐  | recommend  | 2024-08-01    | NULL          | 1
3  | 新品上市  | sale       | 2024-08-15    | NULL          | 1
```

### 3.5 分组-商品关联表（group_products）

```sql
CREATE TABLE group_products (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  group_id        INT NOT NULL,
  product_id      INT NOT NULL,
  sort_order      INT DEFAULT 0,  -- 在分组中的排序位置
  created_at      DATETIME,

  FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE KEY unique_group_product (group_id, product_id),
  KEY idx_group_id (group_id)
);
```

**示例数据：**
```
id | group_id | product_id | sort_order
───┼──────────┼────────────┼───────────
1  | 1        | 1001       | 1
2  | 1        | 1002       | 2
3  | 1        | 1003       | 3
4  | 2        | 1001       | 1
5  | 2        | 1004       | 2
```

### 3.6 商品表（products）- 关键字段

```sql
CREATE TABLE products (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  name                VARCHAR(200) NOT NULL,
  category_id         INT NOT NULL,         -- ⭐ 关键：分类ID
  sku                 VARCHAR(100),
  description         TEXT,
  price               DECIMAL(10, 2),
  stock               INT,
  sold_count          INT DEFAULT 0,
  status              TINYINT DEFAULT 1,
  created_at          DATETIME,
  updated_at          DATETIME,

  FOREIGN KEY (category_id) REFERENCES categories(id),
  KEY idx_category_id (category_id),
  KEY idx_status (status)
);
```

---

## 四、查询场景设计

### 4.1 按分类查询商品

```sql
-- 查询"女性包款 > 手袋 > 单肩包"下的所有商品
SELECT p.*
FROM products p
WHERE p.category_id = 3  -- 单肩包的ID
AND p.status = 1
ORDER BY p.sort_order, p.created_at DESC;
```

### 4.2 按标签查询商品

```sql
-- 查询所有"热销"标签的商品
SELECT p.*
FROM products p
INNER JOIN product_tags pt ON p.id = pt.product_id
INNER JOIN tags t ON pt.tag_id = t.id
WHERE t.name = '热销'
AND p.status = 1
ORDER BY p.sold_count DESC;
```

### 4.3 按分组查询商品

```sql
-- 查询"七夕特惠"活动中的所有商品
SELECT p.*
FROM products p
INNER JOIN group_products gp ON p.id = gp.product_id
INNER JOIN product_groups pg ON gp.group_id = pg.id
WHERE pg.name = '七夕特惠'
AND pg.status = 1
ORDER BY gp.sort_order;
```

### 4.4 多条件组合查询

```sql
-- 查询：女性包款 > 手袋 中，带有"新品"和"推荐"标签的商品
SELECT DISTINCT p.*
FROM products p
WHERE p.category_id = 2  -- 手袋
AND p.status = 1
AND EXISTS (
  SELECT 1 FROM product_tags pt
  INNER JOIN tags t ON pt.tag_id = t.id
  WHERE pt.product_id = p.id
  AND t.name IN ('新品', '推荐')
)
ORDER BY p.created_at DESC;
```

---

## 五、前端UI设计

### 5.1 商品列表页面结构

```
┌────────────────────────────────────────┐
│           商品管理                      │
├─────────────────┬──────────────────────┤
│  筛选面板       │   商品列表            │
│                │                      │
│ [分类树]       │ ┌──────────────────┐ │
│ ├─ 女性包款   │ │ 商品1  ★ ★ ★   │ │
│ │ ├─ 手袋    │ │ ¥2,890 [新][推]  │ │
│ │ │ ├─ 单肩包 │ │                  │ │
│ │ │ ├─ 斜挎包 │ │ [编辑][删除]      │ │
│ │ │ └─ 手提包 │ │                  │ │
│ │ ├─ 背包    │ │ ┌──────────────────┐ │
│ │ └─ 钱包    │ │ │ 商品2  ★ ★    │ │
│ └─ 男性配饰   │ │ ¥5,990 [热][特]  │ │
│   ├─ 皮鞋    │ │                  │ │
│   └─ 腰带    │ │ [编辑][删除]      │ │
│                │ └──────────────────┘ │
│ [标签筛选]     │                      │
│ □ 新品         │                      │
│ □ 热销         │                      │
│ □ 推荐         │                      │
│ □ 特价         │                      │
│                │                      │
│ [分组筛选]     │ [分页]              │
│ □ 七夕特惠    │                      │
│ □ 爆款推荐    │                      │
│ □ 新品上市    │                      │
└────────────────┴──────────────────────┘
```

### 5.2 商品编辑页面

```
商品编辑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

基本信息
├─ 商品名称：[________Prada Explore 中号单肩包________]
├─ SKU编码：[________20240815001________]
└─ 描述：[________多行文本编辑器________]

分类设置  ⭐ 重要
├─ 选择分类：[女性包款 / 手袋 / 单肩包 ▼]
└─ 说明：同一商品只能属于一个分类

标签设置
├─ 选择标签：(多选)
│  ☑ 新品
│  ☑ 推荐
│  ☐ 热销
│  ☐ 特价
│  ☐ 限量
└─ 说明：可选多个标签

分组设置
├─ 加入分组：(多选)
│  ☑ 七夕特惠 (排序: 1)
│  ☑ 爆款推荐 (排序: 2)
│  ☐ 新品上市
│  ☐ VIP专享
└─ 说明：可参加多个活动

价格库存
├─ 价格：[_____¥2,890_____]
└─ 库存：[_____100_____]

[保存] [取消] [预览]
```

---

## 六、后端API设计

### 6.1 分类相关API

```
GET     /api/admin/categories              获取分类树
POST    /api/admin/categories              创建分类
PUT     /api/admin/categories/{id}         编辑分类
DELETE  /api/admin/categories/{id}         删除分类
GET     /api/admin/categories/{id}/products 获取分类下的商品
```

### 6.2 标签相关API

```
GET     /api/admin/tags                    获取所有标签
POST    /api/admin/tags                    创建标签
PUT     /api/admin/tags/{id}               编辑标签
DELETE  /api/admin/tags/{id}               删除标签
```

### 6.3 分组相关API

```
GET     /api/admin/groups                  获取所有分组
POST    /api/admin/groups                  创建分组
PUT     /api/admin/groups/{id}             编辑分组
DELETE  /api/admin/groups/{id}             删除分组
POST    /api/admin/groups/{id}/add-products    添加商品到分组
DELETE  /api/admin/groups/{id}/products/{pid}  从分组移除商品
```

### 6.4 商品查询API

```
GET     /api/admin/products?category_id=3&tags=1,3&group_id=1
        查询：分类3 + 标签1和3 + 分组1 中的商品

返回：
{
  code: 200,
  data: {
    total: 50,
    page: 1,
    size: 20,
    items: [
      {
        id: 1001,
        name: "Prada Explore 中号单肩包",
        category_id: 3,
        category_name: "单肩包",
        price: 2890,
        stock: 100,
        sold_count: 250,
        tags: ["新品", "推荐"],
        groups: ["七夕特惠", "爆款推荐"],
        status: 1,
        created_at: "2024-08-15 10:30:00"
      },
      ...
    ]
  }
}
```

---

## 七、最佳实践建议

### 7.1 分类设计建议

```
✅ 推荐做法：
  1. 分类层级不超过3级（一级 > 二级 > 三级）
  2. 每个一级分类下有5-8个二级分类
  3. 定期审查，删除无商品的分类
  4. 分类名称要短（2-4个字）

❌ 避免的做法：
  1. 分类层级过深（超过4级）
  2. 分类数量过多（超过50个）
  3. 同级分类有重叠
  4. 分类名称太长或模糊
```

**PRADA示例：**
```
✅ 好的分类结构：
一级分类（2个）
├─ 女性包款     ← 2-4字
│  ├─ 手袋      ← 2-4字
│  ├─ 背包      ← 2-4字
│  └─ 钱包      ← 2-4字
└─ 男性配饰     ← 2-4字

❌ 不好的分类结构：
├─ 女性包款和钱包  ← 太长
├─ 手袋、背包、鞋  ← 混乱
└─ 其他           ← 太模糊
```

### 7.2 标签设计建议

```
✅ 推荐做法：
  1. 标签数量控制在10-20个
  2. 标签名称简短（2-4字）
  3. 避免标签重复或重叠
  4. 每个标签都用不同颜色标识
  5. 系统标签（新品、热销）要固定

❌ 避免的做法：
  1. 标签太多（超过30个）
  2. 标签名称重复（"推荐"和"精选"）
  3. 一个商品打超过5个标签
  4. 标签颜色雷同
```

**PRADA示例：**
```
✅ 清晰的标签系统：
新品    （红色）  - 7天内上架
热销    （橙色）  - 销量TOP100
推荐    （黄色）  - 编辑精选
特价    （绿色）  - 折扣商品
限量    （紫色）  - 库存<50
明星款  （蓝色）  - 明星同款

❌ 混乱的标签系统：
推荐、精选、热门、爆款  ← 重复
新、新品、新上市、刚到货  ← 重复
官方推荐、编辑推荐     ← 混乱
```

### 7.3 分组设计建议

```
✅ 推荐做法：
  1. 分组数量5-10个，每个代表一个运营活动
  2. 分组要有明确的开始和结束时间
  3. 每个分组10-50件商品
  4. 分组内的商品有明确排序
  5. 定期更新和维护

❌ 避免的做法：
  1. 分组太多（超过20个）
  2. 分组没有时间限制（永远活跃）
  3. 一个分组只有1-2件商品
  4. 分组和标签重复
  5. 分组长时间不更新
```

**PRADA示例：**
```
✅ 清晰的分组：
七夕特惠       | 2024-08-20 ~ 2024-08-30 | 5件 | 活动中
秋季新品上市   | 2024-09-01 ~ 2024-09-30 | 20件 | 规划中
爆款推荐       | 持续更新                | 10件 | 长期
VIP会员专享    | 持续更新                | 8件 | 长期

❌ 混乱的分组：
推荐  | 无日期 | 100件  | 不知道什么时候活跃
新品  | 无日期 | 200件  | 新品永远不过期
```

---

## 八、数据维护流程

### 8.1 日常维护

```
日报：
□ 检查商品库存 (<50件库存预警)
□ 检查待发货订单

周报：
□ 更新热销标签 (根据销量)
□ 检查分类完整性 (是否有商品缺分类)
□ 更新活动分组

月报：
□ 审查分类结构 (删除空分类)
□ 审查标签使用情况 (删除没人用的标签)
□ 审查已过期的活动分组
```

### 8.2 常见维护任务

**任务1：添加新品**
```
1. 创建商品基本信息
2. 选择分类：女性包款 > 手袋 > 单肩包
3. 添加标签：新品 ✓ 推荐 ✓
4. 加入分组：秋季新品上市
5. 设置价格和库存
6. 点击发布
```

**任务2：开始新活动**
```
1. 创建分组：名称="双十一特惠"
2. 设置时间：2024-11-01 ~ 2024-11-11
3. 选择参与商品：10-20件
4. 排序商品：热销靠前
5. 发布活动
```

**任务3：更新热销标签**
```
1. 查询过去7天销量TOP30
2. 移除7天前打上的"热销"标签
3. 给TOP30商品打上"热销"标签
4. 完成
```

---

## 九、性能优化建议

### 9.1 数据库索引

```sql
-- 关键索引
ALTER TABLE products ADD INDEX idx_category_id (category_id);
ALTER TABLE products ADD INDEX idx_status (status);
ALTER TABLE product_tags ADD INDEX idx_product_id (product_id);
ALTER TABLE product_tags ADD INDEX idx_tag_id (tag_id);
ALTER TABLE group_products ADD INDEX idx_group_id (group_id);
ALTER TABLE group_products ADD INDEX idx_product_id (product_id);
```

### 9.2 查询优化

```javascript
// ❌ 不好：N+1查询问题
const products = await db.query('SELECT * FROM products WHERE category_id = ?', [3]);
for (let p of products) {
  const tags = await db.query('SELECT * FROM product_tags WHERE product_id = ?', [p.id]);
  p.tags = tags;  // 多次查询！
}

// ✅ 好：一次查询获取所有关联数据
const products = await db.query(`
  SELECT p.*, GROUP_CONCAT(t.name) as tags
  FROM products p
  LEFT JOIN product_tags pt ON p.id = pt.product_id
  LEFT JOIN tags t ON pt.tag_id = t.id
  WHERE p.category_id = ?
  GROUP BY p.id
`, [3]);
```

### 9.3 缓存策略

```javascript
// 缓存分类树（3小时更新一次）
cache.set('category_tree', categoryTree, 3 * 60 * 60);

// 缓存热销标签商品（1小时更新一次）
cache.set('hot_sale_products', hotProducts, 1 * 60 * 60);

// 缓存活动分组（15分钟更新一次）
cache.set('active_groups', groups, 15 * 60);
```

---

## 十、总结对比表

| 功能 | 分类 | 标签 | 分组 |
|------|------|------|------|
| **目的** | 商品分类 | 商品属性 | 活动运营 |
| **个数** | 3-5级 | 10-20个 | 5-10个 |
| **关系** | 1商品1分类 | 1商品多标签 | 1商品多分组 |
| **更新** | 很少 | 经常 | 经常 |
| **示例** | 女>手袋>单肩 | 新品、热销 | 七夕特惠 |
| **数据库** | categories | tags + product_tags | product_groups + group_products |
| **前端展示** | 树形菜单 | 标签显示 | 活动卡片 |

---

## 实施步骤

### 1️⃣ 第一周：基础建设
```
□ 创建分类表（categories）
□ 创建标签表（tags）
□ 创建分组表（product_groups）
□ 创建关联表 (product_tags, group_products)
□ 添加必要索引
```

### 2️⃣ 第二周：后端接口
```
□ 分类 CRUD API
□ 标签 CRUD API
□ 分组 CRUD API
□ 商品查询API（支持多条件）
```

### 3️⃣ 第三周：前端UI
```
□ 分类树形菜单
□ 商品列表 + 筛选面板
□ 商品编辑 + 分类标签分组配置
□ 分组管理 + 商品排序
```

### 4️⃣ 第四周：测试 + 优化
```
□ 功能测试
□ 性能测试 + 优化
□ 部署上线
```
