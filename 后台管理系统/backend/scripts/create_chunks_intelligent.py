"""
智能分块脚本 - 根据文档内容动态调整分块策略
设计师：内师智能体系统 (￣▽￣)ﾉ
版本：v2.0 - 智能分析版本
"""
import json
import re
import sys
import os
from typing import Dict, List, Any

class IntelligentDocumentAnalyzer:
    """智能文档分析器"""

    def __init__(self):
        # 关键词特征库
        self.content_features = {
            'policy': {
                'keywords': ['政策', '规定', '办法', '条例', '实施细则', '管理办法', '暂行规定'],
                'structure_markers': ['第.*条', '第.*章', '第.*节', '（.*）', '【.*】'],
                'typical_chunk_size': 800,
                'typical_overlap': 150
            },
            'handbook': {
                'keywords': ['手册', '指南', '须知', '说明', '介绍', '概况'],
                'structure_markers': ['第.*章', '第.*节', '一、', '二、', '三、', '（一）', '（二）'],
                'typical_chunk_size': 1000,
                'typical_overlap': 200
            },
            'technical': {
                'keywords': ['技术', '规范', '标准', '操作', '流程', '配置'],
                'structure_markers': ['步骤', '程序', '代码', '命令', '参数'],
                'typical_chunk_size': 1200,
                'typical_overlap': 200
            },
            'general': {
                'keywords': [],
                'structure_markers': [],
                'typical_chunk_size': 1200,
                'typical_overlap': 200
            }
        }

    def analyze_document_structure(self, document: Dict) -> Dict[str, Any]:
        """分析文档结构"""
        pages = document.get('pages', [])
        total_pages = len(pages)

        # 统计信息
        total_chars = sum(len(p.get('text', '')) for p in pages)
        avg_page_length = total_chars / total_pages if total_pages > 0 else 0

        # 提取所有文本
        all_text = '\n'.join(p.get('text', '') for p in pages)

        # 检测结构标记
        structure_patterns = {}
        for content_type, features in self.content_features.items():
            if content_type == 'general':
                continue

            patterns_found = 0
            for pattern in features.get('structure_markers', []):
                matches = len(re.findall(pattern, all_text))
                if matches > 0:
                    patterns_found += matches

            structure_patterns[content_type] = patterns_found

        # 检测关键词
        keyword_scores = {}
        for content_type, features in self.content_features.items():
            if content_type == 'general':
                continue

            score = 0
            for keyword in features.get('keywords', []):
                score += all_text.count(keyword)

            keyword_scores[content_type] = score

        return {
            'total_pages': total_pages,
            'total_chars': total_chars,
            'avg_page_length': avg_page_length,
            'structure_patterns': structure_patterns,
            'keyword_scores': keyword_scores
        }

    def detect_content_type(self, analysis: Dict) -> str:
        """检测文档内容类型"""
        keyword_scores = analysis.get('keyword_scores', {})
        structure_patterns = analysis.get('structure_patterns', {})

        # 计算每种类型的得分
        scores = {}
        for content_type in ['policy', 'handbook', 'technical']:
            keyword_score = keyword_scores.get(content_type, 0)
            structure_score = structure_patterns.get(content_type, 0)

            # 综合得分：关键词权重60%，结构权重40%
            scores[content_type] = keyword_score * 0.6 + structure_score * 0.4

        # 找出得分最高的类型
        if not scores or max(scores.values()) == 0:
            return 'general'

        detected_type = max(scores, key=scores.get)

        # 如果得分太低，返回general
        if scores[detected_type] < 10:
            return 'general'

        return detected_type

    def determine_chunk_strategy(self, content_type: str, analysis: Dict) -> Dict[str, Any]:
        """确定分块策略"""
        base_strategy = self.content_features[content_type].copy()

        # 根据文档特征动态调整
        avg_page_length = analysis.get('avg_page_length', 0)

        # 如果页面很长，减小块大小以保持精度
        if avg_page_length > 3000:
            base_strategy['typical_chunk_size'] = int(base_strategy['typical_chunk_size'] * 0.8)
            base_strategy['typical_overlap'] = int(base_strategy['typical_overlap'] * 0.8)
        # 如果页面很短，增大块大小以保持上下文
        elif avg_page_length < 1000:
            base_strategy['typical_chunk_size'] = int(base_strategy['typical_chunk_size'] * 1.2)
            base_strategy['typical_overlap'] = int(base_strategy['typical_overlap'] * 1.2)

        return base_strategy


