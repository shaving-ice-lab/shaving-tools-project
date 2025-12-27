'use client'

import { useState } from 'react'
import { Image, Camera, Palette, Sun, Scan, Grid3X3, Circle, Thermometer, ExternalLink, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TestChart {
  id: string
  name: string
  icon: React.ElementType
  description: string
  usage: string[]
  specifications: { label: string; value: string }[]
  purchaseUrl?: string
  diyOption?: string
}

const testCharts: TestChart[] = [
  {
    id: 'iso12233',
    name: 'ISO 12233 解析力测试图',
    icon: Camera,
    description: '标准解析力测试图，用于测量MTF曲线、锐度和解析力。包含多个方向的斜边图案和频率响应图案。',
    usage: ['将测试图平整悬挂，确保无褶皱', '相机与测试图保持平行', '测试图应填满画面约80%', '使用三脚架和遥控快门', '在最佳光圈(f/5.6-f/8)下拍摄'],
    specifications: [
      { label: '推荐尺寸', value: 'A1 或更大' },
      { label: '材质', value: '亚光相纸或专业测试卡' },
      { label: '精度', value: '印刷精度 > 2400 dpi' },
    ],
    purchaseUrl: 'https://www.image-engineering.de/',
    diyOption: '可使用高精度打印机打印PDF版本',
  },
  {
    id: 'colorchecker',
    name: 'X-Rite ColorChecker 24色卡',
    icon: Palette,
    description: '业界标准24色参考色卡，包含6级灰阶和18个标准颜色，用于评估色彩准确度。',
    usage: ['在D65标准光源或5500K日光下拍摄', '色卡应均匀受光，避免反光', '色卡填满画面约50-70%', '使用RAW格式拍摄', '避免在色卡上产生阴影'],
    specifications: [
      { label: '色块数量', value: '24个 (6x4)' },
      { label: '尺寸', value: '标准版 22x13cm / Mini版 6.4x11cm' },
      { label: '色差精度', value: 'ΔE < 1' },
    ],
    purchaseUrl: 'https://www.xrite.com/',
    diyOption: '不建议DIY，标准色卡精度要求高',
  },
  {
    id: 'grayscale',
    name: 'Stouffer 灰阶测试图',
    icon: Sun,
    description: '21级灰阶透射或反射测试图，用于测量动态范围和光电转换曲线。',
    usage: ['灰阶图需均匀照明', '确保所有灰阶可见', '使用RAW格式获得最大动态范围', '可进行包围曝光测试', '记录曝光参数'],
    specifications: [
      { label: '灰阶级数', value: '21级' },
      { label: '密度范围', value: '0.05 - 3.05 D' },
      { label: '类型', value: '透射型 / 反射型' },
    ],
    purchaseUrl: 'https://www.stouffer.net/',
    diyOption: '可使用灰卡组合替代',
  },
  {
    id: 'graycard',
    name: '18% 灰卡',
    icon: Scan,
    description: '标准18%反射率灰卡，用于噪点分析、白平衡校准和曝光基准。',
    usage: ['灰卡应均匀受光', '拍摄均匀无纹理的灰色区域', '可用于手动白平衡设置', '用于噪点分析时需正确曝光', '避免过曝或欠曝'],
    specifications: [
      { label: '反射率', value: '18%' },
      { label: '推荐尺寸', value: 'A4 或更大' },
      { label: '材质', value: '专业灰卡纸' },
    ],
    purchaseUrl: 'https://www.bhphotovideo.com/',
    diyOption: '可购买摄影用18%灰卡',
  },
  {
    id: 'gridchart',
    name: '畸变测试网格图',
    icon: Grid3X3,
    description: '标准方格网格图，用于测量桶形、枕形和复杂畸变。',
    usage: ['网格图需完全平整', '相机光轴垂直于网格中心', '网格应填满整个画面', '使用水平仪确保相机水平', '在多个焦距下测试'],
    specifications: [
      { label: '网格密度', value: '10x10 或更密' },
      { label: '线条粗细', value: '2-3mm' },
      { label: '精度', value: '线条直线度 < 0.1mm' },
    ],
    diyOption: '可使用CAD软件绘制并打印',
  },
  {
    id: 'uniformlight',
    name: '均匀光源/白墙',
    icon: Circle,
    description: '用于暗角测试的均匀光源或白色墙面。',
    usage: ['确保光源/墙面完全均匀', '避免任何纹理或污点', '使用最大光圈测试', '确保无反光点', '可使用灯箱获得更均匀效果'],
    specifications: [
      { label: '均匀度', value: '< 5% 亮度差异' },
      { label: '颜色', value: '中性白或灰' },
      { label: '尺寸', value: '充满画面' },
    ],
    diyOption: '可使用均匀照明的白墙',
  },
]

export function TestChartGuide() {
  const [selectedChart, setSelectedChart] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Image className="h-6 w-6" />
          测试图指南
        </h2>
        <p className="text-muted-foreground mt-1">了解各项测试所需的标准测试图及使用方法</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testCharts.map(chart => {
          const Icon = chart.icon
          const isSelected = selectedChart === chart.id

          return (
            <Card
              key={chart.id}
              className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedChart(isSelected ? null : chart.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {chart.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{chart.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedChart && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {testCharts.find(c => c.id === selectedChart)?.name}
            </CardTitle>
            <CardDescription>{testCharts.find(c => c.id === selectedChart)?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const chart = testCharts.find(c => c.id === selectedChart)
              if (!chart) return null

              return (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">使用方法</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {chart.usage.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">规格参数</h4>
                    <div className="space-y-2">
                      {chart.specifications.map((spec, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{spec.label}</span>
                          <span className="font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    {chart.diyOption && (
                      <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                        <span className="font-medium">DIY选项：</span>
                        <span className="text-muted-foreground ml-1">{chart.diyOption}</span>
                      </div>
                    )}

                    {chart.purchaseUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={e => {
                          e.stopPropagation()
                          window.open(chart.purchaseUrl, '_blank')
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        购买渠道
                      </Button>
                    )}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* 拍摄环境建议 */}
      <Card>
        <CardHeader>
          <CardTitle>通用拍摄建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">光源</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>使用D65标准光源或5500K色温</li>
                <li>照度保持1000-2000 Lux</li>
                <li>确保均匀照明无热点</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">相机设置</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>使用三脚架固定相机</li>
                <li>使用遥控器或定时快门</li>
                <li>关闭机内降噪和锐化</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">文件格式</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>优先使用RAW格式</li>
                <li>使用最低ISO设置</li>
                <li>记录所有拍摄参数</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
