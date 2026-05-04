# PROJECT_MEMORY.md

## 项目定位

- 项目名：`scidiagram-io`
- 项目路径：`/root/.openclaw/workspace/project/scidiagram-io`
- 仓库地址：`待创建`
- 对外品牌：`SciDiagram.io`
- 核心一句话：`Generate publication-ready Molecular Orbital diagrams in seconds with AI.`

## 部署与访问

- 开发访问地址：`待本地启动后确认`
- 生产地址：`待绑定域名`
- 部署链路：`Git -> Cloudflare Pages -> Edge runtime / hosted Next app`

## 运行说明

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 类型检查：`npm run typecheck`
- 代码检查：`npm run lint`
- 生产构建：`npm run build`
- 日志位置：`待部署后补充`

## 环境变量索引

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `OPENAI_API_KEY` 或后续选定模型供应商变量

说明：

- 真实 secret 不写入此文件
- Cloudflare Pages 环境变量作为生产配置来源

## 项目专属技术约束

- 由于 `Cloudflare next-on-pages` 当前版本兼容性要求，初始化脚手架已使用 `Next.js 15.x` 组合而不是原始设想的 `14.x`
- 常见双原子分子必须数据库优先，不依赖 AI 生成
- AI 只负责把输入转换成结构化能级数据，不承担精确量化计算
- 免费版导出：带水印 PNG
- 付费版导出：无水印 SVG / PDF
- SVG 是核心输出格式，PNG / PDF 由 SVG 派生
- 首版视觉以白底学术编辑器风格为准

## 标准数据与业务记忆

- 分子能级 JSON 需要长期保持 schema 稳定
- PayPal 的订阅 / 单次支付 webhook 逻辑属于高优先级长期记忆
- Cloudflare Pages 的构建命令和部署约束需要长期记录
- 已确认产品形态：`Landing Page + /editor`
- 已确认用户优先级：
  - `P1` 研究生 / 科研作者
  - `P2` 理科本科生
  - `P3` 学术创作者
