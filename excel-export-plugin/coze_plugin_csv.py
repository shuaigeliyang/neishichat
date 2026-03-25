"""
CSV导出工具 - Coze插件版
返回CSV文本，用户复制保存
"""

import json


def handler(args):
    """Coze插件入口函数"""
    try:
        # 获取参数
        raw_data = ''
        filename = 'export'
        headers_raw = '{}'
        
        # args.input.xxx 方式
        if hasattr(args, 'input'):
            inp = args.input
            raw_data = getattr(inp, 'data', '') or raw_data
            filename = getattr(inp, 'filename', '') or filename
            headers_raw = getattr(inp, 'headers', '{}') or headers_raw
        
        # 直接属性
        if not raw_data:
            raw_data = getattr(args, 'data', '') or ''
            filename = getattr(args, 'filename', '') or 'export'
            headers_raw = getattr(args, 'headers', '{}') or '{}'
        
        # 字典
        if not raw_data and isinstance(args, dict):
            raw_data = args.get('data', '')
            filename = args.get('filename', 'export')
            headers_raw = args.get('headers', '{}')
        
        if not raw_data:
            return {'success': False, 'message': '数据不能为空'}
        
        # 解析数据
        if isinstance(raw_data, str):
            data = json.loads(raw_data)
        else:
            data = raw_data
        
        if not isinstance(data, list) or len(data) == 0:
            return {'success': False, 'message': '数据格式错误'}
        
        # 解析headers
        if isinstance(headers_raw, str):
            headers = json.loads(headers_raw) if headers_raw else {}
        else:
            headers = headers_raw if headers_raw else {}
        
        # 字段
        fields = list(data[0].keys())
        
        if headers:
            display_headers = [headers.get(f, f) for f in fields]
        else:
            display_headers = fields
        
        # 生成CSV内容
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
        
        return {
            'success': True,
            'message': f'CSV生成成功，共{len(data)}条记录',
            'filename': filename + '.csv',
            'record_count': len(data),
            'csv_content': csv_content
        }
        
    except Exception as e:
        return {'success': False, 'message': f'错误: {str(e)}'}
