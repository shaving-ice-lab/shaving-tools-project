import { create } from 'zustand'
import type {
  ImageInfo,
  CameraInfo,
  ToolType,
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

interface CameraStore {
  currentTool: ToolType
  setCurrentTool: (tool: ToolType) => void

  currentImage: ImageInfo | null
  setCurrentImage: (image: ImageInfo | null) => void

  cameraInfo: CameraInfo | null
  setCameraInfo: (info: CameraInfo | null) => void

  testResults: TestResults
  setTestResult: <K extends keyof TestResults>(key: K, result: TestResults[K]) => void
  clearTestResults: () => void

  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void

  progress: number
  setProgress: (progress: number) => void
}

export const useCameraStore = create<CameraStore>(set => ({
  currentTool: 'mtf',
  setCurrentTool: tool => set({ currentTool: tool }),

  currentImage: null,
  setCurrentImage: image => set({ currentImage: image }),

  cameraInfo: null,
  setCameraInfo: info => set({ cameraInfo: info }),

  testResults: {},
  setTestResult: (key, result) =>
    set(state => ({
      testResults: { ...state.testResults, [key]: result },
    })),
  clearTestResults: () => set({ testResults: {} }),

  isProcessing: false,
  setIsProcessing: processing => set({ isProcessing: processing }),

  progress: 0,
  setProgress: progress => set({ progress }),
}))
