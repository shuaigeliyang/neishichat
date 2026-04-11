import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import type { Student, Teacher, Course } from '@/types'

export default function DataManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTable, setSelectedTable] = useState<'students' | 'teachers' | 'courses'>('students')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取数据的函数
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const endpoint = selectedTable === 'students' ? '/students' :
                      selectedTable === 'teachers' ? '/teachers' : '/courses'

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(searchQuery && { search: searchQuery })
      })

      console.log('正在请求:', `/api${endpoint}?${params}`)

      const response = await fetch(`/api${endpoint}?${params}`)
      console.log('响应状态:', response.status)

      const result = await response.json()
      console.log('响应数据:', result)

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

  // 当选择表、页码或搜索词变化时重新获取数据
  useEffect(() => {
    fetchData()
  }, [selectedTable, page, searchQuery])

  // 删除数据
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条数据吗？')) return

    try {
      const endpoint = selectedTable === 'students' ? `/students/${id}` :
                      selectedTable === 'teachers' ? `/teachers/${id}` : `/courses/${id}`

      const response = await fetch(`/api${endpoint}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('删除成功！')
        fetchData() // 重新获取数据
      } else {
        alert('删除失败：' + (result.error || '未知错误'))
      }
    } catch (err: any) {
      alert('删除失败：' + err.message)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">数据管理</h2>
        <p className="text-muted-foreground">
          管理系统中的各类数据，支持在线编辑和实时更新（共{total}条数据）
        </p>
      </div>

      <div className="flex gap-4">
        <Button
          variant={selectedTable === 'students' ? 'default' : 'outline'}
          onClick={() => {
            setSelectedTable('students')
            setPage(1)
            setSearchQuery('')
          }}
        >
          学生信息
        </Button>
        <Button
          variant={selectedTable === 'teachers' ? 'default' : 'outline'}
          onClick={() => {
            setSelectedTable('teachers')
            setPage(1)
            setSearchQuery('')
          }}
        >
          教师信息
        </Button>
        <Button
          variant={selectedTable === 'courses' ? 'default' : 'outline'}
          onClick={() => {
            setSelectedTable('courses')
            setPage(1)
            setSearchQuery('')
          }}
        >
          课程信息
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTable === 'students' ? '学生' : selectedTable === 'teachers' ? '教师' : '课程'}数据管理
          </CardTitle>
          <CardDescription>
            可以直接在表格中编辑数据，所有修改会实时同步到数据库
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索姓名或编号..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => alert('新增功能开发中...')}>
              <Plus className="mr-2 h-4 w-4" />
              新增数据
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
                      {selectedTable === 'students' && (
                        <>
                          <TableHead>ID</TableHead>
                          <TableHead>姓名</TableHead>
                          <TableHead>学号</TableHead>
                          <TableHead>班级</TableHead>
                          <TableHead>专业</TableHead>
                          <TableHead>学院</TableHead>
                          <TableHead>性别</TableHead>
                          <TableHead>操作</TableHead>
                        </>
                      )}
                      {selectedTable === 'teachers' && (
                        <>
                          <TableHead>ID</TableHead>
                          <TableHead>姓名</TableHead>
                          <TableHead>工号</TableHead>
                          <TableHead>学院</TableHead>
                          <TableHead>职称</TableHead>
                          <TableHead>性别</TableHead>
                          <TableHead>操作</TableHead>
                        </>
                      )}
                      {selectedTable === 'courses' && (
                        <>
                          <TableHead>ID</TableHead>
                          <TableHead>课程名称</TableHead>
                          <TableHead>课程代码</TableHead>
                          <TableHead>课程类型</TableHead>
                          <TableHead>学分</TableHead>
                          <TableHead>学时</TableHead>
                          <TableHead>操作</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.map((row: any) => (
                        <TableRow key={row.student_id || row.teacher_id || row.course_id}>
                          {selectedTable === 'students' && (
                            <>
                              <TableCell>{row.student_id}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.student_code}</TableCell>
                              <TableCell>{row.class_name}</TableCell>
                              <TableCell>{row.major_name}</TableCell>
                              <TableCell>{row.college_name}</TableCell>
                              <TableCell>{row.gender}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="icon" variant="ghost" onClick={() => alert('编辑功能开发中...')}>
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
                            </>
                          )}
                          {selectedTable === 'teachers' && (
                            <>
                              <TableCell>{row.teacher_id}</TableCell>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>{row.teacher_code}</TableCell>
                              <TableCell>{row.college_name}</TableCell>
                              <TableCell>{row.title || '-'}</TableCell>
                              <TableCell>{row.gender || '-'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="icon" variant="ghost" onClick={() => alert('编辑功能开发中...')}>
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
                            </>
                          )}
                          {selectedTable === 'courses' && (
                            <>
                              <TableCell>{row.course_id}</TableCell>
                              <TableCell>{row.course_name}</TableCell>
                              <TableCell>{row.course_code}</TableCell>
                              <TableCell>{row.course_type || '-'}</TableCell>
                              <TableCell>{row.credits || '-'}</TableCell>
                              <TableCell>{row.total_hours || '-'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="icon" variant="ghost" onClick={() => alert('编辑功能开发中...')}>
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
                            </>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
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
    </div>
  )
}
