# AppSumo 新品监控技能

## 用途
每天定时检查 AppSumo 上新的软件，筛选出麦先生可能感兴趣的效率类应用，介绍功能和优惠价格。

## 触发方式
- Cron Job：每天 10:00（Asia/Shanghai）
- Job 名称：`appsumo_daily_check`

## 筛选规则

### ✅ 感兴趣的分类
- Productivity（效率工具）
- Note-taking / Knowledge management（笔记/知识管理）
- Automation / Workflow（自动化/工作流）
- AI tools（AI 工具，但要实用型）
- Writing / Content creation（写作/内容创作）
- Calendar & scheduling（日历/日程）
- Development tools（开发工具，如果是效率相关的）

### ❌ 不感兴趣的分类（跳过）
- SEO / Marketing / Lead generation
- CRM / Sales
- Ecommerce / Email marketing
- Legal / Financial analytics
- Enterprise / Team collaboration（大型企业向）
- Web builders（建站工具，除非特别有创意）

## 检查流程

1. **抓取 AppSumo 新品页面**
   ```
   https://appsumo.com/browse/?ordering=-start_date
   ```

2. **解析产品信息**
   - 产品名称
   - 分类
   - 功能描述
   - 优惠价格 / 原价
   - 优惠截止时间（如果有）

3. **筛选效率类应用**
   - 根据分类和描述判断
   - 优先推荐 Productivity 和 AI 工具

4. **生成推荐消息**
   - 每个产品：名称、功能简介、价格
   - 如果没有感兴趣的新品，不发消息（不打扰）

## 消息模板

```
🛒 AppSumo 今日效率软件推荐

1️⃣ **ProductName** - $XX/终身
   📝 功能简介
   🔗 https://appsumo.com/products/xxx/

2️⃣ ...

有感兴趣的可以点进去看看～
```

## 数据源
- URL: https://appsumo.com/browse/?ordering=-start_date
- 使用 web_fetch 抓取页面内容
- 解析 Markdown 格式的产品列表

## 注意事项
- 只推荐新上架或限时优惠的产品
- 没有感兴趣的新品时不发消息
- 价格以美元显示，终身买断优先
