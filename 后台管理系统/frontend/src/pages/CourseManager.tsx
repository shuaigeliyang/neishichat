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

export default function CourseManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 表单相关状态
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    credits: '',
    description: '',
  })

  // 获取课程数据
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/courses?${params}`)
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
      course_code: '',
      course_name: '',
      credits: '',
      description: '',
    })
    setEditingCourse(null)
  }

  // 打开新增对话框
  const handleAdd = () => {
    resetForm()
    setDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (course: any) => {
    setEditingCourse(course)
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      credits: course.credits?.toString() || '',
      description: course.description || '',
    })
    setDialogOpen(true)
  }

  // 保存数据
  const handleSave = async () => {
    // 表单验证
    if (!formData.course_name.trim()) {
      alert('请输入课程名称')
      return
    }
    if (!formData.course_code.trim()) {
      alert('请输入课程代码')
      return
    }

    try {
      const url = editingCourse
        ? `/api/courses/${editingCourse.course_id}`
        : '/api/courses'

      const method = editingCourse ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          credits: parseInt(formData.credits) || 0,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(editingCourse ? '修改成功！' : '新增成功！')
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
      const response = await fetch(`/api/courses/${id}`, {
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
        <h2 className="text-3xl font-bold tracking-tight">课程信息管理</h2>
        <p className="text-muted-foreground">
          管理课程信息，支持新增、编辑、删除操作（共{total}条数据）
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>课程列表</CardTitle>
          <CardDescription>
            管理课程基本信息，包括课程代码、课程名称、学分、课程描述等
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索课程名称或代码..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              新增课程
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
                      <TableHead>课程代码</TableHead>
                      <TableHead>课程名称</TableHead>
                      <TableHead>学分</TableHead>
                      <TableHead>课程描述</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.map((row: any) => (
                        <TableRow key={row.course_id}>
                          <TableCell>{row.course_id}</TableCell>
                          <TableCell>{row.course_code}</TableCell>
                          <TableCell>{row.course_name}</TableCell>
                          <TableCell>{row.credits || '-'}</TableCell>
                          <TableCell>{row.description || '-'}</TableCell>
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
                                onClick={() => handleDelete(row.course_id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
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
              {editingCourse ? '编辑课程信息' : '新增课程'}
            </DialogTitle>
            <DialogDescription>
              请填写课程信息，带*号的是必填项
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course_code">课程代码 *</Label>
                <Input
                  id="course_code"
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                  placeholder="例如: CS101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_name">课程名称 *</Label>
                <Input
                  id="course_name"
                  value={formData.course_name}
                  onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                  placeholder="请输入课程名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">学分</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                  placeholder="请输入学分"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">课程描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入课程描述"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {editingCourse ? '保存' : '新增'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
