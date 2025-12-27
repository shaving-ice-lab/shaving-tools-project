'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, Search, Cpu, CircuitBoard, MemoryStick, Sparkles } from 'lucide-react'
import { chipDatabase, searchChips, getManufacturers, getChipsByManufacturer } from '@/lib/chip-database'
import { ChipDatabaseEntry } from '@/lib/types'
import { formatFrequency } from '@/lib/utils'

export function ChipDatabase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null)
  const [selectedChip, setSelectedChip] = useState<ChipDatabaseEntry | null>(null)

  const manufacturers = getManufacturers()
  
  const filteredChips = searchQuery 
    ? searchChips(searchQuery)
    : selectedManufacturer 
      ? getChipsByManufacturer(selectedManufacturer)
      : chipDatabase

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Search and Filter */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-cyan-400" />
            芯片数据库
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索芯片..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedManufacturer(null)
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Manufacturer Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedManufacturer === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedManufacturer(null)
                setSearchQuery('')
              }}
            >
              全部
            </Button>
            {manufacturers.map(mfr => (
              <Button
                key={mfr}
                variant={selectedManufacturer === mfr ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedManufacturer(mfr)
                  setSearchQuery('')
                }}
              >
                {mfr}
              </Button>
            ))}
          </div>

          {/* Chip List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredChips.map(chip => (
              <div
                key={chip.id}
                onClick={() => setSelectedChip(chip)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selectedChip?.id === chip.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">{chip.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {chip.process}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500">{chip.manufacturer}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chip Details */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {selectedChip ? selectedChip.name : '选择一个芯片查看详情'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedChip ? (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-xs text-slate-400">制造商</div>
                  <div className="text-sm font-medium text-slate-200">{selectedChip.manufacturer}</div>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-xs text-slate-400">制程工艺</div>
                  <div className="text-sm font-medium text-slate-200">{selectedChip.process}</div>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-xs text-slate-400">发布时间</div>
                  <div className="text-sm font-medium text-slate-200">{selectedChip.release_date}</div>
                </div>
              </div>

              {/* CPU Info */}
              <div className="rounded-lg border border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">CPU 配置</span>
                  <Badge variant="secondary">{selectedChip.cpu_config}</Badge>
                </div>
                <div className="space-y-2">
                  {selectedChip.cpu_cores.map((core, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={core.type === 'prime' ? 'prime' : core.type === 'big' ? 'big' : core.type === 'middle' ? 'middle' : 'little'}
                        >
                          {core.type} × {core.count}
                        </Badge>
                        <span className="text-slate-400">{core.arch}</span>
                      </div>
                      <span className="text-slate-300">{formatFrequency(core.max_freq)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPU & NPU */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CircuitBoard className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-slate-200">GPU</span>
                  </div>
                  <div className="text-sm text-slate-300">{selectedChip.gpu_name}</div>
                  <div className="text-xs text-slate-500">{formatFrequency(selectedChip.gpu_freq)}</div>
                </div>
                {selectedChip.npu_tops && (
                  <div className="rounded-lg border border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-slate-200">NPU</span>
                    </div>
                    <div className="text-sm text-slate-300">{selectedChip.npu_tops} TOPS</div>
                  </div>
                )}
              </div>

              {/* Memory */}
              <div className="rounded-lg border border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MemoryStick className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-200">内存支持</span>
                </div>
                <div className="text-sm text-slate-300">
                  {selectedChip.memory_type} @ {selectedChip.memory_bandwidth}
                </div>
              </div>

              {/* Benchmark Reference */}
              {selectedChip.benchmark_reference && (
                <div className="rounded-lg border border-slate-700 p-4">
                  <div className="text-sm font-medium text-slate-200 mb-3">参考跑分</div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-slate-400">单核</div>
                      <div className="text-lg font-bold text-blue-400">
                        {selectedChip.benchmark_reference.single_core}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">多核</div>
                      <div className="text-lg font-bold text-blue-400">
                        {selectedChip.benchmark_reference.multi_core}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">GPU</div>
                      <div className="text-lg font-bold text-purple-400">
                        {selectedChip.benchmark_reference.gpu}
                      </div>
                    </div>
                    {selectedChip.benchmark_reference.ai && (
                      <div>
                        <div className="text-xs text-slate-400">AI</div>
                        <div className="text-lg font-bold text-yellow-400">
                          {selectedChip.benchmark_reference.ai}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-60 items-center justify-center text-slate-500">
              从左侧列表选择一个芯片查看详细信息
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
