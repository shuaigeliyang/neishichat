-- ============================================
-- 学生教育系统智能体 - 数据库设计
-- 设计者：哈雷酱大小姐 (￣▽￣)ﾉ
-- 创建时间：2026-03-20
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS education_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE education_system;

-- ============================================
-- 1. 学院表
-- ============================================
CREATE TABLE IF NOT EXISTS colleges (
    college_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '学院ID',
    college_name VARCHAR(100) NOT NULL COMMENT '学院名称',
    college_code VARCHAR(20) UNIQUE NOT NULL COMMENT '学院代码',
    dean_name VARCHAR(50) COMMENT '院长姓名',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    contact_email VARCHAR(100) COMMENT '联系邮箱',
    address VARCHAR(200) COMMENT '办公地址',
    description TEXT COMMENT '学院简介',
    website VARCHAR(200) COMMENT '学院官网',
    established_date DATE COMMENT '成立日期',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_college_code (college_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学院信息表';

-- ============================================
-- 2. 专业表
-- ============================================
CREATE TABLE IF NOT EXISTS majors (
    major_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '专业ID',
    major_code VARCHAR(20) UNIQUE NOT NULL COMMENT '专业代码',
    major_name VARCHAR(100) NOT NULL COMMENT '专业名称',
    college_id INT NOT NULL COMMENT '所属学院ID',
    degree_type ENUM('专科', '本科', '硕士', '博士') DEFAULT '本科' COMMENT '学位类型',
    duration TINYINT DEFAULT 4 COMMENT '学制（年）',
    tuition DECIMAL(10,2) COMMENT '学费',
    description TEXT COMMENT '专业简介',
    employment_rate DECIMAL(5,2) COMMENT '就业率（%）',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_college (college_id),
    INDEX idx_major_code (major_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专业信息表';

-- ============================================
-- 3. 教师表（需要先创建，因为班级表引用它）
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '教师ID',
    teacher_code VARCHAR(20) UNIQUE NOT NULL COMMENT '教师工号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender ENUM('男', '女') COMMENT '性别',
    birth_date DATE COMMENT '出生日期',
    id_card VARCHAR(18) UNIQUE COMMENT '身份证号',
    college_id INT NOT NULL COMMENT '所属学院ID',
    title ENUM('助教', '讲师', '副教授', '教授') DEFAULT '讲师' COMMENT '职称',
    education ENUM('学士', '硕士', '博士') COMMENT '学历',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    office_address VARCHAR(100) COMMENT '办公室地址',
    hire_date DATE COMMENT '入职日期',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在职，0-离职',
    password VARCHAR(255) DEFAULT '123456' COMMENT '登录密码（加密存储）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_teacher_code (teacher_code),
    INDEX idx_college (college_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师信息表';

-- ============================================
-- 4. 班级表
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '班级ID',
    class_name VARCHAR(50) NOT NULL COMMENT '班级名称',
    class_code VARCHAR(20) UNIQUE NOT NULL COMMENT '班级代码',
    major_id INT NOT NULL COMMENT '所属专业ID',
    grade YEAR NOT NULL COMMENT '年级',
    teacher_id INT COMMENT '班主任教师ID',
    student_count INT DEFAULT 0 COMMENT '学生人数',
    classroom VARCHAR(50) COMMENT '固定教室',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (major_id) REFERENCES majors(major_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_major (major_id),
    INDEX idx_grade (grade),
    INDEX idx_class_code (class_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班级信息表';

-- ============================================
-- 5. 学生表
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    student_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '学生ID',
    student_code VARCHAR(20) UNIQUE NOT NULL COMMENT '学号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender ENUM('男', '女') COMMENT '性别',
    birth_date DATE COMMENT '出生日期',
    id_card VARCHAR(18) UNIQUE COMMENT '身份证号',
    class_id INT NOT NULL COMMENT '班级ID',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    address VARCHAR(200) COMMENT '家庭住址',
    enrollment_date DATE COMMENT '入学日期',
    political_status ENUM('群众', '团员', '党员') DEFAULT '群众' COMMENT '政治面貌',
    nation VARCHAR(20) DEFAULT '汉族' COMMENT '民族',
    dormitory VARCHAR(50) COMMENT '宿舍号',
    status ENUM('在读', '休学', '毕业', '退学', '其他') DEFAULT '在读' COMMENT '学籍状态',
    password VARCHAR(255) DEFAULT '123456' COMMENT '登录密码（加密存储）',
    avatar VARCHAR(255) COMMENT '头像URL',
    guardian_name VARCHAR(50) COMMENT '监护人姓名',
    guardian_phone VARCHAR(20) COMMENT '监护人电话',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_student_code (student_code),
    INDEX idx_class (class_id),
    INDEX idx_status (status),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生信息表';

-- ============================================
-- 6. 课程表
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '课程ID',
    course_code VARCHAR(20) UNIQUE NOT NULL COMMENT '课程代码',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    course_type ENUM('公共基础课', '专业基础课', '专业必修课', '专业选修课', '公共选修课') DEFAULT '专业必修课' COMMENT '课程类型',
    credits DECIMAL(3,1) NOT NULL COMMENT '学分',
    total_hours INT COMMENT '总学时',
    theory_hours INT COMMENT '理论学时',
    practice_hours INT COMMENT '实践学时',
    description TEXT COMMENT '课程简介',
    prerequisite VARCHAR(200) COMMENT '先修课程',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_course_code (course_code),
    INDEX idx_course_type (course_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程信息表';

-- ============================================
-- 7. 开课计划表
-- ============================================
CREATE TABLE IF NOT EXISTS course_offerings (
    offering_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '开课计划ID',
    course_id INT NOT NULL COMMENT '课程ID',
    teacher_id INT NOT NULL COMMENT '授课教师ID',
    semester VARCHAR(20) NOT NULL COMMENT '学期（如：2024-2025-1）',
    class_id INT COMMENT '授课班级ID',
    schedule VARCHAR(200) COMMENT '上课时间安排',
    classroom VARCHAR(50) COMMENT '上课教室',
    max_students INT DEFAULT 100 COMMENT '最大选课人数',
    current_students INT DEFAULT 0 COMMENT '当前选课人数',
    status TINYINT DEFAULT 1 COMMENT '状态：1-开课中，0-已结束',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_semester (semester),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='开课计划表';

-- ============================================
-- 8. 成绩表
-- ============================================
CREATE TABLE IF NOT EXISTS grades (
    grade_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '成绩ID',
    student_id INT NOT NULL COMMENT '学生ID',
    offering_id INT NOT NULL COMMENT '开课计划ID',
    usual_score DECIMAL(5,2) COMMENT '平时成绩',
    midterm_score DECIMAL(5,2) COMMENT '期中成绩',
    final_score DECIMAL(5,2) NOT NULL COMMENT '期末成绩',
    total_score DECIMAL(5,2) COMMENT '总评成绩',
    credit_point DECIMAL(3,2) COMMENT '绩点',
    rank_in_class INT COMMENT '班级排名',
    rank_in_grade INT COMMENT '年级排名',
    is_retake TINYINT DEFAULT 0 COMMENT '是否重修：1-是，0-否',
    remark VARCHAR(200) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (offering_id) REFERENCES course_offerings(offering_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uk_student_offering (student_id, offering_id),
    INDEX idx_student (student_id),
    INDEX idx_offering (offering_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生成绩表';

-- ============================================
-- 9. 管理办法表（支持版本控制）
-- ============================================
CREATE TABLE IF NOT EXISTS regulations (
    regulation_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '办法ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    category VARCHAR(50) NOT NULL COMMENT '分类（学生管理/教学管理/奖助学金等）',
    content TEXT NOT NULL COMMENT '内容',
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    parent_id INT DEFAULT NULL COMMENT '父版本ID（用于版本追溯）',
    effective_date DATE COMMENT '生效日期',
    expiry_date DATE COMMENT '失效日期',
    status ENUM('生效中', '已失效', '草稿') DEFAULT '草稿' COMMENT '状态',
    publisher VARCHAR(50) COMMENT '发布部门',
    attachment_url VARCHAR(255) COMMENT '附件URL',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    created_by INT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (parent_id) REFERENCES regulations(regulation_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_category (category),
    INDEX idx_version (version),
    INDEX idx_status (status),
    INDEX idx_effective_date (effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理办法表（支持版本控制）';

-- ============================================
-- 10. 表格下载表
-- ============================================
CREATE TABLE IF NOT EXISTS downloadable_forms (
    form_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '表格ID',
    form_name VARCHAR(200) NOT NULL COMMENT '表格名称',
    category VARCHAR(50) NOT NULL COMMENT '分类（申请表/证明表/统计表等）',
    description TEXT COMMENT '表格说明',
    file_url VARCHAR(255) NOT NULL COMMENT '文件URL',
    file_type VARCHAR(20) COMMENT '文件类型（pdf/doc/xls等）',
    file_size BIGINT COMMENT '文件大小（字节）',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    target_user ENUM('全体学生', '全体教师', '管理员', '全体用户') DEFAULT '全体学生' COMMENT '适用对象',
    status TINYINT DEFAULT 1 COMMENT '状态：1-可用，0-不可用',
    created_by INT COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_target_user (target_user),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='表格下载表';

-- ============================================
-- 11. 用户角色表
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_name VARCHAR(50) NOT NULL COMMENT '角色名称（学生/教师/管理员）',
    description VARCHAR(200) COMMENT '角色描述',
    permissions JSON COMMENT '权限列表（JSON格式）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色表';

-- ============================================
-- 12. 用户角色关联表
-- ============================================
CREATE TABLE IF NOT EXISTS user_role_relations (
    relation_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    user_type ENUM('student', 'teacher', 'admin') NOT NULL COMMENT '用户类型',
    user_id INT NOT NULL COMMENT '用户ID',
    role_id INT NOT NULL COMMENT '角色ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user (user_type, user_id, role_id),
    FOREIGN KEY (role_id) REFERENCES user_roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- ============================================
-- 13. 对话历史表
-- ============================================
CREATE TABLE IF NOT EXISTS chat_history (
    chat_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '对话ID',
    user_type ENUM('student', 'teacher', 'admin') NOT NULL COMMENT '用户类型',
    user_id INT NOT NULL COMMENT '用户ID',
    user_question TEXT NOT NULL COMMENT '用户问题',
    ai_answer TEXT COMMENT 'AI回答',
    intent VARCHAR(100) COMMENT '识别的意图',
    sql_query TEXT COMMENT '生成的SQL（如果有）',
    query_result TEXT COMMENT '查询结果摘要',
    satisfaction TINYINT COMMENT '满意度评分（1-5分）',
    session_id VARCHAR(100) COMMENT '会话ID（用于关联多轮对话）',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user (user_type, user_id),
    INDEX idx_session (session_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话历史表';

-- ============================================
-- 14. 常见问题表
-- ============================================
CREATE TABLE IF NOT EXISTS faq (
    faq_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'FAQ ID',
    question VARCHAR(500) NOT NULL COMMENT '问题',
    answer TEXT NOT NULL COMMENT '答案',
    category VARCHAR(50) COMMENT '分类',
    priority INT DEFAULT 0 COMMENT '优先级（数字越大越优先）',
    click_count INT DEFAULT 0 COMMENT '点击次数',
    status TINYINT DEFAULT 1 COMMENT '状态：1-显示，0-隐藏',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='常见问题表';

-- ============================================
-- 15. 通知公告表
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '公告ID',
    title VARCHAR(200) NOT NULL COMMENT '公告标题',
    content TEXT NOT NULL COMMENT '公告内容',
    category VARCHAR(50) COMMENT '分类（教务通知/学生工作/校园活动等）',
    priority ENUM('低', '中', '高') DEFAULT '中' COMMENT '优先级',
    target_audience ENUM('全体学生', '全体教师', '全体用户', '特定班级') DEFAULT '全体用户' COMMENT '目标受众',
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶：1-是，0-否',
    publish_time TIMESTAMP NULL COMMENT '发布时间',
    expire_time TIMESTAMP NULL COMMENT '过期时间',
    view_count INT DEFAULT 0 COMMENT '浏览次数',
    publisher_id INT COMMENT '发布者ID',
    attachment_url VARCHAR(255) COMMENT '附件URL',
    status ENUM('草稿', '已发布', '已撤回') DEFAULT '草稿' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_publish_time (publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知公告表';

-- ============================================
-- 16. 系统日志表
-- ============================================
CREATE TABLE IF NOT EXISTS system_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_type ENUM('student', 'teacher', 'admin', 'system') NOT NULL COMMENT '用户类型',
    user_id INT COMMENT '用户ID',
    action VARCHAR(100) NOT NULL COMMENT '操作类型',
    module VARCHAR(50) COMMENT '模块名称',
    description TEXT COMMENT '操作描述',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    request_data JSON COMMENT '请求数据',
    response_data JSON COMMENT '响应数据',
    status ENUM('成功', '失败') DEFAULT '成功' COMMENT '操作状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user (user_type, user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- ============================================
-- 初始化角色数据
-- ============================================
INSERT INTO user_roles (role_name, description, permissions) VALUES
('学生', '普通学生用户', '["view_profile", "view_grades", "view_courses", "download_forms", "chat_ai"]'),
('教师', '教师用户', '["view_profile", "view_student_grades", "view_teaching_courses", "download_forms", "chat_ai", "view_class_students"]'),
('管理员', '系统管理员', '["all_permissions"]');
