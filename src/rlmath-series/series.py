# 「强化学习的数学原理」学习系列配置（study_build.py 读取）
PREFIX = '2026-10-19-rlmath'
SERIES_KEY = 'rlmath-series'
PARTS = [
    ('', '总览', '知识地图'),
    ('1', '01', '基本概念'), ('2', '02', '贝尔曼方程'), ('3', '03', '贝尔曼最优方程'),
    ('4', '04', '值迭代与策略迭代'), ('5', '05', '蒙特卡罗'), ('6', '06', '随机近似'),
    ('7', '07', '时序差分'), ('8', '08', '值函数近似'), ('9', '09', '策略梯度'), ('10', '10', 'Actor-Critic'),
]
FULL = {
    '1': '基本概念', '2': '状态值与贝尔曼方程', '3': '最优状态值与贝尔曼最优方程', '4': '值迭代与策略迭代',
    '5': '蒙特卡罗方法', '6': '随机近似', '7': '时序差分方法', '8': '值函数方法', '9': '策略梯度方法',
    '10': 'Actor-Critic 方法',
}
REPO = 'https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning'
REPO_NAME = 'MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning'
BOOK = '强化学习的数学原理（Mathematical Foundations of Reinforcement Learning）'
AUTHOR = '赵世钰（Shiyu Zhao）著，西湖大学；Springer Nature 与清华大学出版社 2025 年出版，作者在 GitHub 免费公开全书 PDF 与课件，本笔记依据仓库中 2025 年 7 月更新的英文 PDF（已含勘误）'
BOOK_KIND = '教材'
CREDIT = '原书仓库没有附带开源许可证，版权归作者与出版社所有；这里不转载原文和插图，而是按“先说清楚它解决什么问题、再动手算、最后记下来”的顺序用自己的话重讲，网格世界、算法与图都在浏览器里重新实现和手绘。公式、定义、例子与参数以原书为准，标注了对应的节号和页码；页面里的模拟结果标注“示意”，复现出原书图中数值的地方标注“原书数据”。'
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' fill='none' stroke='%2313171C' stroke-width='2'/%3E%3Cpath d='M9 3v18M15 3v18M3 9h18M3 15h18' stroke='%2313171C' stroke-width='1.5'/%3E%3Crect x='15' y='15' width='6' height='6' fill='%232340D6'/%3E%3C/svg%3E"
