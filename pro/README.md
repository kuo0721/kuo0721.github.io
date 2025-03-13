# 智能编程助手

一个基于Deepseek AI的智能编程助手，集成代码编辑、分析和优化功能，帮助开发者提高编程效率。

## 功能特点

### 代码编辑与分析
- 内置代码编辑器，支持多种编程语言
- 自动语言检测功能
- 代码分析与优化建议
- 代码差异对比查看器，直观展示AI建议的代码修改

### AI对话功能
- 基于Deepseek AI模型的智能对话
- 预设多种编程相关提示模板
- 支持代码解释、优化、调试等多种场景
- Markdown格式化输出，支持代码高亮

### 网络搜索集成
- 集成SerpAPI进行实时网络搜索
- 结合代码上下文进行更精准的搜索
- 搜索结果直接展示在对话界面

### 会话管理
- 自动保存对话历史
- 支持创建、切换和删除会话
- 基于IndexedDB的本地存储方案

## 技术栈

- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Monaco Editor (代码编辑器)
- IndexedDB (本地存储)

## 快速开始

### 前提条件

- Node.js 18.0.0 或更高版本
- npm 或 yarn 包管理器
- Deepseek API 密钥 (用于AI对话功能)
- SerpAPI 密钥 (可选，用于网络搜索功能)

### 安装步骤

1. 克隆仓库

```bash
解压即可
```
2. 安装依赖
```bash
npm install
# 或
yarn install
 ```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
 ```

4. 打开浏览器访问 http://localhost:3000