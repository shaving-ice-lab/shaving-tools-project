'use client'

import { useState } from 'react'
import {
  HelpCircle,
  Camera,
  Palette,
  Sun,
  Scan,
  Grid3X3,
  Circle,
  Thermometer,
  Focus,
  Video,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface HelpSection {
  id: string
  title: string
  icon: React.ElementType
  description: string
  steps: string[]
  tips: string[]
  testChart?: string
}

const helpSections: HelpSection[] = [
  {
    id: 'mtf',
    title: 'MTF曲线测试',
    icon: Camera,
    description: 'MTF (调制传递函数) 是衡量镜头解析力的核心指标，通过分析斜边测试图获取镜头在不同空间频率下的对比度传递能力。',
    steps: [
      '使用三脚架拍摄ISO 12233测试图',
      '确保测试图填满画面且对焦准确',
      '上传拍摄的测试图像',
      '选择需要分析的ROI区域（中心/边缘/角落）',
      '点击分析按钮获取MTF曲线',
    ],
    tips: ['MTF50 > 40 lp/mm 为优秀解析力', '中心与边缘差异小于20%为均匀性良好', '建议在最佳光圈(通常f/5.6-f/8)下测试'],
    testChart: 'ISO 12233 解析力测试图',
  },
  {
    id: 'color',
    title: '色彩准确度测试',
    icon: Palette,
    description: '使用标准24色卡(ColorChecker)评估相机的色彩还原能力，计算实际拍摄色彩与标准值的偏差(ΔE)。',
    steps: [
      '在标准光源(D65/5500K)下拍摄X-Rite ColorChecker',
      '确保色卡均匀受光，无反光',
      '上传色卡图像',
      '系统自动识别24个色块位置',
      '查看各色块ΔE值和整体评分',
    ],
    tips: ['平均ΔE < 3 为优秀色彩准确度', '单个色块ΔE < 5 为可接受', '关注肤色和常见色相的准确度'],
    testChart: 'X-Rite ColorChecker 24色卡',
  },
  {
    id: 'dynamic-range',
    title: '动态范围测试',
    icon: Sun,
    description: '测量相机从最亮到最暗能够记录的光线范围，评估高光保留和暗部细节能力。',
    steps: ['拍摄Stouffer灰阶测试图', '使用RAW格式获得最佳结果', '上传灰阶图像', '系统分析各灰阶的亮度和噪点', '获取总动态范围(EV)评估'],
    tips: ['现代全画幅相机动态范围通常在12-15 EV', '高光余量比暗部提升更重要', '高ISO下动态范围会明显下降'],
    testChart: 'Stouffer T4110 21级灰阶',
  },
  {
    id: 'noise',
    title: '噪点分析',
    icon: Scan,
    description: '评估不同ISO设置下的图像噪点水平，包括亮度噪点和色彩噪点的分离分析。',
    steps: ['在各ISO档位拍摄均匀灰色区域', '确保正确曝光', '依次上传不同ISO的图像', '输入对应的ISO值', '查看噪点曲线和可用ISO上限'],
    tips: ['SNR > 30dB 通常为可接受噪点水平', '色度噪点比亮度噪点更难后期处理', '关注画面边缘噪点是否明显增加'],
    testChart: '18%灰卡或均匀灰色墙面',
  },
  {
    id: 'distortion',
    title: '畸变测试',
    icon: Grid3X3,
    description: '测量镜头的几何畸变，包括桶形畸变、枕形畸变和复杂畸变。',
    steps: ['拍摄标准网格测试图', '确保相机与测试图平面平行', '上传网格图像', '系统检测网格交点位置', '计算畸变系数和类型'],
    tips: ['广角镜头桶形畸变 < 3% 为良好', '长焦镜头枕形畸变 < 2% 为良好', '软件校正后注意边缘画质损失'],
    testChart: '标准方格网格图',
  },
  {
    id: 'vignetting',
    title: '暗角测试',
    icon: Circle,
    description: '测量镜头边缘相对于中心的光量衰减程度。',
    steps: ['拍摄均匀光源(如白墙或灯箱)', '使用最大光圈', '上传均匀光源图像', '查看亮度分布热力图', '获取角落和边缘亮度衰减值'],
    tips: ['角落衰减 < 1 EV 为良好', '收缩光圈2档通常可消除大部分暗角', '后期暗角校正会增加边缘噪点'],
    testChart: '均匀白色光源或灰卡',
  },
  {
    id: 'white-balance',
    title: '白平衡测试',
    icon: Thermometer,
    description: '评估相机在不同光源下的自动白平衡准确性。',
    steps: ['在已知色温光源下拍摄18%灰卡', '使用自动白平衡模式', '上传灰卡图像并输入参考色温', '查看色温偏差和Tint偏移', '测试各种光源下的表现'],
    tips: ['色温偏差 < 200K 为优秀', '绿-品红偏移需特别关注', '混合光源下AWB表现更能体现实力'],
    testChart: '18%灰卡',
  },
  {
    id: 'autofocus',
    title: '对焦性能测试',
    icon: Focus,
    description: '评估自动对焦系统的速度、精度和追焦能力。',
    steps: ['设置对焦目标(高对比度目标最佳)', '使用秒表或视频录制测量', '记录从失焦到合焦的时间', '重复测试获取统计数据', '在不同光线条件下测试'],
    tips: ['单次对焦 < 300ms 为快速', '命中率 > 95% 为可靠', '低光对焦能力差异很大'],
    testChart: '高对比度对焦目标',
  },
  {
    id: 'video',
    title: '视频规格测试',
    icon: Video,
    description: '专门针对视频模式的各项参数测试和记录。',
    steps: ['查阅相机规格表', '逐项记录支持的视频模式', '实际录制验证各项参数', '测试果冻效应和热停机', '记录防抖和自动对焦表现'],
    tips: ['4K 60fps 为当前主流高端标准', '关注裁切系数对构图的影响', '实际码率和标称可能有差异'],
    testChart: '视频测试卡',
  },
]

export function HelpGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          使用指南
        </h2>
        <p className="text-muted-foreground mt-1">专业相机评测工具使用说明与最佳实践</p>
      </div>

      {/* 快速入门 */}
      <Card>
        <CardHeader>
          <CardTitle>快速入门</CardTitle>
          <CardDescription>开始使用相机评测工具的基本步骤</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>设置相机信息</strong> - 在设置页面输入被测相机和镜头信息
            </li>
            <li>
              <strong>准备测试环境</strong> - 使用标准光源、三脚架和对应的测试图
            </li>
            <li>
              <strong>拍摄测试图像</strong> - 按各工具要求拍摄高质量测试图像
            </li>
            <li>
              <strong>上传并分析</strong> - 将图像上传到对应工具进行分析
            </li>
            <li>
              <strong>查看报告</strong> - 在评测报告页面查看综合评分并导出
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* 测试环境建议 */}
      <Card>
        <CardHeader>
          <CardTitle>测试环境建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">光源要求</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>D65标准光源或5500K色温灯</li>
                <li>照度1000-2000 Lux均匀照明</li>
                <li>避免混合光源</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">拍摄设置</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>使用三脚架固定相机</li>
                <li>手动对焦至最佳锐度</li>
                <li>使用RAW格式拍摄</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 各工具详细说明 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">各工具详细说明</h3>
        {helpSections.map(section => {
          const Icon = section.icon
          const isExpanded = expandedSection === section.id

          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{section.title}</span>
                </div>
                {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <CardContent className="pt-0 border-t">
                  <p className="text-sm text-muted-foreground mb-4">{section.description}</p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">操作步骤</h4>
                      <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                        {section.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">专业提示</h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                        {section.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {section.testChart && (
                    <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                      <span className="font-medium">推荐测试图：</span>
                      <span className="text-muted-foreground ml-2">{section.testChart}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* 参考标准 */}
      <Card>
        <CardHeader>
          <CardTitle>参考标准</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• ISO 12233:2017 - 电子静态图像相机分辨率测量</li>
            <li>• ISO 14524:2009 - 光电转换函数测量方法</li>
            <li>• ISO 17321:2012 - 色彩特性化标准</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
