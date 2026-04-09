# 对话记录 - 2026-04-10

## RAG页码问题分析与GitHub上传

---

## 1. RAG系统页码问题诊断

### 问题描述
用户发现点击RAG来源时出现"第146页不存在，加载失败"的错误。

### 问题根源
项目中有**3个不同的数据文件**，它们的页码体系不一致：

| 文件 | 用途 | 页码范围 | 问题 |
|------|------|---------|------|
| `student_handbook_full.json` | 手册查看器API | 1-128页（旧版） | ❌ 不一致 |
| `document_chunks.json` | RAG检索数据 | 1-158 | 内部分块编号 |
| `retrieval_index.json` | 向量索引 | 1-318 | 内部分块编号 |

**原因**：之前备份恢复时使用了只有128页的 `student_handbook_full.json`，而 `retrieval_index.json` 中的 `page_num` 是按317页编的。

### 解决方案
恢复为317页完整版的 `student_handbook_full.json`，使得：
- RAG检索结果的 `page_num`（如118）与手册查看器API的页码对应
- 用户点击来源时能正确显示页面内容

### 验证结果
恢复后三文件页码对应正确：
- `student_handbook_full.json`: 1~317页 ✓
- `retrieval_index.json`: 最大page_num=318 ✓
- 关键内容（如"未完成相应实践教学任务"）在page_num=118处对应 ✓

---

## 2. 数据库RAG表删除

### 操作
删除了MySQL数据库中的 `document_chunks` 表。

**原因**：数据库做RAG方案经过验证不可行，决定使用文档提取方法。

### 验证
```
当前数据库中的表:
- admins
- chat_history
- classes
- colleges
- course_offerings
- courses
- document_chunks  ← 已删除 ✓
- downloadable_forms
- form_templates
- grades
- majors
- regulations
- students
- teachers
```

---

## 3. GitHub上传

### 准备工作

#### 3.1 更新 .gitignore
排除以下文件：
- `backend/embedding_cache.json` - embedding缓存，应该动态生成
- `backend/document_chunks.json` - 与根目录重复
- `embedding_cache.json` - 根目录缓存
- `neishichat_reference/` - 参考资料目录
- 各种临时测试文件
- Word文档和临时文件

#### 3.2 从git跟踪中移除
```bash
git rm --cached backend/embedding_cache.json
git rm --cached 相关文档/2025年本科学生手册-定\ \(1\).docx
```

### 提交内容
- `.gitignore` 更新
- 前端组件：GuestChat、SchoolPortal、FloatChat、CircularIcon
- PDF提取脚本：extract-pdf.js、extract_pdf.py
- RAG路由和服务更新
- 数据文件：document_chunks.json、retrieval_index.json、student_handbook_full.json

### 提交结果
```
[main 786f95e] feat: 清理数据库RAG，更新前端组件，完善数据文件
 38 files changed, 59977 insertions(+), 19603 deletions(-)
```

### 推送结果
- ✅ 成功推送到 https://github.com/shuaigeliyang/neishichat
- ⚠️ 警告：retrieval_index.json (67.40MB) 超过GitHub建议的50MB

---

## 4. 技术要点总结

### 数据文件对应关系
```
用户提问
    ↓
RAG检索（retrieval_index.json）→ 返回答案 + 来源列表（含page_num）
    ↓
用户点击"查看来源"
    ↓
调用手册API → GET /api/handbook/page/{page_num}
    ↓
去 student_handbook_full.json 查找对应页面
    ↓
返回页面内容给前端显示
```

**关键**：两个数据源的页码体系必须一致！

### 文件大小说明
| 文件 | 大小 | 说明 |
|------|------|------|
| retrieval_index.json | 67MB | 向量索引，已提交git |
| document_chunks.json | 3.8MB | 文档分块，已提交git |
| student_handbook_full.json | 574KB | 完整手册，已提交git |
| embedding_cache.json | 94MB | 缓存，不提交git |

---

## 5. 后续建议

1. **考虑使用Git LFS**：由于retrieval_index.json超过50MB，建议配置Git LFS管理
2. **文档同步**：如果修改了PDF文档，需要重新生成所有数据文件并同步更新
3. **缓存管理**：embedding缓存可以在运行时自动生成，无需提交到git

---

*对话时间：2026-04-10*
*参与方：用户、Claude Code (哈雷酱)*
