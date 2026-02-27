# Star Office Sync 技能

## 用途
自动同步灵瑶的工作状态到 Star-Office-UI 像素小人显示屏。

## 调用方式
灵瑶在开始处理每条消息时，主动调用此脚本（后台运行，不阻塞响应）。

## 状态说明
| state | 小人显示 | 使用场景 |
|---|---|---|
| `thinking` | 思考中 | 开始分析用户请求 |
| `writing` | 写作中 | 正在生成长文本/教程 |
| `researching` | 研究中 | 正在搜索网页/读取文件 |
| `executing` | 执行中 | 正在运行命令/调用工具 |
| `idle` | 待命 | 空闲（自动恢复，无需手动设置） |

## TTL 机制
- 工作状态 TTL 默认 90 秒
- 90 秒内无更新 → 自动恢复 idle
- **无需手动设置 idle**，超时自动变回

## 脚本位置
`/Users/geekmai/clawd/skills/star-office-sync/set_state.sh`

## 快速调用
```bash
# 开始工作（后台运行，不影响响应速度）
bash /Users/geekmai/clawd/skills/star-office-sync/set_state.sh thinking

# 手动重置（一般不需要）
bash /Users/geekmai/clawd/skills/star-office-sync/set_state.sh idle
```

## 配置
- NAS 地址：`http://192.168.99.150:13011`
- 修改 NAS 地址：编辑 `set_state.sh` 第6行 `NAS_URL`
