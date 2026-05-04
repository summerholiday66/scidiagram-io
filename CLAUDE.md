# CLAUDE.md

## 项目定位

- 项目名：`scidiagram-io`
- 对外品牌：`SciDiagram.io`
- 当前阶段：`付费 MVP`
- 核心产品：生成论文级 `Molecular Orbital` 图的在线工具
- 目标用户优先级：
  - `Priority 1`：研究生、科研作者
  - `Priority 2`：理科本科生
  - `Priority 3`：学术博主、科普创作者

## 技术架构

- 框架：`Next.js` + `TypeScript` + `Tailwind CSS`
- 路由：`App Router`
- 渲染核心：前端 `SVG` 渲染
- 鉴权：`Supabase Auth`（Google OAuth）
- 数据库：`Supabase PostgreSQL`
- 支付：`PayPal`
- 部署：`Cloudflare Pages`
- 服务端逻辑：需要
- AI 生成策略：
  - 常见分子优先查表
  - 未命中时调用 AI 返回结构化 JSON
  - AI 结果必须可标记为 `AI Generated`

## 目录规则

- `app/`：页面、路由、Server Components
- `components/`：UI 和 SVG 绘图组件
- `lib/`：学术逻辑、数据转换器、服务接入
- `types/`：TypeScript 类型定义
- `references/`：标准 MO 图参考资料
- `public/`：静态资源

## 开发约束

- 默认语言：仅英文
- 视觉方向：`Clean Academic`
- 不要使用紫色科技风、卡通风、深色优先设计
- 编辑器画布默认白底，线条保持精细克制
- 第一版不做 3D 渲染
- 第一版不做深度量化化学计算
- 第一版不做复杂社交功能
- 分子支持范围以常见同核/异核双原子分子为主，多原子仅实验性支持
- 涉及付费权限的导出逻辑必须在服务端边界校验，不只依赖前端状态
- secret 不写入仓库，只通过环境变量或平台配置管理

## 验证要求

- 依赖安装后至少验证：
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- 新增或修改分子数据时，必须检查：
  - JSON schema 是否兼容
  - SVG 渲染是否无错位
  - 免费/付费导出状态是否符合预期
