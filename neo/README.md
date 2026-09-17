# HFI Utility Center Neo

HFI Utility Center Neo 是一个独立的、文段式教室预约前端。它保留现有 Rust
后端的数据与提交契约，用一段可直接编辑的自然语言代替传统分步表单。

页面采用纯白背景、扁平排版和 Astryx Design System。用户点击句子中的下划线
内容后，对应选择区会纵向展开并将后续文字推开；选择完成后仍可再次点击修改。

## 交互流程

1. 页面先显示 3 秒 `HFI Utility Center` 开屏标题。
2. 填写姓名、学号和 `@gdhfi.com` 邮箱前缀。
3. 选择自己所在的校区，再从该校区的实时班级数据中选择班级。
4. 独立选择预约校区，再从该校区的实时教室数据中选择教室。
5. 使用 Astryx Calendar 选择日期。
6. 根据教室开放策略和已有预约，选择 15 分钟粒度的开始与结束时间。
7. 填写理由并选择是否需要多媒体设备。
8. 点击右下角的“完成预约”，经 CSRF 校验后提交到 Rust 后端。
9. 成功页继续使用同一套文段式视觉，显示预约编号和预约摘要。

## 技术栈

- React 19
- TypeScript
- Vite 7
- Astryx Design System 0.6
- Astryx Neutral Theme
- 原生 CSS 动画与响应式布局
- HFI Utility Center Rust API

## 目录结构

```text
neo/
├── src/
│   ├── App.tsx       # 页面状态、文段交互、时间推导与提交逻辑
│   ├── api.ts        # Rust API 客户端与 CSRF 提交
│   ├── main.tsx      # React、Astryx Theme 和全局样式入口
│   ├── styles.css    # 纯白文段布局、展开动画和响应式样式
│   ├── types.ts      # API 与页面状态类型
│   └── vite-env.d.ts
├── index.html
├── vite.config.ts
├── package.json
└── README.md
```

## 架构

Neo 是一个纯客户端单页应用，分为三层：

- **展示层**：`App.tsx` 使用一个连续句子承载预约信息。每个可编辑词语对应一个
  `activePanel`，展开区通过 CSS Grid 与 Flex 布局把后续文字向下推开。
- **领域层**：页面根据教室的 `policies`、星期、当前时间和当天 `occupied`
  区间计算可选时间。结束时间必须与开始时间位于同一开放策略内、不跨越冲突，
  且最长不超过 2 小时。
- **传输层**：`api.ts` 统一解析后端 `{ success, data, message }` 响应。提交前先
  请求 `/_csrf`，再通过 `x-csrf-token` 请求头创建预约。

## 后端接口

默认开发代理目标为 `https://cn.hfiuc.api.743.world`。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/campus/list` | 获取校区 |
| GET | `/class/list` | 获取班级 |
| GET | `/room/list` | 获取教室和开放策略 |
| GET | `/reservation/availability` | 获取教室某日已占用区间 |
| GET | `/_csrf` | 获取一次性 CSRF Token |
| POST | `/reservation/create` | 创建预约 |

公开界面只展示石牌校区和知识城校区，不展示后端的特权校区。学号遵循 Rust
后端要求：`GJ` 加 8 位数字。邮箱只填写前缀，提交时自动补全
`@gdhfi.com`。

## 本地开发

```bash
npm install
npm run dev
```

默认地址为 `http://localhost:5174`。Vite 会把浏览器的 `/api/*` 请求代理到
CN Rust 后端，因此本地开发不需要修改后端 CORS 配置。

## 环境变量

`VITE_API_BASE_URL` 可以覆盖 API 根地址：

```bash
VITE_API_BASE_URL=https://cn.hfiuc.api.743.world
```

未设置时使用 `/api`，适用于本地 Vite 代理或同源部署。跨域部署前需要确保目标
前端域名已加入 Rust 后端的 CORS 白名单。

## 构建与预览

```bash
npm run build
npm run preview
```

生产文件输出到 `dist/`。`dist/` 和 `node_modules/` 不应提交到 Git。

## 预约提交结构

```json
{
  "room": 14,
  "startTime": 1780000000,
  "endTime": 1780000900,
  "studentName": "Name",
  "studentId": "GJ00000000",
  "email": "name@gdhfi.com",
  "reason": "Reason",
  "classId": 1,
  "purposeType": "personal",
  "needsMultimedia": false
}
```

日期和时间按上海时区转换为 Unix 时间戳。最终合法性仍由 Rust 后端校验，包括
开放策略、冲突、未来 30 天限制、每日预约次数和最长 2 小时限制。

## 设计约束

- 不使用卡片、仪表盘或分步向导。
- 选择项使用透明背景和下划线；选中勾与文字保持同一行。
- 班级和教室使用独立按钮并自动换行，内容较多时在固定高度区域内滚动。
- 多媒体选项的句号始终留在原句末尾，不随展开区移动。
- 页脚仅显示居中的 `DESIGNED BY MAKERs'`。
