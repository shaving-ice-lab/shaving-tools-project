import type {
  CameraInfo,
  ReportTemplate,
  MTFMeasurement,
  ColorAccuracyResult,
  DynamicRangeResult,
  NoiseAnalysis,
  DistortionResult,
  VignettingResult,
  WhiteBalanceResult,
  AutoFocusResult,
  VideoSpecResult,
} from '@/types'

interface TestResults {
  mtf?: MTFMeasurement[]
  color?: ColorAccuracyResult
  dynamicRange?: DynamicRangeResult
  noise?: NoiseAnalysis
  distortion?: DistortionResult
  vignetting?: VignettingResult
  whiteBalance?: WhiteBalanceResult
  autoFocus?: AutoFocusResult
  video?: VideoSpecResult
}

// 计算综合评分
export function calculateOverallScore(results: TestResults): {
  overall: number
  categories: { name: string; score: number; weight: number }[]
} {
  const categories: { name: string; score: number; weight: number }[] = []

  // MTF/锐度评分 (权重: 20%)
  if (results.mtf && results.mtf.length > 0) {
    const avgMtf50 = results.mtf.reduce((sum, m) => sum + m.metrics.mtf50, 0) / results.mtf.length
    const score = Math.min(100, avgMtf50 * 2) // 假设MTF50=50为满分
    categories.push({ name: '解析力', score, weight: 0.2 })
  }

  // 色彩准确度评分 (权重: 15%)
  if (results.color) {
    const score = Math.max(0, 100 - results.color.averageDeltaE * 10)
    categories.push({ name: '色彩准确度', score, weight: 0.15 })
  }

  // 动态范围评分 (权重: 15%)
  if (results.dynamicRange) {
    const score = Math.min(100, results.dynamicRange.totalRange * 7) // 14EV为满分
    categories.push({ name: '动态范围', score, weight: 0.15 })
  }

  // 噪点控制评分 (权重: 15%)
  if (results.noise) {
    const maxISO = results.noise.maxUsableISO
    const score = Math.min(100, Math.log2(maxISO / 100) * 15) // ISO 6400+ 为高分
    categories.push({ name: '噪点控制', score, weight: 0.15 })
  }

  // 畸变控制评分 (权重: 10%)
  if (results.distortion) {
    const score = Math.max(0, 100 - Math.abs(results.distortion.maxDistortion) * 20)
    categories.push({ name: '畸变控制', score, weight: 0.1 })
  }

  // 暗角控制评分 (权重: 5%)
  if (results.vignetting) {
    const score = results.vignetting.uniformityScore
    categories.push({ name: '暗角控制', score, weight: 0.05 })
  }

  // 白平衡准确度评分 (权重: 5%)
  if (results.whiteBalance) {
    const score = Math.max(0, 100 - Math.abs(results.whiteBalance.tempDeviation) / 50)
    categories.push({ name: '白平衡', score, weight: 0.05 })
  }

  // 对焦性能评分 (权重: 10%)
  if (results.autoFocus) {
    const speedScore = Math.max(0, 100 - results.autoFocus.focusTime / 10)
    const hitScore = results.autoFocus.hitRate
    const score = (speedScore + hitScore) / 2
    categories.push({ name: '对焦性能', score, weight: 0.1 })
  }

  // 视频能力评分 (权重: 5%)
  if (results.video) {
    let score = 50
    if (results.video.resolution.horizontal >= 3840) score += 30
    if (results.video.frameRateStability < 1) score += 20
    categories.push({ name: '视频能力', score: Math.min(100, score), weight: 0.05 })
  }

  // 计算加权总分
  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
  const overall = totalWeight > 0 ? categories.reduce((sum, c) => sum + c.score * c.weight, 0) / totalWeight : 0

  return { overall, categories }
}

// 生成报告数据
export function generateReportData(camera: CameraInfo, results: TestResults, tester: string = '未知'): ReportTemplate {
  const scores = calculateOverallScore(results)

  const sections: ReportTemplate['sections'] = []

  // 概要评分
  sections.push({
    title: '综合评分',
    type: 'chart',
    content: {
      type: 'radar',
      data: scores.categories.map(c => ({
        category: c.name,
        score: Math.round(c.score),
      })),
      overall: Math.round(scores.overall),
    },
  })

  // MTF结果
  if (results.mtf && results.mtf.length > 0) {
    sections.push({
      title: 'MTF曲线分析',
      type: 'table',
      content: {
        headers: ['位置', 'MTF50', 'MTF30', '中心锐度', '边缘锐度'],
        rows: results.mtf.map(m => [
          m.position === 'center' ? '中心' : m.position === 'edge' ? '边缘' : '角落',
          `${m.metrics.mtf50.toFixed(1)} lp/mm`,
          `${m.metrics.mtf30.toFixed(1)} lp/mm`,
          `${m.metrics.centerSharpness.toFixed(0)}%`,
          `${m.metrics.edgeSharpness.toFixed(0)}%`,
        ]),
      },
    })
  }

  // 色彩准确度结果
  if (results.color) {
    sections.push({
      title: '色彩准确度',
      type: 'table',
      content: {
        summary: {
          averageDeltaE: results.color.averageDeltaE.toFixed(2),
          maxDeltaE: results.color.maxDeltaE.toFixed(2),
          rating: results.color.averageDeltaE < 3 ? '优秀' : results.color.averageDeltaE < 5 ? '良好' : '一般',
        },
      },
    })
  }

  // 动态范围结果
  if (results.dynamicRange) {
    sections.push({
      title: '动态范围',
      type: 'text',
      content: {
        totalRange: `${results.dynamicRange.totalRange.toFixed(1)} EV`,
        highlightHeadroom: `${results.dynamicRange.highlightHeadroom.toFixed(1)} EV`,
        shadowRange: `${results.dynamicRange.shadowRange.toFixed(1)} EV`,
      },
    })
  }

  // 噪点分析结果
  if (results.noise) {
    sections.push({
      title: '噪点分析',
      type: 'chart',
      content: {
        type: 'line',
        data: results.noise.results.map(r => ({
          iso: r.iso,
          luminanceNoise: r.luminanceNoise,
          chromaNoise: r.chromaNoise,
          snr: r.snr,
        })),
        maxUsableISO: results.noise.maxUsableISO,
      },
    })
  }

  return {
    title: `${camera.make} ${camera.model} 相机评测报告`,
    camera,
    testDate: new Date(),
    tester,
    sections,
  }
}

