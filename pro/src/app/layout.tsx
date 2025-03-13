import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '编程助手',
  description: '智能编程助手 - 代码编辑与AI对话',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="flex h-screen">
        <div className="flex flex-col flex-1 overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}