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
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function TeacherManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 表单相关状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<any>(null)
  const [formData, setFormData] = useState({
    teacher_code: '',
    name: '',
    gender: '男',
    phone: '',
    email: '',
    department: '',
    title: '讲师',
  })

  // 获取教师数据
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/teachers?${params}`)
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

  // 当页码或搜索词变化时重新获取数据
  useEffect(() => {
    fetchData()
  }, [page, searchQuery])

  // 重置表单
  const resetForm = () => {
    setFormData({
      teacher_code: '',
      name: '',
      gender: '男',
      phone: '',
      email: '',
      department: '',
      title: '讲师',
    })
    setEditingTeacher(null)
  }

  // 打开新增对话框
  const handleAdd = () => {
    resetForm()
    setDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (teacher: any) => {
    setEditingTeacher(teacher)
    setFormData({
      teacher_code: teacher.teacher_code,
      name: teacher.name,
      gender: teacher.gender,
      phone: teacher.phone || '',
      email: teacher.email || '',
      department: teacher.department || '',
      title: teacher.title || '讲师',
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
    if (!formData.teacher_code.trim()) {
      alert('请输入工号')
      return
    }

    try {
      const url = editingTeacher
        ? `/api/teachers/${editingTeacher.teacher_id}`
        : '/api/teachers'

      const method = editingTeacher ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        alert(editingTeacher ? '修改成功！' : '新增成功！')
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
      const response = await fetch(`/api/teachers/${id}`, {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">教师信息管理</h2>
        <p className="text-muted-foreground">
          管理教师信息，支持新增、编辑、删除操作（共{total}条数据）
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>教师列表</CardTitle>
          <CardDescription>
            管理教师基本信息，包括工号、姓名、职称、部门等
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索姓名或工号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              新增教师
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
                      <TableHead>工号</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>性别</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>职称</TableHead>
                      <TableHead>手机号</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.map((row: any) => (
                        <TableRow key={row.teacher_id}>
                          <TableCell>{row.teacher_id}</TableCell>
                          <TableCell>{row.teacher_code}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.gender}</TableCell>
                          <TableCell>{row.department || '-'}</TableCell>
                          <TableCell>{row.title || '-'}</TableCell>
                          <TableCell>{row.phone || '-'}</TableCell>
                          <TableCell>{row.email || '-'}</TableCell>
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
                                onClick={() => handleDelete(row.teacher_id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTeacher ? '编辑教师信息' : '新增教师'}
            </DialogTitle>
            <DialogDescription>
              请填写教师信息，带*号的是必填项
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher_code">工号 *</Label>
                <Input
                  id="teacher_code"
                  value={formData.teacher_code}
                  onChange={(e) => setFormData({ ...formData, teacher_code: e.target.value })}
                  placeholder="例如: T2024001"
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
                  placeholder="例如: teacher@edu.cn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">部门</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="请输入部门"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">职称</Label>
                <Select
                  value={formData.title}
                  onValueChange={(value) => setFormData({ ...formData, title: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择职称" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="教授">教授</SelectItem>
                    <SelectItem value="副教授">副教授</SelectItem>
                    <SelectItem value="讲师">讲师</SelectItem>
                    <SelectItem value="助教">助教</SelectItem>
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
              {editingTeacher ? '保存' : '新增'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
