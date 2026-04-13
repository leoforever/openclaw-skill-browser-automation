#!/bin/bash
# 自动表单填写脚本
# 用法：auto-fill.sh <url> [fields-json]
# 
# fields-json 格式：{"字段名":"值", ...}
# 不提供 fields-json 时自动填充测试数据

set -e

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

BROWSER_CMD="~/openclaw-deploy/node_modules/.bin/openclaw browser"
URL="$1"
FIELDS="$2"

if [ -z "$URL" ]; then
  echo "用法：$0 <url> [fields-json]"
  echo "示例：$0 https://example.com/form '{\"姓名\":\"张三\",\"邮箱\":\"test@example.com\"}'"
  exit 1
fi

echo "🌐 打开页面：$URL"
$BROWSER_CMD open "$URL" --timeout 60

echo "📸 获取表单元素..."
SNAPSHOT=$($BROWSER_CMD snapshot --interactive 2>&1 | grep -E "^\- (textbox|radio|checkbox|select)")

echo "📋 发现的表单字段:"
echo "$SNAPSHOT" | while read line; do
  echo "   $line"
done

# 提取所有 textbox 的 ref 和 label
TEXTBOXES=$(echo "$SNAPSHOT" | grep "textbox" | sed 's/.*\[ref=\(e[0-9]*\)\]/\1/')

if [ -z "$TEXTBOXES" ]; then
  echo "⚠️  没有找到文本输入框"
  exit 0
fi

# 构建自动填写数据
if [ -n "$FIELDS" ]; then
  echo "✏️  使用用户提供的数据填写..."
  # TODO: 智能匹配字段名
  $BROWSER_CMD fill --fields "$FIELDS"
else
  echo "✏️  自动填充测试数据..."
  
  # 构建默认测试数据
  FILL_DATA='['
  FIRST=true
  
  echo "$SNAPSHOT" | while read line; do
    if echo "$line" | grep -q "textbox"; then
      REF=$(echo "$line" | grep -o 'ref=e[0-9]*' | cut -d= -f2)
      LABEL=$(echo "$line" | grep -o '"[^"]*"' | head -1 | tr -d '"')
      
      # 根据 label 决定填充内容
      VALUE="测试数据"
      case "$LABEL" in
        *姓名*|*name*|*Name*) VALUE="张三" ;;
        *邮箱*|*email*|*Email*) VALUE="test@example.com" ;;
        *电话*|*phone*|*Phone*) VALUE="13800138000" ;;
        *时间*|*time*|*Time*) VALUE="18:00" ;;
        *地址*|*address*|*Address*) VALUE="测试地址 123 号" ;;
      esac
      
      if [ "$FIRST" = true ]; then
        FIRST=false
      else
        FILL_DATA="$FILL_DATA,"
      fi
      FILL_DATA="$FILL_DATA{\"ref\":\"$REF\",\"value\":\"$VALUE\"}"
      echo "   - $REF ($LABEL): $VALUE"
    fi
  done
  
  FILL_DATA="$FILL_DATA]"
  $BROWSER_CMD fill --fields "$FILL_DATA"
fi

# 自动选择常见的单选/复选框
echo "$SNAPSHOT" | grep -E "radio.*Medium|checkbox.*Bacon" | while read line; do
  REF=$(echo "$line" | grep -o 'ref=e[0-9]*' | cut -d= -f2)
  LABEL=$(echo "$line" | grep -o '"[^"]*"' | head -1 | tr -d '"')
  echo "☑️  选择：$LABEL"
  $BROWSER_CMD click "$REF"
done

echo ""
echo "✅ 表单填写完成！"
echo "📸 最终快照:"
$BROWSER_CMD snapshot --interactive
