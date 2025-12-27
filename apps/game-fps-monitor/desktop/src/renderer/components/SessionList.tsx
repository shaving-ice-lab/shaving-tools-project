import React from 'react';
import { Play, Trash2, Download, ChevronRight } from 'lucide-react';

interface Session {
  id: string;
  deviceId: string;
  gameName: string;
  startTime: number;
  endTime?: number;
}

interface SessionListProps {
  sessions: Session[];
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onExport: (sessionId: string) => void;
}

export default function SessionList({
  sessions,
  onSelect,
  onDelete,
  onExport,
}: SessionListProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const formatDuration = (start: number, end?: number) => {
    if (!end) return '进行中';
    const duration = Math.floor((end - start) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}分${seconds}秒`;
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-dark-200 rounded-xl p-8 border border-gray-800 text-center">
        <Play className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500">暂无测试记录</p>
        <p className="text-xs text-gray-600 mt-2">
          连接设备并开始测试后，记录将显示在此处
        </p>
      </div>
    );
  }

  return (
    <div className="bg-dark-200 rounded-xl border border-gray-800 overflow-hidden">
      <div className="divide-y divide-gray-800">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 hover:bg-dark-100 transition-colors cursor-pointer"
            onClick={() => onSelect(session.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-medium">{session.gameName}</h4>
                  {!session.endTime && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      进行中
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{session.deviceId}</span>
                  <span>{formatDate(session.startTime)}</span>
                  <span>{formatDuration(session.startTime, session.endTime)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport(session.id);
                  }}
                  className="p-2 hover:bg-dark-300 rounded-lg transition-colors"
                  title="导出"
                >
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
