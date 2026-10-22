# 「AI Agent Handbook（阿里云）」学习系列配置（study_build.py 读取）
PREFIX = '2026-10-22-handbook'
SERIES_KEY = 'handbook-series'
PARTS = [
    ('', '总览', '架构地图'),
    ('1', '01', '新阶段'), ('2', '02', '参考架构'), ('3', '03', 'Harness'), ('4', '04', '任务'),
    ('5', '05', '信息'), ('6', '06', '行动'), ('7', '07', '运行与状态'), ('8', '08', 'AI 网关'),
    ('9', '09', '异步与多 Agent'), ('10', '10', '可观测'), ('11', '11', '安全'), ('12', '12', '资产与验证'),
    ('13', '13', '模型调优'), ('14', '14', 'Agent 调优'), ('15', '15', '实践与展望'),
]
FULL = {
    '1': 'AI 原生应用的新阶段', '2': 'Agentic Application 参考架构', '3': 'Harness 的构建方式与责任边界',
    '4': '任务：编排、长程推进与协作', '5': '信息：上下文、状态与能力资产', '6': '行动：受控执行与验证反馈',
    '7': '运行时、沙箱与状态存储', '8': 'AI 网关与统一流量治理', '9': '异步任务、多 Agent 与分布式通信',
    '10': 'Agent 的可观测性', '11': 'Agent 安全', '12': 'AI 资产管理与行为验证',
    '13': '模型调优与推理框架', '14': 'Agent 调优：轨迹、数据集、Badcase 与自进化', '15': '企业实践与 Agentic OS',
}
REPO = 'https://github.com/aliyun/ai-agent-handbook'
REPO_NAME = 'aliyun/ai-agent-handbook'
BOOK = 'AI Agent Handbook（企业级 Agent 白皮书）'
AUTHOR = '阿里云团队编写的开源白皮书，Apache-2.0 协议；本笔记依据 2026 年 10 月 21 日的仓库版本'
BOOK_KIND = '开源白皮书'
CREDIT = '原书按“架构 → 构建 → 运行 → 治理 → 调优 → 实践”组织三十章，这里重排成十五篇，用自己的话重讲，并把关键表格做成可以点、可以分类、可以走流程的互动。概念与结论取自原书，每节标出对应章节；为演示设的场景和数值标“示意”。原书由阿里云编写，涉及阿里云产品的方案与数字属于厂商自述，文中会单独标出。'
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='3' width='18' height='18' rx='3' fill='none' stroke='%2313171C' stroke-width='2'/%3E%3Cpath d='M3 9h18M3 15h18' stroke='%2313171C' stroke-width='1.6'/%3E%3Ccircle cx='15' cy='12' r='2.4' fill='%232340D6'/%3E%3C/svg%3E"