class SmartChunker:
    """智能分块器"""

    def __init__(self, strategy: Dict[str, Any]):
        self.chunk_size = strategy.get('typical_chunk_size', 1000)
        self.overlap = strategy.get('typical_overlap', 200)
        self.content_type = self._infer_content_type(strategy)

    def _infer_content_type(self, strategy: Dict) -> str:
        """推断内容类型"""
        if strategy.get('typical_chunk_size') == 800:
            return 'policy'
        elif strategy.get('typical_chunk_size') == 1000:
            return 'handbook'
        elif strategy.get('typical_chunk_size') == 1200:
            return 'technical'
        return 'general'

    def split_paragraphs(self, text: str) -> List[str]:
        """智能分割段落"""
        if self.content_type == 'policy':
            # 政策文档：按条款分割
            paragraphs = re.split(r'\n(?=\d+\.|第[一二三四五六七八九十]+条)', text)
        elif self.content_type == 'handbook':
            # 手册文档：按章节分割
            paragraphs = re.split(r'\n(?=第[一二三四五六七八九十]+[章节节]|[一二三四五六七八九十]+、)', text)
        else:
            # 通用文档：按段落分割
            paragraphs = re.split(r'\n\s*\n', text)

        return [p.strip() for p in paragraphs if p.strip()]

    def split_sentences(self, paragraph: str) -> List[str]:
        """在句子边界分割"""
        sentences = re.split(r'([。！？；])', paragraph)

        result = []
        for i in range(0, len(sentences) - 1, 2):
            sentence = sentences[i] + (sentences[i + 1] if i + 1 < len(sentences) else '')
            if sentence.strip():
                result.append(sentence.strip())

        return result

    def create_chunk(self, text: str, chunk_id: int, page_num: int, full_context: str, metadata: Dict = None) -> Dict:
        """创建文档块"""
        return {
            'chunk_id': chunk_id,
            'page_num': page_num,
            'text': text,
            'char_count': len(text),
            'full_context': full_context,
            'content_type': self.content_type,
            'metadata': metadata or {}
        }

    def chunk_page(self, page_data: Dict, start_chunk_id: int) -> List[Dict]:
        """对单个页面进行分块"""
        chunks = []
        chunk_id = start_chunk_id

        paragraphs = self.split_paragraphs(page_data['text'])

        current_chunk = ''
        current_context = ''

        for para in paragraphs:
            # 如果段落本身超过目标大小，需要分割
            if len(para) > self.chunk_size:
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

    def chunk_document(self, pages: List[Dict]) -> List[Dict]:
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
        print("使用方法: python create_chunks_intelligent.py <输入json路径> <输出chunks路径>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    # 加载文档
    print(f"正在加载文档: {input_path}")
    with open(input_path, 'r', encoding='utf-8') as f:
        doc_data = json.load(f)

    print(f"文档总页数: {doc_data['total_pages']}")

    # 分析文档
    print("\n正在分析文档结构...")
    analyzer = IntelligentDocumentAnalyzer()
    analysis = analyzer.analyze_document_structure(doc_data)

    print(f"分析结果:")
    print(f"  总字符数: {analysis['total_chars']:,}")
    print(f"  平均页长: {analysis['avg_page_length']:.0f}")
    print(f"  关键词得分: {analysis['keyword_scores']}")
    print(f"  结构特征: {analysis['structure_patterns']}")

    # 检测内容类型
    content_type = analyzer.detect_content_type(analysis)
    print(f"\n检测到的内容类型: {content_type}")

    # 确定策略
    strategy = analyzer.determine_chunk_strategy(content_type, analysis)
    print(f"选择的分块策略:")
    print(f"  目标块大小: {strategy['typical_chunk_size']} 字符")
    print(f"  重叠大小: {strategy['typical_overlap']} 字符")
    print(f"  内容类型: {content_type}")

    # 创建分块器
    chunker = SmartChunker(strategy)

    # 生成分块
    print("\n正在生成文档块...")
    chunks = chunker.chunk_document(doc_data['pages'])

    # 保存结果
    result = {
        'metadata': {
            'source_file': doc_data.get('source_file', ''),
            'total_pages': doc_data['total_pages'],
            'total_chunks': len(chunks),
            'content_type': content_type,
            'strategy': strategy,
            'analysis': analysis
        },
        'chunks': chunks
    }

    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✓ 成功创建 {len(chunks)} 个文档块")
    print(f"✓ 平均块大小: {sum(c['char_count'] for c in chunks) / len(chunks):.0f} 字符")
    print(f"✓ 输出文件: {output_path}")

    # 统计信息
    sizes = [c['char_count'] for c in chunks]
    print(f"\n分块质量:")
    print(f"  最小块: {min(sizes)} 字符")
    print(f"  最大块: {max(sizes)} 字符")
    print(f"  平均块: {sum(sizes) / len(sizes):.0f} 字符")


if __name__ == '__main__':
    main()
