"""
Excel导出工具 - Coze插件版
使用xlsxwriter库替代openpyxl
"""

import xlsxwriter
import io
import base64
import json
from datetime import datetime


async def handler(args: dict) -> dict:
    """
    Coze插件入口函数
    """
    try:
        raw_data = args.get('data', '')
        
        if not raw_data:
            return {
                'success': False,
                'message': '数据不能为空'
            }
        
        if isinstance(raw_data, str):
            data = json.loads(raw_data)
        else:
            data = raw_data
        
        if not isinstance(data, list) or len(data) == 0:
            return {
                'success': False,
                'message': '数据格式错误，需要数组格式'
            }
        
        filename = args.get('filename') or f'export_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
        sheet_name = args.get('sheet_name') or 'Sheet1'
        
        headers_raw = args.get('headers', '{}')
        if isinstance(headers_raw, str):
            headers = json.loads(headers_raw) if headers_raw else {}
        else:
            headers = headers_raw if headers_raw else {}
        
        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer, {'in_memory': True})
        worksheet = workbook.add_worksheet(sheet_name[:31])
        
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#4472C4',
            'font_color': 'white',
            'align': 'center',
            'valign': 'vcenter'
        })
        
        cell_format = workbook.add_format({
            'align': 'left',
            'valign': 'vcenter'
        })
        
        even_format = workbook.add_format({
            'align': 'left',
            'valign': 'vcenter',
            'bg_color': '#F2F2F2'
        })
        
        fields = list(data[0].keys())
        
        if headers:
            display_headers = [headers.get(field, field) for field in fields]
        else:
            display_headers = fields
        
        for col_num, header in enumerate(display_headers):
            worksheet.write(0, col_num, str(header), header_format)
            worksheet.set_column(col_num, col_num, 15)
        
        for row_num, row_data in enumerate(data):
            for col_num, field in enumerate(fields):
                value = row_data.get(field, '')
                fmt = even_format if (row_num + 1) % 2 == 0 else cell_format
                worksheet.write(row_num + 1, col_num, str(value) if value is not None else '', fmt)
        
        workbook.close()
        buffer.seek(0)
        base64_content = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return {
            'success': True,
            'message': 'Excel文件生成成功',
            'base64': base64_content,
            'filename': f'{filename}.xlsx',
            'record_count': len(data)
        }
        
    except json.JSONDecodeError as e:
        return {
            'success': False,
            'message': f'JSON格式错误：{str(e)}'
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'导出失败：{str(e)}'
        }
