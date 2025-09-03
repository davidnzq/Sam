# longPort AI Pro

longPort AI Pro 是一个浏览器扩展程序，专门为 Notion、LongPort 文档平台等提供 AI 辅助写作和文本优化功能。该工具旨在提升用户的文档编写效率和内容质量。

## 功能特点

- 文本智能优化
- 支持普通模式和严格模式
- 快捷键操作 (Alt+O)
- 右键菜单集成
- 可自定义 API 设置

## 开发环境设置

### 前置条件

- Node.js (推荐 v16 或更高版本)
- npm 或 yarn

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn
```

### 开发模式

```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

### 构建扩展

```bash
# 使用 npm
npm run build

# 或使用 yarn
yarn build
```

## 在浏览器中加载扩展

### Chrome 浏览器

1. 打开 Chrome 浏览器
2. 在地址栏中输入 `chrome://extensions/`
3. 在右上角启用"开发者模式"
4. 点击"加载已解压的扩展程序"按钮
5. 选择项目的 `dist` 目录
6. 扩展程序将被加载到浏览器中

### Edge 浏览器

1. 打开 Edge 浏览器
2. 在地址栏中输入 `edge://extensions/`
3. 在左侧启用"开发人员模式"
4. 点击"加载解压缩的扩展"按钮
5. 选择项目的 `dist` 目录
6. 扩展程序将被加载到浏览器中

## 权限说明

本扩展使用以下权限：

- `storage`: 用于存储用户设置和配置
- `<all_urls>`: 用于在所有网站上运行内容脚本，以便提供文本优化功能

## 项目结构

```
longport-AI-Pro/
├── public/                 # 静态资源
│   └── icons/              # 扩展图标
├── src/                    # 源代码
│   ├── background/         # 后台脚本
│   ├── content/            # 内容脚本
│   ├── popup/              # 弹出窗口
│   └── options/            # 选项页面
├── manifest.json           # 扩展清单文件
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript 配置
├── webpack.config.js       # Webpack 配置
└── README.md               # 项目说明
```

## 许可证

MIT
