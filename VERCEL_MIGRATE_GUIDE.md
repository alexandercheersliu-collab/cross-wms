# Vercel 数据库迁移详细步骤

## 步骤 1：创建 Postgres 数据库

1. 打开 Vercel Dashboard
   - 访问：https://vercel.com/alexandercheersliu-collabs-projects/cross-wms

2. 点击 **Storage** 标签
   ![位置：页面顶部导航栏，在 Deployments 右边]

3. 点击 **Create Database** 按钮

4. 选择 **Postgres** → 点击 **Continue**

5. 配置数据库：
   - **Region**: 选择 `Washington, D.C.` (us-east-1) - 与部署区域一致
   - 点击 **Create**

6. 连接数据库到项目：
   - 创建后点击 **Connect Project**
   - 选择 `cross-wms`
   - 点击 **Connect**

   ✅ 环境变量会自动添加到项目中

---

## 步骤 2：运行数据库迁移

### 方法 A：使用 Vercel Console（推荐）

1. 进入项目页面
   https://vercel.com/alexandercheersliu-collabs-projects/cross-wms

2. 点击顶部 **Console** 标签
   ![位置：页面顶部，Overview / Deployments / Logs / Console]

3. 选择环境：
   - 下拉菜单选择 **production**

4. 在命令行输入框中粘贴以下命令：
   ```bash
   npx prisma migrate deploy
   ```

5. 按 **Enter** 或点击运行按钮

6. 等待执行完成，你应该看到：
   ```
   Prisma schema loaded from prisma/schema.prisma
   Datasource "db": PostgreSQL database "verceldb" at "xxx.vercel-storage.com:5432"
   
   10 migrations found in prisma/migrations
     
   Applying migration `20250101_init`
   
   The following migration(s) have been applied:
   
   migrations/
   └─ 20250101_init/
      └─ migration.sql
   
   All migrations have been successfully applied.
   ```

### 方法 B：使用 Vercel CLI

如果你有 Vercel CLI 并已登录：

```bash
# 运行远程命令
vercel --cwd /path/to/project --prod npx prisma migrate deploy
```

---

## 步骤 3：验证部署

迁移完成后：

1. 访问网站：https://cross-wms.vercel.app

2. 使用默认账号登录：
   - 用户名：`admin`
   - 密码：`admin123`

3. 测试功能：
   - 创建商品
   - 查看库存
   - 创建订单

---

## 常见问题

### Q1: 提示 "No migrations found"
需要先生成迁移文件：
```bash
# 在本地运行
npx prisma migrate dev --name init

git add prisma/migrations
git commit -m "添加数据库迁移"
git push
```

### Q2: 提示 "Database does not exist"
数据库还没创建好，请先完成步骤 1。

### Q3: 提示 "Can't reach database"
检查 DATABASE_URL 环境变量是否正确设置：
1. Vercel Dashboard → Project Settings → Environment Variables
2. 确认有 `DATABASE_URL` 变量
3. 如果没有，从 Storage → Postgres → .env.local 复制

### Q4: 提示 "Migration already applied"
这是正常的，表示迁移已经执行过了。

---

## 迁移后数据结构

迁移成功后，数据库会创建以下表：

- `Product` - 商品信息
- `Inventory` - 库存记录
- `InventoryTransaction` - 库存变动记录
- `Order` - 订单
- `OrderItem` - 订单明细
- `Receiving` / `ReceivingItem` - 入库单
- `Shipment` / `ShipmentItem` - 出库单
- `Stocktake` / `StocktakeItem` - 盘点单

---

## 需要帮助？

如果遇到问题：
1. 查看 Vercel 构建日志：Dashboard → Deployments → 最新部署 → Build Logs
2. 查看运行时日志：Dashboard → Logs
3. 检查数据库连接：Vercel Console 中运行 `npx prisma validate`
