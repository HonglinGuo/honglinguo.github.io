# 「Claude How To」学习系列配置（study_build.py 读取）
PREFIX = '2026-10-22-claudehowto'
SERIES_KEY = 'claudehowto-series'
PARTS = [
    ('', '总览', '速查卡'),
    ('1', '01', '全景'), ('2', '02', '斜杠命令'), ('3', '03', 'Memory'), ('4', '04', 'Skills'),
    ('5', '05', 'Subagents'), ('6', '06', 'MCP'), ('7', '07', 'Hooks'), ('8', '08', 'Plugins'),
    ('9', '09', '回退与会话'), ('10', '10', '规划与权限'), ('11', '11', '后台与远程'), ('12', '12', 'CLI 与脚本'),
]
FULL = {
    '1': '七件套全景：谁管什么', '2': '斜杠命令：内置命令与自定义命令', '3': 'Memory：CLAUDE.md 与自动记忆',
    '4': 'Skills：按需加载的能力包', '5': 'Subagents：另开一个上下文', '6': 'MCP：把外部系统接进来',
    '7': 'Hooks：在事件上挂确定性逻辑', '8': 'Plugins：把一套配置打包分发', '9': 'Checkpoints 与会话管理',
    '10': '规划、思考与权限模式', '11': '后台任务、定时与远程', '12': 'CLI、Headless 与脚本化',
}
REPO = 'https://github.com/luongnv89/claude-howto'
REPO_NAME = 'luongnv89/claude-howto'
BOOK = 'Claude How To'
BOOK_KIND = '开源教程'
AUTHOR = 'luongnv89 与社区贡献者编写，MIT 协议；本笔记依据 2026 年 10 月 20 日的仓库版本（commit 188f468），原文标注对应 Claude Code v2.1.302'
CREDIT = '原教程按十个模块（01-slash-commands 到 10-cli）组织，配了大量可复制的模板。这里重排成十二篇：先用一篇讲清七种扩展机制的分工，再逐个拆开，每个功能按“它解决什么问题、最小可用配置放在哪个路径、什么时候不该用”来写，并配上“读配置猜行为”、模拟器和场景判定题。功能与字段取自原文（主要依据英文原版，中文版是它的缩写译本），每节标出对应的原文目录；为演示设的场景和数值标“示意”。Claude Code 更新很快，原文里带版本号的细节以原文和官方文档为准。'
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='2.5' y='4' width='19' height='16' rx='3' fill='none' stroke='%2313171C' stroke-width='2'/%3E%3Cpath d='M6.5 9.5l3 2.5-3 2.5' fill='none' stroke='%232340D6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M12 15h5' stroke='%2313171C' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"
