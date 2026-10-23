# 「Hello-Agents：从零开始构建智能体」学习系列配置（study_build.py 读取）
PREFIX = '2026-10-22-helloagents'
SERIES_KEY = 'helloagents-series'
PARTS = [
    ('', '总览', '复习台'),
    ('1', '01', '初识智能体'), ('2', '02', '发展史'), ('3', '03', 'LLM 基础'), ('4', '04', '经典范式'),
    ('5', '05', '低代码平台'), ('6', '06', '框架实践'), ('7', '07', '自建框架'), ('8', '08', '记忆与检索'),
    ('9', '09', '上下文工程'), ('10', '10', '通信协议'), ('11', '11', 'Agentic RL'), ('12', '12', '性能评估'),
    ('13', '13', '综合案例'),
]
FULL = {
    '1': '初识智能体：一个循环跑起来', '2': '智能体发展史：从规则到模型', '3': '大语言模型基础：Agent 的大脑',
    '4': '经典范式：ReAct、Plan-and-Solve、Reflection', '5': '低代码平台：Coze、Dify、n8n',
    '6': '框架实践：AutoGen、AgentScope、CAMEL、LangGraph', '7': '自建框架：从零写 HelloAgents',
    '8': '记忆与检索：Memory 与 RAG', '9': '上下文工程：给模型看什么', '10': '通信协议：MCP、A2A、ANP',
    '11': 'Agentic RL：从 SFT 到 GRPO', '12': '性能评估：基准、指标与 LLM Judge', '13': '综合案例与毕业设计',
}
REPO = 'https://github.com/datawhalechina/hello-agents'
REPO_NAME = 'datawhalechina/hello-agents'
BOOK = 'Hello-Agents：从零开始构建智能体'
AUTHOR = 'Datawhale 社区编写的开源教程，CC BY-NC-SA 4.0 协议；本笔记依据 2026 年 10 月 14 日的仓库版本'
BOOK_KIND = '开源教程'
CREDIT = '原书十六章，按“概念 → 手写范式 → 平台与框架 → 自研框架 → 记忆、上下文、协议、训练、评估 → 综合案例”展开，代码量很大。这里重排成十三篇，用自己的话重讲：代码只保留能看清机制的骨架，做成可以逐行走读、可以填空回忆的互动；每篇末尾配原书面试题清单里的相关题目做口述演练。每节标出对应的原书章节，演示数值标“示意”。笔记同样按 CC BY-NC-SA 4.0 共享。'
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='8.5' fill='none' stroke='%2313171C' stroke-width='2'/%3E%3Cpath d='M12 3.5v4M20.5 12h-4M12 20.5v-4M3.5 12h4' stroke='%2313171C' stroke-width='1.8'/%3E%3Ccircle cx='12' cy='12' r='2.6' fill='%232340D6'/%3E%3C/svg%3E"
