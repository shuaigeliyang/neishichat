const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const random = {
  int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  item: (arr) => arr[Math.floor(Math.random() * arr.length)],
  phone: () => '1' + random.int(3, 9) + random.int(100000000, 999999999),
};

const colleges = [
  { name: '计算机科学与技术学院', code: 'CS', dean: '张教授' },
  { name: '软件工程学院', code: 'SE', dean: '李教授' },
  { name: '信息管理学院', code: 'IM', dean: '王教授' },
  { name: '电子工程学院', code: 'EE', dean: '赵教授' },
  { name: '人工智能学院', code: 'AI', dean: '刘教授' }
];

const majors = [
  { name: '计算机科学与技术', code: 'CS001', college: 0 },
  { name: '软件工程', code: 'SE001', college: 1 },
  { name: '数据科学与大数据技术', code: 'DS001', college: 0 },
  { name: '信息管理与信息系统', code: 'IM001', college: 2 },
  { name: '电子信息工程', code: 'EE001', college: 3 },
  { name: '人工智能', code: 'AI001', college: 4 }
];

const firstNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '娟', '英', '华'];
const lastNames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '罗', '高', '林'];

async function genName() {
  return random.item(lastNames) + random.item(firstNames);
}

async function generateData() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'education_system'
  });

  const password = await bcrypt.hash('123456', 10);

  console.log('正在生成学院数据...');
  for (const c of colleges) {
    await conn.query('INSERT INTO colleges (college_name, college_code, dean_name, status) VALUES (?, ?, ?, 1)', [c.name, c.code, c.dean]);
  }

  console.log('正在生成专业数据...');
  for (const m of majors) {
    await conn.query('INSERT INTO majors (major_name, major_code, college_id, degree_type, duration, status) VALUES (?, ?, ?, \'本科\', 4, 1)', [m.name, m.code, m.college + 1]);
  }

  console.log('正在生成教师数据...');
  let teacherId = 1;
  const teacherIds = [];
  for (let c = 0; c < 5; c++) {
    for (let i = 0; i < 10; i++) {
      const name = await genName();
      const code = 'T' + (c + 1).toString().padStart(2, '0') + (i + 1).toString().padStart(3, '0');
      await conn.query('INSERT INTO teachers (teacher_code, name, gender, college_id, title, phone, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, 1)', [code, name, random.item(['男', '女']), c + 1, random.item(['讲师', '副教授', '教授']), random.phone(), password]);
      teacherIds.push(teacherId++);
    }
  }

  console.log('正在生成班级数据...');
  let classId = 1;
  const classMap = new Map();
  for (let m = 0; m < 6; m++) {
    for (let year = 2022; year <= 2024; year++) {
      const className = majors[m].name + year + '级1班';
      await conn.query('INSERT INTO classes (class_name, class_code, major_id, grade, status) VALUES (?, ?, ?, ?, 1)', [className, majors[m].code + year + '01', m + 1, year]);
      classMap.set(m + '-' + year, classId++);
    }
  }

  console.log('正在生成学生数据...');
  let studentId = 1;
  for (let m = 0; m < 6; m++) {
    for (let year = 2022; year <= 2024; year++) {
      const currentClassId = classMap.get(m + '-' + year);
      for (let i = 0; i < 30; i++) {
        const name = await genName();
        const code = 'S' + year.toString().slice(2) + (m + 1).toString().padStart(2, '0') + (i + 1).toString().padStart(3, '0');
        await conn.query('INSERT INTO students (student_code, name, gender, class_id, phone, email, enrollment_date, status, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [code, name, random.item(['男', '女']), currentClassId, random.phone(), code + '@edu.cn', year + '-09-01', '在读', password]);
        studentId++;
      }
    }
  }

  console.log('正在生成课程数据...');
  const courses = [
    { name: '高等数学', code: 'MATH101', credit: 5, hours: 80 },
    { name: '大学英语', code: 'ENG101', credit: 4, hours: 64 },
    { name: '数据结构', code: 'CS201', credit: 4, hours: 64 },
    { name: '算法分析', code: 'CS202', credit: 3, hours: 48 },
    { name: '操作系统', code: 'CS301', credit: 4, hours: 64 },
    { name: '计算机网络', code: 'CS302', credit: 3, hours: 48 },
    { name: '数据库原理', code: 'CS303', credit: 3, hours: 48 },
    { name: '软件工程', code: 'SE301', credit: 3, hours: 48 }
  ];

  for (const c of courses) {
    await conn.query('INSERT INTO courses (course_code, course_name, course_type, credits, total_hours, status) VALUES (?, ?, ?, ?, ?, 1)', [c.code, c.name, '专业必修课', c.credit, c.hours]);
  }

  console.log('正在生成开课计划...');
  let offeringId = 1;
  const semesters = ['2023-2024-1', '2023-2024-2', '2024-2025-1'];
  for (const sem of semesters) {
    for (let c = 1; c <= 8; c++) {
      await conn.query('INSERT INTO course_offerings (course_id, teacher_id, semester, class_id, schedule, classroom, status) VALUES (?, ?, ?, ?, ?, ?, 1)', [c, random.item(teacherIds), sem, random.int(1, 18), '周' + random.int(1, 5) + ' ' + random.int(1, 8) + '节', 'A' + random.int(101, 502)]);
      offeringId++;
    }
  }

  console.log('正在生成成绩数据...');
  const students = await conn.query('SELECT student_id, class_id FROM students LIMIT 100');
  for (const s of students[0]) {
    for (let sem = 0; sem < 3; sem++) {
      for (let c = 0; c < 5; c++) {
        const offering = (sem * 8 + c) % 24 + 1;
        const finalScore = random.int(55, 98);
        const totalScore = finalScore;
        await conn.query('INSERT INTO grades (student_id, offering_id, final_score, total_score) VALUES (?, ?, ?, ?)', [s.student_id, offering, finalScore, totalScore]);
      }
    }
  }

  console.log('正在生成管理办法...');
  await conn.query('INSERT INTO regulations (title, category, content, version, status) VALUES (?, ?, ?, ?, ?)', ['学生学籍管理规定', '学籍管理', '这是学生学籍管理规定的详细内容...', 'v1.0', '生效中']);
  await conn.query('INSERT INTO regulations (title, category, content, version, status) VALUES (?, ?, ?, ?, ?)', ['学生奖励办法', '奖助学金', '这是学生奖励办法的详细内容...', 'v1.0', '生效中']);
  await conn.query('INSERT INTO regulations (title, category, content, version, status) VALUES (?, ?, ?, ?, ?)', ['学生违纪处分规定', '学生管理', '这是学生违纪处分规定的详细内容...', 'v1.0', '生效中']);

  console.log('正在生成可下载表格...');
  await conn.query('INSERT INTO downloadable_forms (form_name, category, description, file_url, target_user, status) VALUES (?, ?, ?, ?, ?, 1)', ['学生请假申请表', '申请表', '学生请假申请表格', '/templates/leave_application.docx', '全体学生']);
  await conn.query('INSERT INTO downloadable_forms (form_name, category, description, file_url, target_user, status) VALUES (?, ?, ?, ?, ?, 1)', ['在校证明申请表', '证明表', '在校学生证明申请表格', '/templates/enrollment_proof.docx', '全体学生']);
  await conn.query('INSERT INTO downloadable_forms (form_name, category, description, file_url, target_user, status) VALUES (?, ?, ?, ?, ?, 1)', ['奖学金申请表', '申请表', '奖学金申请表格', '/templates/scholarship_application.docx', '全体学生']);
  await conn.query('INSERT INTO downloadable_forms (form_name, category, description, file_url, target_user, status) VALUES (?, ?, ?, ?, ?, 1)', ['成绩单打印申请', '证明表', '成绩单打印申请表格', '/templates/transcript_application.docx', '全体学生']);
  await conn.query('INSERT INTO downloadable_forms (form_name, category, description, file_url, target_user, status) VALUES (?, ?, ?, ?, ?, 1)', ['教室使用申请表', '申请表', '教室使用申请表格', '/templates/classroom_application.docx', '全体教师']);

  const stats = {};
  stats.colleges = (await conn.query('SELECT COUNT(*) as c FROM colleges'))[0][0].c;
  stats.majors = (await conn.query('SELECT COUNT(*) as c FROM majors'))[0][0].c;
  stats.classes = (await conn.query('SELECT COUNT(*) as c FROM classes'))[0][0].c;
  stats.students = (await conn.query('SELECT COUNT(*) as c FROM students'))[0][0].c;
  stats.teachers = (await conn.query('SELECT COUNT(*) as c FROM teachers'))[0][0].c;
  stats.courses = (await conn.query('SELECT COUNT(*) as c FROM courses'))[0][0].c;
  stats.grades = (await conn.query('SELECT COUNT(*) as c FROM grades'))[0][0].c;

  console.log('\n========================================');
  console.log('  测试数据生成完成！');
  console.log('========================================');
  console.log('  学院：' + stats.colleges + ' 个');
  console.log('  专业：' + stats.majors + ' 个');
  console.log('  班级：' + stats.classes + ' 个');
  console.log('  学生：' + stats.students + ' 人');
  console.log('  教师：' + stats.teachers + ' 人');
  console.log('  课程：' + stats.courses + ' 门');
  console.log('  成绩：' + stats.grades + ' 条');
  console.log('========================================');
  console.log('\n默认登录账号：');
  console.log('  学生：S230101001 ~ S240630030');
  console.log('  教师：T01001 ~ T05100');
  console.log('  管理员：admin / admin123');
  console.log('  默认密码：123456\n');

  await conn.end();
}

generateData().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
