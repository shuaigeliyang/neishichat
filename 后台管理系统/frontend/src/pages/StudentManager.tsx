import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Student } from '@/types'

interface College {
  college_id: number
  college_name: string
}

interface Major {
  major_id: number
  major_name: string
  college_id: number
}

interface Class {
  class_id: number
  class_name: string
  major_id: number
}

export default function StudentManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [data, setData] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 表单相关状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    student_code: '',
    name: '',
    gender: '男',
    major_id: '',
    class_id: '',
    phone: '',
    email: '',
    enrollment_date: '',
    status: '在读',
  })

  // 级联选择数据
  const [colleges, setColleges] = useState<College[]>([])
  const [majors, setMajors] = useState<Major[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null)

  // 获取学生数据
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery })
      })

      console.log('正在请求:', `/api/students?${params}`)
      const response = await fetch(`/api/students?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data || [])
        setTotal(result.total || 0)
      } else {
        setError(result.error || '获取数据失败')
        setData([])
        setTotal(0)
      }
    } catch (err: any) {
      console.error('请求失败:', err)
      setError('网络错误: ' + err.message)
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // 获取级联选择数据
  const fetchCascadeData = async () => {
    try {
      // 获取学院列表
      const collegesRes = await fetch('/api/colleges')
      const collegesData = await collegesRes.json()
      if (collegesData.success) {
        setColleges(collegesData.data || [])
      }

      // 获取专业列表
      const majorsRes = await fetch('/api/majors')
      const majorsData = await majorsRes.json()
      if (majorsData.success) {
        setMajors(majorsData.data || [])
      }

      // 获取班级列表
      const classesRes = await fetch('/api/classes')
      const classesData = await classesRes.json()
      if (classesData.success) {
        setClasses(classesData.data || [])
      }
    } catch (err) {
      console.error('获取级联数据失败:', err)
    }
  }

  // 当页码或搜索词变化时重新获取数据
  useEffect(() => {
    fetchData()
  }, [page, searchQuery])

  // 打开对话框时获取级联数据
  useEffect(() => {
    if (dialogOpen) {
      fetchCascadeData()
    }
  }, [dialogOpen])

  // 重置表单
  const resetForm = () => {
    setFormData({
      student_code: '',
      name: '',
      gender: '男',
      major_id: '',
      class_id: '',
      phone: '',
      email: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      status: '在读',
    })
    setEditingStudent(null)
    setSelectedCollege(null)
  }

  // 打开新增对话框
  const handleAdd = () => {
    resetForm()
    setDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (student: Student) => {
    setEditingStudent(student)

    // 根据选择的班级找到对应的专业和学院
    const selectedClass = classes.find(c => c.class_id === student.class_id)
    let majorId = ''
    if (selectedClass) {
      majorId = selectedClass.major_id.toString()
      const selectedMajor = majors.find(m => m.major_id === selectedClass.major_id)
      if (selectedMajor) {
        setSelectedCollege(selectedMajor.college_id)
      }
    }

    setFormData({
      student_code: student.student_code,
      name: student.name,
      gender: student.gender,
      major_id: majorId,
      class_id: student.class_id.toString(),
      phone: student.phone || '',
      email: student.email || '',
      enrollment_date: student.enrollment_date ? student.enrollment_date.split('T')[0] : new Date().toISOString().split('T')[0],
      status: student.status || '在读',
    })

    setDialogOpen(true)
  }

  // 保存数据
  const handleSave = async () => {
    // 表单验证
    if (!formData.name.trim()) {
      alert('请输入姓名')
      return
    }
    if (!formData.student_code.trim()) {
      alert('请输入学号')
      return
    }
    if (!formData.class_id) {
      alert('请选择班级')
      return
    }

    try {
      const url = editingStudent
        ? `/api/students/${editingStudent.student_id}`
        : '/api/students'

      const method = editingStudent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          class_id: parseInt(formData.class_id as string),
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(editingStudent ? '修改成功！' : '新增成功！')
        setDialogOpen(false)
        fetchData()
      } else {
        alert('操作失败：' + (result.error || '未知错误'))
      }
    } catch (err: any) {
      alert('操作失败：' + err.message)
    }
  }

  // 删除数据
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条数据吗？')) return

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('删除成功！')
        fetchData()
      } else {
        alert('删除失败：' + (result.error || '未知错误'))
      }
    } catch (err: any) {
      alert('删除失败：' + err.message)
    }
  }

  // 过滤专业列表
  const filteredMajors = selectedCollege
    ? majors.filter(m => m.college_id === selectedCollege)
    : majors

  // 过滤班级列表
  const filteredClasses = filteredMajors.length > 0
    ? classes.filter(c => filteredMajors.some(m => m.major_id === c.major_id))
    : classes

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">学生信息管理</h2>
        <p className="text-muted-foreground">
          管理学生信息，支持新增、编辑、删除操作（共{total}条数据）
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>学生列表</CardTitle>
          <CardDescription>
            可以直接在表格中编辑数据，所有修改会实时同步到数据库
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索姓名或学号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              新增学生
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">错误: {error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>学号</TableHead>
                      <TableHead>性别</TableHead>
                      <TableHead>班级</TableHead>
                      <TableHead>专业</TableHead>
                      <TableHead>学院</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.map((row: any) => (
                        <TableRow key={row.student_id}>
                          <TableCell>{row.student_id}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.student_code}</TableCell>
                          <TableCell>{row.gender}</TableCell>
                          <TableCell>{row.class_name}</TableCell>
                          <TableCell>{row.major_name}</TableCell>
                          <TableCell>{row.college_name}</TableCell>
                          <TableCell>{row.phone}</TableCell>
                          <TableCell>{row.status}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(row)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(row.student_id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground">
                          {error ? '数据加载失败' : '暂无数据'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 分页 */}
              {total > pageSize && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    共 {total} 条数据，第 {page} / {Math.ceil(total / pageSize)} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                      disabled={page >= Math.ceil(total / pageSize)}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? '编辑学生信息' : '新增学生'}
            </DialogTitle>
            <DialogDescription>
              请填写学生信息，带*号的是必填项
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_code">学号 *</Label>
                <Input
                  id="student_code"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                  placeholder="例如: S2024001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入姓名"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入手机号"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="例如: student@edu.cn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment_date">入学日期</Label>
                <Input
                  id="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="在读">在读</SelectItem>
                    <SelectItem value="休学">休学</SelectItem>
                    <SelectItem value="毕业">毕业</SelectItem>
                    <SelectItem value="退学">退学</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 级联选择：学院 → 专业 → 班级 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="college">学院</Label>
                <Select
                  value={selectedCollege?.toString() || ''}
                  onValueChange={(value) => setSelectedCollege(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请先选择学院" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.college_id} value={college.college_id.toString()}>
                        {college.college_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">专业</Label>
                <Select
                  value={formData.major_id || ''}
                  onValueChange={(value) => {
                    setFormData({ ...formData, major_id: value, class_id: '' })
                  }}
                  disabled={!selectedCollege}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCollege ? "请选择专业" : "请先选择学院"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMajors.map((major) => (
                      <SelectItem key={major.major_id} value={major.major_id.toString()}>
                        {major.major_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">班级 *</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                  disabled={!formData.major_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.major_id ? "请选择班级" : "请先选择专业"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClasses.map((cls) => (
                      <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingStudent ? '保存' : '新增'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
