# 文本分类模型训练

一个简单的文本分类模型训练应用，帮助学生理解机器学习的基本流程。基于朴素贝叶斯算法，通过标注数据来训练一个能区分"表扬"和"批评"的文本分类模型。

本项目是 [Mo](https://momodel.cn) 人工智能教学平台的示例项目之一。Mo 平台提供了丰富的 AI 教学资源和实践环境，欢迎访问 [app.momodel.cn](https://app.momodel.cn) 探索更多有趣的 AI 项目。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frisonsimon%2Fclaude-artifacts-react)
[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/risonsimon/claude-artifacts-react)

## 功能特点

- **数据标注**：标注"表扬"和"批评"两类文本数据
- **模型训练**：使用朴素贝叶斯算法训练分类模型
- **特征分析**：可视化展示模型学习到的特征词
- **模型测试**：实时测试模型的分类效果和置信度

## 使用说明

1. 在"数据标注"页面输入文本并标注为"表扬"或"批评"（至少需要6条数据）
2. 切换到"模型训练"页面，点击"开始训练"按钮训练模型
3. 在"模型测试"页面输入新的文本进行测试，查看分类结果和置信度

## 本地开发

1. 克隆仓库：
   ```bash
   git clone [仓库地址]
   cd [项目目录]
   ```

2. 安装依赖：
   ```bash
   pnpm install
   ```

3. 启动开发服务器：
   ```bash
   pnpm run dev --host 0.0.0.0
   ```

4. 构建生产版本：
   ```bash
   pnpm run build
   ```

## 技术栈

- React
- TailwindCSS
- shadcn/ui
- 朴素贝叶斯分类算法

## 教学建议

- 鼓励学生使用自己的例子进行标注
- 引导学生观察特征词分析，理解模型的学习过程
- 通过增加数据量来体验模型效果的提升

## 更多资源

想要了解更多 AI 相关的实践项目？欢迎：

- 访问 [Mo](https://momodel.cn) 官网
- 在 [Mo App](https://app.momodel.cn) 探索更多教学项目
- 关注我们，了解最新的 AI 教育资源

## License

MIT License
