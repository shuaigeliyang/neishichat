/**
 * Word文档生成服务
 * 设计师：哈雷酱大小姐 (￣▽￣)ﾉ
 * 功能：生成各类学生申请表Word文档
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');
const path = require('path');

class FormGeneratorService {
  /**
   * 生成学科竞赛参赛申请表
   * @param {Object} studentInfo - 学生信息
   * @returns {Promise<Object>} { filePath, fileName, downloadUrl }
   */
  async generateCompetitionForm(studentInfo) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // 标题
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '学科竞赛参赛申请表',
                bold: true,
                size: 32
              })
            ]
          }),
          // 空行
          new Paragraph({ text: '' }),

          // 信息表格
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // 姓名
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('姓名')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.name || '')] }),
                  new TableCell({ children: [new Paragraph('学号')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.student_code || '')] })
                ]
              }),
              // 性别
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('性别')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.gender || '')] }),
                  new TableCell({ children: [new Paragraph('出生年月')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.birth_date || '')] })
                ]
              }),
              // 学院专业
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('学院')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.college_name || '')] }),
                  new TableCell({ children: [new Paragraph('专业')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.major_name || '')] })
                ]
              }),
              // 班级
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('班级')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.class_name || '')] }),
                  new TableCell({ children: [new Paragraph('联系电话')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.phone || '')] })
                ]
              }),
              // 竞赛信息
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('竞赛名称')] }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph('')]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('竞赛级别')] }),
                  new TableCell({ children: [new Paragraph('')] }),
                  new TableCell({ children: [new Paragraph('指导教师')] }),
                  new TableCell({ children: [new Paragraph('')] })
                ]
              }),
              // 申请理由
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('申请理由')] }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph('')]
                  })
                ]
              })
            ]
          }),
          // 空行
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // 签名区域
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('学生签名：__________    日期：__________')] }),
                  new TableCell({ children: [new Paragraph('辅导员意见：\n\n签名：__________    日期：__________')] })
                ]
              })
            ]
          })
        ]
      }]
    });

    return await this.saveDocument(doc, '竞赛申请表', studentInfo.name);
  }

  /**
   * 生成转专业申请表
   * @param {Object} studentInfo - 学生信息
   * @returns {Promise<Object>} { filePath, fileName, downloadUrl }
   */
  async generateTransferForm(studentInfo) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // 标题
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '学生转专业申请表',
                bold: true,
                size: 32
              })
            ]
          }),
          new Paragraph({ text: '' }),

          // 基本信息
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('姓名')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.name || '')] }),
                  new TableCell({ children: [new Paragraph('学号')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.student_code || '')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('当前学院')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.college_name || '')] }),
                  new TableCell({ children: [new Paragraph('当前专业')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.major_name || '')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('当前班级')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.class_name || '')] }),
                  new TableCell({ children: [new Paragraph('联系电话')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.phone || '')] })
                ]
              }),
              // 转入信息
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('申请转入学院')] }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph('')]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('申请转入专业')] }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph('')]
                  })
                ]
              }),
              // 转专业理由
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('转专业理由')] }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph('')]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // 审批意见
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('学生签名：__________    日期：__________')] }),
                  new TableCell({ children: [new Paragraph('当前学院意见：\n\n签字：__________    日期：__________')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('转入学院意见：\n\n签字：__________    日期：__________')] }),
                  new TableCell({ children: [new Paragraph('教务处意见：\n\n签字：__________    日期：__________')] })
                ]
              })
            ]
          })
        ]
      }]
    });

    return await this.saveDocument(doc, '转专业申请表', studentInfo.name);
  }

  /**
   * 生成奖学金申请表
   * @param {Object} studentInfo - 学生信息
   * @returns {Promise<Object>} { filePath, fileName, downloadUrl }
   */
  async generateScholarshipForm(studentInfo) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '奖学金申请表',
                bold: true,
                size: 32
              })
            ]
          }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('姓名')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.name || '')] }),
                  new TableCell({ children: [new Paragraph('学号')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.student_code || '')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('学院')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.college_name || '')] }),
                  new TableCell({ children: [new Paragraph('专业')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.major_name || '')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('班级')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.class_name || '')] }),
                  new TableCell({ children: [new Paragraph('申请奖学金类型')] }),
                  new TableCell({ children: [new Paragraph('')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('上学年成绩排名')] }),
                  new TableCell({ children: [new Paragraph('')] }),
                  new TableCell({ children: [new Paragraph('综测排名')] }),
                  new TableCell({ children: [new Paragraph('')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('主要事迹')] }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph('')]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('学生签名：__________    日期：__________')] }),
                  new TableCell({ children: [new Paragraph('辅导员意见：\n\n签字：__________    日期：__________')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('学院意见：\n\n签字：__________    日期：__________')] }),
                  new TableCell({ children: [new Paragraph('学生处意见：\n\n签字：__________    日期：__________')] })
                ]
              })
            ]
          })
        ]
      }]
    });

    return await this.saveDocument(doc, '奖学金申请表', studentInfo.name);
  }

  /**
   * 生成休学申请表
   * @param {Object} studentInfo - 学生信息
   * @returns {Promise<Object>} { filePath, fileName, downloadUrl }
   */
  async generateSuspensionForm(studentInfo) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '学生休学申请表',
                bold: true,
                size: 32
              })
            ]
          }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('姓名')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.name || '')] }),
                  new TableCell({ children: [new Paragraph('学号')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.student_code || '')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('学院')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.college_name || '')] }),
                  new TableCell({ children: [new Paragraph('专业班级')] }),
                  new TableCell({ children: [new Paragraph(`${studentInfo.major_name || ''} ${studentInfo.class_name || ''}`)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('联系电话')] }),
                  new TableCell({ children: [new Paragraph(studentInfo.phone || '')] }),
                  new TableCell({ children: [new Paragraph('休学原因')] }),
                  new TableCell({ children: [new Paragraph('')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('休学起止时间')] }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph('自 ________ 年 ________ 月 至 ________ 年 ________ 月')]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('休学理由')] }),
                  new TableCell({
                    columnSpan: 3,
                    children: [new Paragraph('')]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('学生签名：__________    家长签字：__________')] }),
                  new TableCell({ children: [new Paragraph('日期：__________')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('辅导员意见：\n\n签字：__________    日期：__________')] }),
                  new TableCell({ children: [new Paragraph('学院意见：\n\n签字：__________    日期：__________')] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('教务处意见：\n\n签字：__________    日期：__________')] }),
                  new TableCell({ children: [new Paragraph('学校意见：\n\n签字：__________    日期：__________')] })
                ]
              })
            ]
          })
        ]
      }]
    });

    return await this.saveDocument(doc, '休学申请表', studentInfo.name);
  }

  /**
   * 保存文档到文件
   * @param {Document} doc - docx文档对象
   * @param {string} formType - 表单类型
   * @param {string} studentName - 学生姓名
   * @returns {Promise<Object>} { filePath, fileName, downloadUrl }
   */
  async saveDocument(doc, formType, studentName) {
    const buffer = await Packer.toBuffer(doc);
    const fileName = `${formType}_${studentName}_${Date.now()}.docx`;
    const filePath = path.join(__dirname, '../../exports/forms', fileName);

    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(filePath, buffer);

    return {
      filePath,
      fileName,
      downloadUrl: `/api/forms/download/${fileName}`
    };
  }
}

module.exports = new FormGeneratorService();
