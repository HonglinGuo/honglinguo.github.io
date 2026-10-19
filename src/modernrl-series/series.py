# 「动手学现代强化学习」学习系列配置（study_build.py 读取）
PREFIX = '2026-10-19-modernrl'
SERIES_KEY = 'modernrl-series'
PARTS = [
    ('', '总览', '算法地图'),
    ('1', '01', '训练闭环'), ('2', '02', 'DQN 家族'), ('3', '03', '策略梯度'), ('4', '04', 'PPO 与 GAE'),
    ('5', '05', '连续控制'), ('6', '06', '离线与模仿'), ('7', '07', 'RLHF'), ('8', '08', 'DPO 家族'),
    ('9', '09', 'GRPO 与 RLVR'), ('10', '10', '推理与搜索'), ('11', '11', 'Agentic RL'), ('12', '12', '奖励黑客与评测'),
]
FULL = {
    '1': '从 CartPole 看懂训练闭环', '2': 'DQN：把 Q 表换成网络', '3': '策略梯度与 Actor-Critic',
    '4': 'TRPO、PPO 与 GAE', '5': '连续控制与基于模型的 RL', '6': '离线 RL、模仿学习与探索',
    '7': 'RLHF：SFT、奖励模型与 PPO', '8': 'DPO 与离线偏好优化', '9': 'GRPO、RLVR 与可验证奖励',
    '10': '推理模型、测试时计算与过程奖励', '11': 'Agentic RL：多轮轨迹与信用分配', '12': '奖励黑客、评测与训练排障',
}
REPO = 'https://github.com/walkinglabs/hands-on-modern-rl'
REPO_NAME = 'walkinglabs/hands-on-modern-rl'
BOOK = 'Hands-On Modern RL（动手学现代强化学习）'
AUTHOR = 'WalkingLabs 社区编写的开源课程，CC BY-NC-SA 4.0 协议；本笔记依据 2026 年 10 月 1 日的仓库版本（docs/ 讲义与 code/ 实验代码）'
BOOK_KIND = '开源教程'
CREDIT = '原教程沿“CartPole → DQN → 策略梯度 → PPO → RLHF / DPO / GRPO → Agentic RL”一条线展开，这里按它的章节重新组织成十二篇，用自己的话重讲，并把关键实验搬进浏览器：CartPole 的 DQN 与 PPO 是用 JavaScript 真实训练的缩小版，其余公式演示的数值都在页面里实时计算。原教程数据（如训练日志 CSV、实验表格）标“原书数据”，为演示设的数值标“示意”，每节标出对应的原文路径。原教程自述“由 AI 协助生成、尚未全面审稿”，本笔记只采信能与原始论文对上的内容，存疑处单独注明。改编内容同样按 CC BY-NC-SA 4.0 分享、仅限非商业用途；数学推导部分可与同站<a href="../2026-10-19-rlmath/">《强化学习的数学原理》系列</a>对照着读。'
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='3' y='15' width='18' height='4' rx='1' fill='none' stroke='%2313171C' stroke-width='2'/%3E%3Cpath d='M12 15L16 4' stroke='%2313171C' stroke-width='2.2' stroke-linecap='round'/%3E%3Ccircle cx='16' cy='4' r='2.2' fill='%232340D6'/%3E%3C/svg%3E"
