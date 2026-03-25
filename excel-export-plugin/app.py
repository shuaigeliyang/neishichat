#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excel导出Web服务 - Coze插件专用版
功能：提供RESTful API接口，支持Web前端调用Excel导出功能
"""

from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
import os
import io
from datetime import datetime
from excel_exporter import ExcelExporter
import traceback
import base64

app = Flask(__name__)
CORS(app)

app.config['EXPORT_DIR'] = 'exports'
app.config['MAX_EXPORT_SIZE'] = 100000
app.config['CLEANUP_OLD_FILES'] = True
app.config['FILE_RETENTION_HOURS'] = 24

os.makedirs(app.config['EXPORT_DIR'], exist_ok=True)


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    健康检查接口
    """
    return jsonify({
        'status': 'ok',
        'message': 'Excel导出服务运行正常',
        'timestamp': datetime.now().isoformat(),
        'service': 'Excel Export Service for Coze',
        'version': '1.0.0'
    }), 200


@app.route('/api/export/excel', methods=['POST'])
def export_excel():
    """
    Excel导出接口 - 主要功能

    Request Body:
        {
            "data": [{"字段1": "值1", "字段2": "值2"}, ...],
            "filename": "导出文件名",
            "sheet_name": "工作表名称",
            "headers": {"字段1": "显示名称1", "字段2": "显示名称2"},
            "auto_column_width": true,
            "return_base64": false
        }

    Returns:
        JSON响应，包含下载链接或Base64数据
    """
    try:
        request_data = request.get_json()

        if not request_data:
            return jsonify({
                'success': False,
                'message': '请求数据不能为空'
            }), 400

        data = request_data.get('data', [])
        filename = request_data.get('filename', f'export_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        sheet_name = request_data.get('sheet_name', 'Sheet1')
        headers = request_data.get('headers', {})
        auto_column_width = request_data.get('auto_column_width', True)
        return_base64 = request_data.get('return_base64', False)

        if not data:
            return jsonify({
                'success': False,
                'message': '导出数据不能为空'
            }), 400

        if len(data) > app.config['MAX_EXPORT_SIZE']:
            return jsonify({
                'success': False,
                'message': f'数据量过大！最大支持{app.config["MAX_EXPORT_SIZE"]}条记录'
            }), 400

        exporter = ExcelExporter(filename)

        if return_base64:
            buffer = exporter.export_to_excel(
                data=data,
                sheet_name=sheet_name,
                headers=headers,
                auto_column_width=auto_column_width,
                return_buffer=True
            )
            base64_data = base64.b64encode(buffer.getvalue()).decode('utf-8')

            return jsonify({
                'success': True,
                'message': 'Excel文件生成成功',
                'data': {
                    'filename': f"{filename}.xlsx",
                    'base64': base64_data,
                    'file_size': len(base64_data),
                    'record_count': len(data),
                    'sheet_name': sheet_name,
                    'created_at': datetime.now().isoformat()
                }
            }), 200
        else:
            filepath = exporter.export_to_excel(
                data=data,
                sheet_name=sheet_name,
                headers=headers,
                auto_column_width=auto_column_width,
                return_buffer=False
            )

            download_url = f"/api/download/{os.path.basename(filepath)}"

            if app.config['CLEANUP_OLD_FILES']:
                cleanup_old_files()

            return jsonify({
                'success': True,
                'message': 'Excel文件生成成功',
                'data': {
                    'filename': os.path.basename(filepath),
                    'download_url': download_url,
                    'file_size': os.path.getsize(filepath),
                    'record_count': len(data),
                    'sheet_name': sheet_name,
                    'created_at': datetime.now().isoformat()
                }
            }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'导出失败：{str(e)}',
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/export/multi-sheet', methods=['POST'])
def export_multi_sheet():
    """
    多工作表导出接口

    Request Body:
        {
            "data_dict": {
                "工作表1": [{"字段1": "值1"}, ...],
                "工作表2": [{"字段2": "值2"}, ...]
            },
            "filename": "导出文件名",
            "headers_dict": {
                "工作表1": {"字段1": "显示名称1"},
                "工作表2": {"字段2": "显示名称2"}
            },
            "return_base64": false
        }
    """
    try:
        request_data = request.get_json()

        if not request_data:
            return jsonify({'success': False, 'message': '请求数据不能为空'}), 400

        data_dict = request_data.get('data_dict', {})
        filename = request_data.get('filename', f'multi_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        headers_dict = request_data.get('headers_dict', {})
        return_base64 = request_data.get('return_base64', False)

        if not data_dict:
            return jsonify({'success': False, 'message': '至少需要一个工作表的数据'}), 400

        exporter = ExcelExporter(filename)

        if return_base64:
            buffer = exporter.export_multiple_sheets(
                data_dict=data_dict,
                headers_dict=headers_dict,
                return_buffer=True
            )
            base64_data = base64.b64encode(buffer.getvalue()).decode('utf-8')

            return jsonify({
                'success': True,
                'message': '多工作表Excel文件生成成功',
                'data': {
                    'filename': f"{filename}.xlsx",
                    'base64': base64_data,
                    'sheet_count': len(data_dict),
                    'total_records': sum(len(data) for data in data_dict.values())
                }
            }), 200
        else:
            filepath = exporter.export_multiple_sheets(
                data_dict=data_dict,
                headers_dict=headers_dict,
                return_buffer=False
            )

            download_url = f"/api/download/{os.path.basename(filepath)}"

            return jsonify({
                'success': True,
                'message': '多工作表Excel文件生成成功',
                'data': {
                    'filename': os.path.basename(filepath),
                    'download_url': download_url,
                    'sheet_count': len(data_dict),
                    'total_records': sum(len(data) for data in data_dict.values())
                }
            }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'导出失败：{str(e)}',
            'error': traceback.format_exc()
        }), 500


@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    """
    下载Excel文件

    Args:
        filename: 要下载的文件名

    Returns:
        文件下载响应
    """
    try:
        filepath = os.path.join(app.config['EXPORT_DIR'], filename)

        if not os.path.exists(filepath):
            return jsonify({
                'success': False,
                'message': f'文件不存在：{filename}'
            }), 404

        response = send_file(
            filepath,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'

        return response

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'下载失败：{str(e)}'
        }), 500


@app.route('/api/export/preview', methods=['POST'])
def preview_export():
    """
    预览导出数据（不实际生成文件）

    Request Body:
        {
            "data": [{"字段1": "值1"}, ...],
            "headers": {"字段1": "显示名称1"}
        }
    """
    try:
        request_data = request.get_json()
        data = request_data.get('data', [])
        headers = request_data.get('headers', {})

        if not data:
            return jsonify({'success': False, 'message': '数据不能为空'}), 400

        display_data = []
        for row in data:
            display_row = {}
            for field, value in row.items():
                display_name = headers.get(field, field)
                display_row[display_name] = value
            display_data.append(display_row)

        return jsonify({
            'success': True,
            'data': {
                'total_records': len(data),
                'preview_data': display_data[:10],
                'fields': list(data[0].keys()) if data else []
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'预览失败：{str(e)}'
        }), 500


def cleanup_old_files():
    """
    清理旧的导出文件
    """
    try:
        export_dir = app.config['EXPORT_DIR']
        retention_hours = app.config['FILE_RETENTION_HOURS']
        cutoff_time = datetime.now().timestamp() - (retention_hours * 3600)

        for filename in os.listdir(export_dir):
            filepath = os.path.join(export_dir, filename)
            if os.path.isfile(filepath):
                file_mtime = os.path.getmtime(filepath)
                if file_mtime < cutoff_time:
                    os.remove(filepath)
                    print(f'已删除旧文件: {filename}')

    except Exception as e:
        app.logger.error(f'清理旧文件失败: {e}')


@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({
        'success': False,
        'message': '请求的资源不存在',
        'error': 'Not Found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({
        'success': False,
        'message': '服务器内部错误',
        'error': str(error)
    }), 500


if __name__ == '__main__':
    print("""
    ╔═══════════════════════════════════════════════════════╗
    ║   Excel导出服务 - Coze插件专用版                      ║
    ╚═══════════════════════════════════════════════════════╝

    🚀 服务启动中...

    📍 API端点：
       - GET  /api/health              健康检查
       - POST /api/export/excel        导出Excel
       - POST /api/export/multi-sheet  多工作表导出
       - POST /api/export/preview      预览数据
       - GET  /api/download/<filename> 下载文件

    📁 导出目录：exports/
    ⏰ 文件保留：24小时

    """)
    app.run(host='0.0.0.0', port=5000, debug=True)
