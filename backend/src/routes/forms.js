/**
 * 表单下载路由（增强版）
 * 设计师：哈雷酱大小姐 (￣▽￣)ﾉ
 * 功能：表单列表、生成、下载
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { success, error } = require('../utils/response');
const { query } = require('../config/database');
const formGenerator = require('../services/formGeneratorService');
const path = require('path');

/**
 * GET /api/forms - 根路由，重定向到列表
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // 重定向到列表接口
    const { type: userType } = req.user;
    const { category } = req.query;

    // 构建查询条件
    let whereClause = 'WHERE status = 1';
    const params = [];

    // 根据用户类型筛选
    if (userType === 'student') {
      whereClause += ' AND target_audience IN (?, ?)';
      params.push('全体学生', '全体用户');
    } else if (userType === 'teacher') {
      whereClause += ' AND target_audience IN (?, ?, ?)';
      params.push('全体学生', '全体教师', '全体用户');
    } else if (userType === 'admin') {
      // 管理员可以看到所有
    }

    // 按分类筛选
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    const forms = await query(`
      SELECT
        template_id,
        template_name,
        category,
        description,
        file_type,
        download_count,
        target_audience
      FROM form_templates
      ${whereClause}
      ORDER BY sort_order ASC, template_id ASC
    `, params);

    console.log('✅ 获取表单列表成功', { count: forms.length });
    success(res, forms, '获取表单列表成功');

  } catch (err) {
    console.error('❌ 获取表单列表失败:', err);
    error(res, '获取表单列表失败', 500);
  }
});

/**
 * 获取可下载的表单列表
 * GET /api/forms/list
 */
router.get('/list', authenticate, async (req, res) => {
  try {
    const { type: userType } = req.user;
    const { category } = req.query;

    console.log('📋 获取表单列表', { userType, category });

    // 构建查询条件
    let whereClause = 'WHERE status = 1';
    const params = [];

    // 根据用户类型筛选
    if (userType === 'student') {
      whereClause += ' AND target_audience IN (?, ?)';
      params.push('全体学生', '全体用户');
    } else if (userType === 'teacher') {
      whereClause += ' AND target_audience IN (?, ?, ?)';
      params.push('全体学生', '全体教师', '全体用户');
    } else if (userType === 'admin') {
      // 管理员可以看到所有
    }

    // 按分类筛选
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    const forms = await query(`
      SELECT
        template_id,
        template_name,
        category,
        description,
        file_type,
        download_count,
        target_audience
      FROM form_templates
      ${whereClause}
      ORDER BY sort_order ASC, template_id ASC
    `, params);

    console.log('✅ 获取表单列表成功', { count: forms.length });
    success(res, forms, '获取表单列表成功');

  } catch (err) {
    console.error('❌ 获取表单列表失败:', err);
    error(res, '获取表单列表失败', 500);
  }
});

