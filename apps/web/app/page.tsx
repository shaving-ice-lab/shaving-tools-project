import Link from "next/link";
import { Monitor, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Shaving Tools Project</h1>
        <p className="text-muted-foreground text-lg">
          手机硬件评测工具集
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/screen-test"
          className="group block p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Monitor className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">屏幕显示测试</h2>
              <p className="text-muted-foreground text-sm">
                专业级屏幕质量检测
              </p>
            </div>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 坏点检测</li>
            <li>• 刷新率测试</li>
            <li>• PWM频闪检测</li>
            <li>• 色彩准确度测试</li>
          </ul>
        </Link>

        <div className="block p-6 rounded-xl border bg-card/50 opacity-60 cursor-not-allowed">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-muted">
              <Smartphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">电池续航分析</h2>
              <p className="text-muted-foreground text-sm">
                即将推出
              </p>
            </div>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 电池健康度检测</li>
            <li>• 续航时间预估</li>
            <li>• 充电速度测试</li>
            <li>• 耗电分析</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>基于 Next.js + TypeScript + TailwindCSS 构建</p>
      </div>
    </main>
  );
}
