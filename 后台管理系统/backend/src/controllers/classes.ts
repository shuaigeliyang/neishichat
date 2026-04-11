import { executeQuery } from '../utils/db'

export async function getClasses() {
  try {
    const query = `
      SELECT
        c.class_id,
        c.class_name,
        c.major_id,
        m.major_name,
        m.college_id,
        col.college_name
      FROM classes c
      LEFT JOIN majors m ON c.major_id = m.major_id
      LEFT JOIN colleges col ON m.college_id = col.college_id
      ORDER BY c.class_id
    `
    const classes = await executeQuery(query)

    return {
      success: true,
      data: classes,
      total: classes.length
    }
  } catch (error: any) {
    console.error('获取班级列表失败:', error)
    return {
      success: false,
      error: error.message || '获取班级列表失败',
      data: [],
      total: 0
    }
  }
}

export async function getClassById(id: number) {
  try {
    const query = `
      SELECT
        c.class_id,
        c.class_name,
        c.major_id,
        m.major_name,
        m.college_id,
        col.college_name
      FROM classes c
      LEFT JOIN majors m ON c.major_id = m.major_id
      LEFT JOIN colleges col ON m.college_id = col.college_id
      WHERE c.class_id = ?
    `
    const classes = await executeQuery(query, [id])

    if (classes.length === 0) {
      return {
        success: false,
        error: '班级不存在',
        data: null
      }
    }

    return {
      success: true,
      data: classes[0]
    }
  } catch (error: any) {
    console.error('获取班级详情失败:', error)
    return {
      success: false,
      error: error.message || '获取班级详情失败',
      data: null
    }
  }
}

export async function createClass(data: { class_name: string; major_id: number }) {
  try {
    const query = 'INSERT INTO classes (class_name, major_id) VALUES (?, ?)'
    await executeQuery(query, [data.class_name, data.major_id])

    return {
      success: true,
      message: '班级创建成功'
    }
  } catch (error: any) {
    console.error('创建班级失败:', error)
    return {
      success: false,
      error: error.message || '创建班级失败'
    }
  }
}

export async function updateClass(id: number, data: { class_name: string; major_id: number }) {
  try {
    const query = 'UPDATE classes SET class_name = ?, major_id = ? WHERE class_id = ?'
    await executeQuery(query, [data.class_name, data.major_id, id])

    return {
      success: true,
      message: '班级更新成功'
    }
  } catch (error: any) {
    console.error('更新班级失败:', error)
    return {
      success: false,
      error: error.message || '更新班级失败'
    }
  }
}

export async function deleteClass(id: number) {
  try {
    const query = 'DELETE FROM classes WHERE class_id = ?'
    await executeQuery(query, [id])

    return {
      success: true,
      message: '班级删除成功'
    }
  } catch (error: any) {
    console.error('删除班级失败:', error)
    return {
      success: false,
      error: error.message || '删除班级失败'
    }
  }
}
