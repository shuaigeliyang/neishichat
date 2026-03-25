"""测试CSV生成速度"""
import time
import json

# 模拟大数据量测试
data = [{'学号': i, '姓名': f'学生{i}', '性别': '男' if i % 2 == 0 else '女', '学院': '计算机学院', '专业': '软件工程'} for i in range(1, 5001)]

# 测试CSV生成速度
start = time.time()

fields = list(data[0].keys())
display_headers = fields
lines = [','.join(display_headers)]

for row_data in data:
    values = []
    for f in fields:
        v = str(row_data.get(f, '')) if row_data.get(f) is not None else ''
        if ',' in v or '"' in v or '\n' in v:
            v = '"' + v.replace('"', '""') + '"'
        values.append(v)
    lines.append(','.join(values))

csv_content = '\n'.join(lines)

end = time.time()
print(f'数据量: {len(data)} 条')
print(f'CSV内容长度: {len(csv_content)} 字符')
print(f'生成耗时: {(end-start)*1000:.2f} 毫秒')
