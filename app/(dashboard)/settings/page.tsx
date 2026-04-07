"use client"

import { useState } from "react"
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Printer,
  Mail,
  Save,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
        <p className="text-muted-foreground">
          管理您的系统配置和偏好设置
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            基本设置
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            通知设置
          </TabsTrigger>
          <TabsTrigger value="print" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            打印设置
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            系统信息
          </TabsTrigger>
        </TabsList>

        {/* 基本设置 */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                用户信息
              </CardTitle>
              <CardDescription>
                管理您的个人资料和账户信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">用户名</Label>
                  <Input id="name" defaultValue="管理员" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" type="email" defaultValue="admin@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">公司名称</Label>
                <Input id="company" defaultValue="跨境电商有限公司" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                安全设置
              </CardTitle>
              <CardDescription>
                修改密码和安全选项
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知偏好
              </CardTitle>
              <CardDescription>
                配置您希望接收的通知类型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>低库存预警</Label>
                  <p className="text-sm text-muted-foreground">
                    当商品库存低于预警值时发送通知
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>新订单通知</Label>
                  <p className="text-sm text-muted-foreground">
                    有新订单创建时发送通知
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>系统更新通知</Label>
                  <p className="text-sm text-muted-foreground">
                    接收系统更新和维护通知
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                邮件通知
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用邮件通知</Label>
                  <p className="text-sm text-muted-foreground">
                    通过邮件接收重要通知
                  </p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-server">SMTP服务器</Label>
                <Input id="smtp-server" placeholder="smtp.example.com" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">端口</Label>
                  <Input id="smtp-port" placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">用户名</Label>
                  <Input id="smtp-username" placeholder="user@example.com" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 打印设置 */}
        <TabsContent value="print" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                打印配置
              </CardTitle>
              <CardDescription>
                配置默认打印机和标签格式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-printer">默认打印机</Label>
                <Input id="default-printer" defaultValue="系统默认打印机" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="label-width">标签宽度 (mm)</Label>
                  <Input id="label-width" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label-height">标签高度 (mm)</Label>
                  <Input id="label-height" defaultValue="60" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>打印前预览</Label>
                  <p className="text-sm text-muted-foreground">
                    打印前显示预览窗口
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 系统信息 */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                系统信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">系统版本</p>
                  <p className="font-medium">v1.0.0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Next.js版本</p>
                  <p className="font-medium">16.2.2</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">数据库</p>
                  <p className="font-medium">PostgreSQL + Prisma 7.6.0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">UI组件库</p>
                  <p className="font-medium">shadcn/ui + Tailwind CSS v4</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">最后更新</p>
                <p className="font-medium">2026-04-07</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline">重置</Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : saved ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              已保存
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存设置
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
