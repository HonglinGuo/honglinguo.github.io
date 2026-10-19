# 「深入理解 AI Infra」学习系列配置（study_build.py 读取）
PREFIX = '2026-10-16-infra'
SERIES_KEY = 'infra-series'
PARTS = [
    ('', '总览', '估算地图'),
    ('1', '01', '初识 Infra'), ('2', '02', '模型架构'), ('3', '03', '负载'), ('4', '04', '加速器'),
    ('5', '05', '算子运行时'), ('6', '06', '超节点'), ('7', '07', '数据中心网络'), ('8', '08', '推理优化'),
    ('9', '09', '分布式推理'), ('10', '10', '训练系统'), ('11', '11', '调度与环境'), ('12', '12', '端边云'),
]
FULL = {
    '1': '初识 AI Infra', '2': '模型架构', '3': '推理与训练负载', '4': '加速器架构', '5': '算子与运行时',
    '6': '超节点', '7': '数据中心网络', '8': '推理优化', '9': '分布式推理', '10': '训练系统',
    '11': '资源调度与运行环境', '12': '端边云协同',
}
REPO = 'https://github.com/bojieli/ai-infra-book'
REPO_NAME = 'bojieli/ai-infra-book'
BOOK = '深入理解 AI Infra：量化分析与系统设计'
AUTHOR = '李博杰 著，Apache-2.0 协议，初稿持续修订中'
CREDIT = '原书的方法是“从约束推导设计”，所以每篇以计算器为主：先自己代入数字估一遍，再对照原书的结论。公式、硬件参数和算例数字都取自原书，为演示设的默认值会标注“示意”。'
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='5' y='5' width='14' height='14' rx='2' fill='none' stroke='%2313171C' stroke-width='2'/%3E%3Crect x='9' y='9' width='6' height='6' fill='%232340D6'/%3E%3Cpath d='M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3' stroke='%2313171C' stroke-width='2'/%3E%3C/svg%3E"