// 导出为JSON
export function exportToJSON(report: ReportTemplate): string {
  return JSON.stringify(report, null, 2)
}

// 导出为CSV
export function exportToCSV(results: TestResults): string {
  const lines: string[] = []

  // MTF数据
  if (results.mtf) {
    lines.push('MTF分析结果')
    lines.push('位置,MTF50,MTF30,MTF10,中心锐度,边缘锐度')
    for (const m of results.mtf) {
      lines.push([m.position, m.metrics.mtf50, m.metrics.mtf30, m.metrics.mtf10, m.metrics.centerSharpness, m.metrics.edgeSharpness].join(','))
    }
    lines.push('')
  }

  // 色彩准确度数据
  if (results.color) {
    lines.push('色彩准确度结果')
    lines.push('色块,参考L,参考a,参考b,测量L,测量a,测量b,DeltaE')
    for (const patch of results.color.patches) {
      lines.push(
        [
          patch.name,
          patch.reference.l,
          patch.reference.a,
          patch.reference.b,
          patch.measured.l,
          patch.measured.a,
          patch.measured.b,
          patch.deltaE.toFixed(2),
        ].join(',')
      )
    }
    lines.push(`平均DeltaE,${results.color.averageDeltaE.toFixed(2)}`)
    lines.push(`最大DeltaE,${results.color.maxDeltaE.toFixed(2)}`)
    lines.push('')
  }

  // 噪点数据
  if (results.noise) {
    lines.push('噪点分析结果')
    lines.push('ISO,亮度噪点,色度噪点,信噪比(dB)')
    for (const r of results.noise.results) {
      lines.push([r.iso, r.luminanceNoise.toFixed(2), r.chromaNoise.toFixed(2), r.snr.toFixed(1)].join(','))
    }
    lines.push(`可用ISO上限,${results.noise.maxUsableISO}`)
    lines.push('')
  }

  return lines.join('\n')
}

// 生成HTML报告
export function exportToHTML(report: ReportTemplate): string {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; padding: 40px; background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; border-radius: 16px; }
    .header h1 { font-size: 2rem; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .meta-item { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .meta-item label { font-size: 0.875rem; color: #64748b; display: block; margin-bottom: 4px; }
    .meta-item span { font-size: 1.125rem; font-weight: 600; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section h2 { font-size: 1.25rem; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 20px; }
    .score-circle .value { font-size: 2.5rem; font-weight: bold; }
    .score-circle .label { font-size: 0.875rem; opacity: 0.9; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${report.title}</h1>
      <p>专业相机性能评测报告</p>
    </div>
    
    <div class="meta">
      <div class="meta-item">
        <label>相机型号</label>
        <span>${report.camera.make} ${report.camera.model}</span>
      </div>
      <div class="meta-item">
        <label>镜头</label>
        <span>${report.camera.lens || '未知'}</span>
      </div>
      <div class="meta-item">
        <label>测试日期</label>
        <span>${report.testDate.toLocaleDateString('zh-CN')}</span>
      </div>
      <div class="meta-item">
        <label>测试人员</label>
        <span>${report.tester}</span>
      </div>
    </div>
    
    ${report.sections
      .map(
        section => `
      <div class="section">
        <h2>${section.title}</h2>
        ${renderSectionContent(section)}
      </div>
    `
      )
      .join('')}
    
    <div class="footer">
      <p>报告由相机评测工具套件自动生成 | ${new Date().toLocaleString('zh-CN')}</p>
    </div>
  </div>
</body>
</html>
`
  return html
}

function renderSectionContent(section: ReportTemplate['sections'][0]): string {
  const content = section.content as Record<string, unknown>

  if (section.type === 'chart' && content.type === 'radar') {
    const data = content.data as { category: string; score: number }[]
    const overall = content.overall as number
    return `
      <div class="score-circle">
        <span class="value">${overall}</span>
        <span class="label">综合评分</span>
      </div>
      <table>
        <thead><tr><th>评测项目</th><th>得分</th></tr></thead>
        <tbody>
          ${data.map(d => `<tr><td>${d.category}</td><td>${d.score}分</td></tr>`).join('')}
        </tbody>
      </table>
    `
  }

  if (section.type === 'table' && content.headers) {
    const headers = content.headers as string[]
    const rows = content.rows as string[][]
    return `
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    `
  }

  if (section.type === 'text') {
    return `<pre>${JSON.stringify(content, null, 2)}</pre>`
  }

  return '<p>无法渲染此内容</p>'
}
