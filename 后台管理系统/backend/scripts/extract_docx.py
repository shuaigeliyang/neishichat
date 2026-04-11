"""
文档提取脚本 - 从DOCX文档提取结构化JSON数据
"""
from docx import Document
import json
import sys
import os

def extract_docx_to_json(docx_path, output_path):
    """
    提取DOCX文档到JSON格式

    Args:
        docx_path: DOCX文件路径
        output_path: 输出JSON文件路径
    """
    print(f"正在读取文档: {docx_path}")

    doc = Document(docx_path)

    pages = []
    current_page = 1
    current_text = []

    for paragraph in doc.paragraphs:
        text = paragraph.text.strip()

        if not text:
            continue

        # 检测分页符或页面标记
        if text.startswith('第') and '页' in text:
            # 保存当前页面
            if current_text:
                pages.append({
                    'page_num': current_page,
                    'text': '\n'.join(current_text)
                })
                current_page += 1
                current_text = []
        else:
            current_text.append(text)

    # 保存最后一页
    if current_text:
        pages.append({
            'page_num': current_page,
            'text': '\n'.join(current_text)
        })

    # 生成JSON
    result = {
        'total_pages': len(pages),
        'source_file': docx_path,
        'pages': pages
    }

    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✓ 成功提取 {len(pages)} 页")
    print(f"✓ 输出文件: {output_path}")
    print(f"✓ 总字符数: {sum(len(p['text']) for p in pages):,}")

    return result

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("使用方法: python extract_docx.py <docx文件路径> <输出json路径>")
        sys.exit(1)

    docx_path = sys.argv[1]
    output_path = sys.argv[2]

    extract_docx_to_json(docx_path, output_path)