/**
 * 生成并下载表单（自动填充学生信息）
 * POST /api/forms/generate
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { id: userId, type: userType } = req.user;
    const { templateId, templateName } = req.body;

    console.log('📝 生成表单', { userId, userType, templateId, templateName });

    // 支持两种方式：templateId 或 templateName
    let template;

    if (templateId) {
      // 使用templateId查询
      template = await query(`
        SELECT * FROM form_templates
        WHERE template_id = ? AND status = 1
      `, [templateId]);
    } else if (templateName) {
      // 使用templateName查询（模糊匹配）
      console.log('🔍 模糊查询模板名称:', templateName);
      template = await query(`
        SELECT * FROM form_templates
        WHERE template_name LIKE ? AND status = 1
      `, [`%${templateName}%`]);
      console.log('🔍 模糊查询结果:', template);
    } else {
      return error(res, '请提供templateId或templateName', 400);
    }

    if (template.length === 0) {
      return error(res, '表单模板不存在', 404);
    }

    // 获取学生信息（仅学生用户）
    let studentInfo = null;

    if (userType === 'student') {
      studentInfo = await query(`
        SELECT
          s.*,
          c.class_name,
          m.major_name,
          col.college_name
        FROM students s
        LEFT JOIN classes c ON s.class_id = c.class_id
        LEFT JOIN majors m ON c.major_id = m.major_id
        LEFT JOIN colleges col ON m.college_id = col.college_id
        WHERE s.student_id = ?
      `, [userId]);

      if (studentInfo.length === 0) {
        return error(res, '学生信息不存在', 404);
      }
    } else if (userType === 'admin' || userType === 'teacher') {
      // 管理员和教师生成表单时，使用示例学生信息
      console.log('⚠️ 管理员/教师生成表单，使用示例信息');
      studentInfo = [{
        student_id: 0,
        name: '示例学生',
        student_code: '20240001',
        gender: '男',
        class_name: '示例班级',
        major_name: '示例专业',
        college_name: '示例学院',
        phone: '13800138000',
        email: 'example@edu.cn',
        address: '示例地址'
      }];
    }

    // 根据模板类型生成不同的表单
    let result;
    const finalTemplateName = template[0].template_name;

    if (finalTemplateName.includes('竞赛')) {
      result = await formGenerator.generateCompetitionForm(studentInfo[0]);
    } else if (finalTemplateName.includes('转专业')) {
      result = await formGenerator.generateTransferForm(studentInfo[0]);
    } else if (finalTemplateName.includes('奖学金')) {
      result = await formGenerator.generateScholarshipForm(studentInfo[0]);
    } else if (finalTemplateName.includes('休学')) {
      result = await formGenerator.generateSuspensionForm(studentInfo[0]);
    } else if (finalTemplateName.includes('复学')) {
      result = await formGenerator.generateResumeForm(studentInfo[0]);
    } else if (finalTemplateName.includes('请假')) {
      result = await formGenerator.generateLeaveForm(studentInfo[0]);
    } else if (finalTemplateName.includes('贫困生') || finalTemplateName.includes('困难')) {
      result = await formGenerator.generatePovertyCertificationForm(studentInfo[0]);
    } else if (finalTemplateName.includes('助学金') && !finalTemplateName.includes('助学贷款')) {
      result = await formGenerator.generateFinancialAidForm(studentInfo[0]);
    } else if (finalTemplateName.includes('助学贷款')) {
      result = await formGenerator.generateStudentLoanForm(studentInfo[0]);
    } else if (finalTemplateName.includes('成绩证明')) {
      result = await formGenerator.generateGradeCertificateForm(studentInfo[0]);
    } else if (finalTemplateName.includes('在读证明')) {
      result = await formGenerator.generateEnrollmentCertificateForm(studentInfo[0]);
    } else if (finalTemplateName.includes('毕业证明')) {
      result = await formGenerator.generateGraduationCertificateForm(studentInfo[0]);
    } else if (finalTemplateName.includes('学位证明')) {
      result = await formGenerator.generateDegreeCertificateForm(studentInfo[0]);
    } else {
      // 其他表单类型暂不支持
      return error(res, `暂不支持该表单类型："${finalTemplateName}"。\n\n目前支持的表单：\n【申请表】\n- 学科竞赛参赛申请表\n- 转专业申请表\n- 奖学金申请表\n- 休学申请表\n- 复学申请表\n- 请假申请表\n- 贫困生认定申请表\n- 助学金申请表\n- 助学贷款申请表\n\n【证明表】\n- 成绩证明申请表\n- 在读证明申请表\n- 毕业证明申请表\n- 学位证明申请表\n\n更多表单正在开发中，敬请期待！`, 400);
    }

    // 更新下载次数
    await query(`
      UPDATE form_templates
      SET download_count = download_count + 1
      WHERE template_id = ?
    `, [template[0].template_id]);

    console.log('✅ 表单生成成功', { fileName: result.fileName });

    const message = userType === 'student'
      ? '✅ 表单生成成功，已自动填充您的个人信息'
      : '✅ 表单生成成功（管理员模式，使用示例信息）';

    success(res, {
      downloadUrl: result.downloadUrl,
      fileName: result.fileName,
      templateName: finalTemplateName,
      message: message
    }, '表单生成成功');

  } catch (err) {
    console.error('❌ 生成表单失败:', err);
    error(res, '生成表单失败：' + err.message, 500);
  }
});

/**
 * 下载生成的表单文件
 * GET /api/forms/download/:fileName
 */
router.get('/download/:fileName', authenticate, async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, '../../exports/forms', fileName);

    console.log('📥 下载表单', { fileName });

    // 检查文件是否存在
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      console.error('❌ 文件不存在', { filePath });
      return error(res, '文件不存在', 404);
    }

    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    // 发送文件
    res.sendFile(filePath);

    console.log('✅ 表单下载成功', { fileName });

  } catch (err) {
    console.error('❌ 下载表单失败:', err);
    error(res, '下载表单失败', 500);
  }
});

module.exports = router;
