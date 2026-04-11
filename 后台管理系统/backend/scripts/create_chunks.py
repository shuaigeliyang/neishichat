"""
智能分块脚本 - 将文档分割成适合检索的小块
"""
import json
import re
import sys
import os

class SmartChunker:
    def __init__(self, chunk_size=1000, overlap=200):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def split_paragraphs(self, text):
        """智能分割段落"""
        # 按双换行符分割段落
        paragraphs = re.split(r'\n\s*\n', text)

        # 过滤空段落
        return [p.strip() for p in paragraphs if p.strip()]

    def split_sentences(self, paragraph):
        """在句子边界分割"""
        # 中文句子结束符
        sentences = re.split(r'([。！？；])', paragraph)

        # 重新组合句子和标点
        result = []
        for i in range(0, len(sentences) - 1, 2):
            sentence = sentences[i] + (sentences[i + 1] if i + 1 < len(sentences) else '')
            if sentence.strip():
                result.append(sentence.strip())

        return result

    def create_chunk(self, text, chunk_id, page_num, full_context):
        """创建文档块"""
        return {
            'chunk_id': chunk_id,
            'page_num': page_num,
            'text': text,
            'char_count': len(text),
            'full_context': full_context  # 用于embedding
        }

    def chunk_page(self, page_data, start_chunk_id):
        """对单个页面进行分块"""
        chunks = []
        chunk_id = start_chunk_id

        # 分割段落
        paragraphs = self.split_paragraphs(page_data['text'])

        current_chunk = ''
        current_context = ''

        for para in paragraphs:
            # 如果段落本身超过目标大小，需要分割
            if len(para) > self.chunk_size:
                # 先保存当前chunk
                if current_chunk:
                    chunks.append(self.create_chunk(
                        current_chunk.strip(),
                        chunk_id,
                        page_data['page_num'],
                        current_context.strip()
                    ))
                    chunk_id += 1
                    current_chunk = ''
                    current_context = ''

                # 分割长段落
                sentences = self.split_sentences(para)
                for sent in sentences:
                    if len(current_chunk) + len(sent) <= self.chunk_size:
                        current_chunk += sent
                        current_context += sent
                    else:
                        if current_chunk:
                            chunks.append(self.create_chunk(
                                current_chunk.strip(),
                                chunk_id,
                                page_data['page_num'],
                                current_context.strip()
                            ))
                            chunk_id += 1

                        # 添加重叠
                        overlap_text = current_chunk[-self.overlap:] if len(current_chunk) > self.overlap else current_chunk
                        current_chunk = overlap_text + sent
                        current_context = overlap_text + sent

            else:
                # 检查是否需要开始新chunk
                if len(current_chunk) + len(para) > self.chunk_size:
                    if current_chunk:
                        chunks.append(self.create_chunk(
                            current_chunk.strip(),
                            chunk_id,
                            page_data['page_num'],
                            current_context.strip()
                        ))
                        chunk_id += 1

                    # 添加重叠
                    overlap_text = current_chunk[-self.overlap:] if len(current_chunk) > self.overlap else current_chunk
                    current_chunk = overlap_text + para
                    current_context = overlap_text + para
                else:
                    current_chunk += '\n\n' + para
                    current_context += '\n\n' + para

        # 保存最后一个chunk
        if current_chunk:
            chunks.append(self.create_chunk(
                current_chunk.strip(),
                chunk_id,
                page_data['page_num'],
                current_context.strip()
            ))

        return chunks

    def chunk_document(self, pages):
        """对整个文档进行分块"""
        all_chunks = []
        chunk_id = 1

        for page_data in pages:
            chunks = self.chunk_page(page_data, chunk_id)
            all_chunks.extend(chunks)
            chunk_id += len(chunks)

        return all_chunks

def main():
    if len(sys.argv) < 3:
        print("使用方法: python create_chunks.py <输入json路径> <输出chunks路径>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    # 加载文档
    print(f"正在加载文档: {input_path}")
    with open(input_path, 'r', encoding='utf-8') as f:
        doc_data = json.load(f)

    print(f"文档总页数: {doc_data['total_pages']}")

    # 创建分块器
    chunker = SmartChunker(chunk_size=1000, overlap=200)

    # 生成分块
    print("正在生成文档块...")
    chunks = chunker.chunk_document(doc_data['pages'])

    # 保存结果
    result = {
        'metadata': {
            'source_file': doc_data.get('source_file', ''),
            'total_pages': doc_data['total_pages'],
            'total_chunks': len(chunks),
            'chunk_size': 1000,
            'overlap': 200
        },
        'chunks': chunks
    }

    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✓ 成功创建 {len(chunks)} 个文档块")
    print(f"✓ 平均块大小: {sum(c['char_count'] for c in chunks) / len(chunks):.0f} 字符")
    print(f"✓ 输出文件: {output_path}")

if __name__ == '__main__':
    main()
