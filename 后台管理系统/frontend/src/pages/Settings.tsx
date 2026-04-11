import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function Settings() {
  const handleSave = () => {
    // TODO: 实现保存设置逻辑
    console.log('保存设置')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">系统设置</h2>
        <p className="text-muted-foreground">
          配置系统参数和连接信息
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API 设置</CardTitle>
          <CardDescription>
            配置智能体 API 相关参数
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">API 地址</Label>
            <Input
              id="api-url"
              placeholder="http://localhost:3000"
              defaultValue="http://localhost:3000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API 密钥</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="输入你的 API 密钥"
            />
          </div>
          <Button onClick={handleSave}>保存设置</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>数据库设置</CardTitle>
          <CardDescription>
            配置数据库连接信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="db-path">数据库路径</Label>
            <Input
              id="db-path"
              placeholder="../database/education.db"
              defaultValue="../database/education.db"
            />
          </div>
          <Button onClick={handleSave}>保存设置</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>知识库设置</CardTitle>
          <CardDescription>
            配置知识库相关参数
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chunk-size">文档块大小</Label>
            <Input
              id="chunk-size"
              type="number"
              placeholder="500"
              defaultValue="500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chunk-overlap">文档块重叠</Label>
            <Input
              id="chunk-overlap"
              type="number"
              placeholder="50"
              defaultValue="50"
            />
          </div>
          <Button onClick={handleSave}>保存设置</Button>
        </CardContent>
      </Card>
    </div>
  )
}
