# Shaving Tools Project

这是一个基于 Turborepo 的 monorepo 项目。

## 项目结构

```
.
├── apps/          # 主要应用项目
├── packages/      # 共享包和工具库
├── turbo.json     # Turborepo 配置
└── package.json   # 根配置
```

## 开始使用

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

### 格式化代码

```bash
pnpm format
```

## 技术栈

- **Turborepo** - 高性能构建系统
- **pnpm** - 快速、节省磁盘空间的包管理器
- **TypeScript** - 类型安全

## 了解更多

- [Turborepo 文档](https://turbo.build/repo/docs)
- [pnpm 文档](https://pnpm.io/)
