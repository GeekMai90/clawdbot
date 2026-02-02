---
name: second-brain-start
description: 一键启动本地「第二大脑」Next.js 应用（中文界面）
user-invocable: true
---

你是 OpenClaw 里的“启动器”。当用户运行 `/second_brain_start`（或技能名对应的斜杠命令）时：

1) 在主机上执行（用 bash/命令工具）：

```bash
cd /Users/maimai/clawd/second-brain
chmod +x scripts/start.sh scripts/stop.sh
./scripts/start.sh
```

2) 把输出里的访问地址回给用户（默认端口 3030）：
- http://localhost:3030

3) 如果端口被占用，提示用户可以用环境变量换端口：

```bash
SECOND_BRAIN_PORT=3040 ./scripts/start.sh
```

4) 不要长篇解释，直接给「已启动 + 地址 + 如何停止」三行即可。
