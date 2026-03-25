# Excel导出插件 - Coze平台配置指南

## 一、插件概述

本插件提供Excel文件导出功能，支持：
- 单工作表导出
- 多工作表导出
- 自定义表头
- 自动列宽调整
- Base64编码返回（适合Coze平台）

## 二、文件结构

```
excel-export-plugin/
├── app.py              # Flask Web服务主程序
├── excel_exporter.py   # Excel导出核心工具类
├── requirements.txt    # Python依赖
├── start.bat           # Windows启动脚本
└── README.md           # 本文档
```

## 三、本地部署步骤

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 启动服务
```bash
# Windows
双击 start.bat

# 或命令行运行
python app.py
```

### 3. 验证服务
访问 http://localhost:5000/api/health 检查服务状态

## 四、Coze平台配置

### 方式一：使用内网穿透（推荐开发调试）

1. **启动内网穿透工具**
   ```bash
   # 使用ngrok
   ngrok http 5000
   ```
   获取公网地址，如 `https://xxxx.ngrok.io`

2. **在Coze平台创建插件**
   - 插件类型：HTTP服务
   - 服务地址：`https://xxxx.ngrok.io`
   - 认证方式：无需认证（或添加API Key）

### 方式二：部署到云服务器（推荐生产环境）

1. **部署到服务器**
   ```bash
   # 上传文件到服务器
   scp -r excel-export-plugin user@server:/path/

   # SSH登录服务器
   ssh user@server

   # 安装依赖并启动
   cd /path/excel-export-plugin
   pip install -r requirements.txt
   python app.py
   ```

2. **使用Gunicorn（生产环境）**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **配置Nginx反向代理**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 五、API接口说明

### 1. 健康检查
```
GET /api/health
```

### 2. 导出Excel（推荐用于Coze）
```
POST /api/export/excel
Content-Type: application/json

{
    "data": [
        {"学号": "2021001", "姓名": "张三", "性别": "男"},
        {"学号": "2021002", "姓名": "李四", "性别": "女"}
    ],
    "filename": "学生信息",
    "sheet_name": "学生列表",
    "headers": {
        "学号": "学生学号",
        "姓名": "学生姓名",
        "性别": "性别"
    },
    "return_base64": true
}
```

**响应（Base64模式）：**
```json
{
    "success": true,
    "message": "Excel文件生成成功",
    "data": {
        "filename": "学生信息.xlsx",
        "base64": "UEsDBBQABgAIAAAAIQ...",
        "file_size": 12345,
        "record_count": 2,
        "sheet_name": "学生列表"
    }
}
```

### 3. 多工作表导出
```
POST /api/export/multi-sheet
Content-Type: application/json

{
    "data_dict": {
        "学生信息": [
            {"学号": "2021001", "姓名": "张三"}
        ],
        "成绩信息": [
            {"学号": "2021001", "课程": "数学", "成绩": 90}
        ]
    },
    "filename": "学生完整数据",
    "return_base64": true
}
```

### 4. 下载文件
```
GET /api/download/<filename>
```

## 六、Coze插件配置示例

### 插件输入参数定义

```json
{
    "type": "object",
    "properties": {
        "data": {
            "type": "array",
            "description": "要导出的数据，数组格式",
            "items": {
                "type": "object"
            }
        },
        "filename": {
            "type": "string",
            "description": "导出文件名（不含扩展名）",
            "default": "export"
        },
        "sheet_name": {
            "type": "string",
            "description": "工作表名称",
            "default": "Sheet1"
        },
        "headers": {
            "type": "object",
            "description": "表头映射，字段名->显示名称"
        }
    },
    "required": ["data"]
}
```

### 插件输出定义

```json
{
    "type": "object",
    "properties": {
        "success": {
            "type": "boolean",
            "description": "是否成功"
        },
        "message": {
            "type": "string",
            "description": "结果消息"
        },
        "data": {
            "type": "object",
            "properties": {
                "filename": {
                    "type": "string",
                    "description": "文件名"
                },
                "base64": {
                    "type": "string",
                    "description": "Excel文件的Base64编码"
                },
                "download_url": {
                    "type": "string",
                    "description": "下载链接"
                }
            }
        }
    }
}
```

## 七、在Coze Bot中使用

### 示例提示词

```
当用户需要导出数据时：
1. 调用excel_export插件
2. 将查询结果格式化为数组传入data参数
3. 设置合适的文件名和表头
4. 返回base64数据或下载链接给用户
```

### 调用示例

```json
{
    "data": [
        {"学号": "2021001", "姓名": "张三", "学院": "计算机学院"},
        {"学号": "2021002", "姓名": "李四", "学院": "软件学院"}
    ],
    "filename": "学生名单",
    "sheet_name": "学生信息",
    "headers": {
        "学号": "学生学号",
        "姓名": "学生姓名",
        "学院": "所属学院"
    },
    "return_base64": true
}
```

## 八、常见问题

### Q1: 如何处理大数据量？
- 使用 `return_base64: false` 返回下载链接
- 服务端会自动清理24小时前的文件

### Q2: 如何自定义Excel样式？
- 修改 `excel_exporter.py` 中的 `_get_default_header_style` 方法

### Q3: 如何添加认证？
- 在 `app.py` 中添加认证中间件
- 或在Coze平台配置API Key

## 九、技术支持

如有问题，请检查：
1. Python版本是否 >= 3.7
2. 依赖是否正确安装
3. 端口5000是否被占用
4. 防火墙是否允许访问
