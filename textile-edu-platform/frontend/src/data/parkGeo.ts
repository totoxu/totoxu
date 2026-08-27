import htzBaseImage from '../assets/maps/htz-base.svg'
import kfqBaseImage from '../assets/maps/kfq-base.svg'

// ============================================
// 园区地图数据
// 现行渲染以本地静态底图上的归一化坐标为准
// legacyGeo 仅保留作资料参考
// ============================================

export type ParkId = 'htz' | 'kfq'
export type MarkerType = 'office' | 'port' | 'station' | 'landmark'
export type NormalizedPoint = [number, number]

export interface ParkMarker {
  name: string
  shortName: string
  coords: NormalizedPoint
  type: MarkerType
  description: string
}

export interface ParkLegacyGeo {
  center: [number, number]
  boundary: [number, number][]
  markers: { name: string; coords: [number, number]; type: MarkerType }[]
}

export interface ParkGeo {
  id: ParkId
  name: string
  note: string
  sourceNote: string
  baseImage: string
  imageSize: {
    width: number
    height: number
  }
  viewport: {
    xStart: number
    xEnd: number
    yStart: number
    yEnd: number
    minSpan: number
    maxSpan: number
  }
  boundaryPolygon: NormalizedPoint[]
  labelAnchor: NormalizedPoint
  markers: ParkMarker[]
  legacyGeo: ParkLegacyGeo
}

export const parks: ParkGeo[] = [
  {
    id: 'htz',
    name: '南通高新技术产业开发区',
    note: '位于南通市通州区，是南通先进装备制造、纺织服装与科创资源协同集聚的重要园区。',
    sourceNote: '底图为本地静态区位示意资源，边界与点位为项目演示用归一化标注。',
    baseImage: htzBaseImage,
    imageSize: {
      width: 1600,
      height: 1200,
    },
    viewport: {
      xStart: 8,
      xEnd: 96,
      yStart: 8,
      yEnd: 94,
      minSpan: 18,
      maxSpan: 100,
    },
    boundaryPolygon: [
      [0.645, 0.392],
      [0.804, 0.375],
      [0.865, 0.456],
      [0.834, 0.585],
      [0.708, 0.632],
      [0.636, 0.553],
      [0.622, 0.466],
    ],
    labelAnchor: [0.738, 0.434],
    markers: [
      {
        name: '高新区管委会',
        shortName: '管委会',
        coords: [0.742, 0.49],
        type: 'office',
        description: '园区综合服务与产业统筹管理核心节点。',
      },
      {
        name: '南通兴东国际机场',
        shortName: '兴东机场',
        coords: [0.83, 0.205],
        type: 'station',
        description: '面向航空物流与商务出行的重要交通枢纽。',
      },
      {
        name: '南通西站',
        shortName: '南通西站',
        coords: [0.63, 0.856],
        type: 'station',
        description: '承接高铁出行与区域快速联通的重要门户。',
      },
    ],
    legacyGeo: {
      center: [121.0451, 32.039],
      boundary: [
        [120.988, 32.076],
        [121.062, 32.080],
        [121.112, 32.062],
        [121.126, 32.038],
        [121.118, 32.014],
        [121.086, 32.0],
        [121.045, 31.996],
        [121.002, 32.002],
        [120.984, 32.02],
        [120.985, 32.048],
      ],
      markers: [
        { name: '高新区管委会', coords: [121.075, 32.052], type: 'office' },
        { name: '南通兴东国际机场', coords: [120.98, 32.08], type: 'station' },
        { name: '南通西站（高铁）', coords: [120.885, 32.008], type: 'station' },
      ],
    },
  },
  {
    id: 'kfq',
    name: '南通经济技术开发区',
    note: '位于长江北岸与主城东南发展带交汇区域，是南通电子信息、医药健康与精密机械的重要承载区。',
    sourceNote: '底图为本地静态区位示意资源，边界与点位为项目演示用归一化标注。',
    baseImage: kfqBaseImage,
    imageSize: {
      width: 1600,
      height: 1200,
    },
    viewport: {
      xStart: 7,
      xEnd: 95,
      yStart: 10,
      yEnd: 96,
      minSpan: 18,
      maxSpan: 100,
    },
    boundaryPolygon: [
      [0.576, 0.392],
      [0.76, 0.374],
      [0.821, 0.458],
      [0.788, 0.592],
      [0.655, 0.626],
      [0.572, 0.541],
      [0.56, 0.46],
    ],
    labelAnchor: [0.681, 0.438],
    markers: [
      {
        name: '经开区管委会',
        shortName: '管委会',
        coords: [0.678, 0.49],
        type: 'office',
        description: '园区招商、服务与统筹调度的核心管理节点。',
      },
      {
        name: '狼山风景区',
        shortName: '狼山',
        coords: [0.228, 0.782],
        type: 'landmark',
        description: '园区西南侧代表性城市地标，可用于区位识别。',
      },
      {
        name: '南通港滨江片区',
        shortName: '南通港',
        coords: [0.318, 0.89],
        type: 'port',
        description: '沿江港口与物流联运节点，体现园区临江优势。',
      },
    ],
    legacyGeo: {
      center: [120.945, 31.925],
      boundary: [
        [120.9, 31.965],
        [120.96, 31.972],
        [121.0, 31.96],
        [121.018, 31.942],
        [121.012, 31.918],
        [120.988, 31.902],
        [120.945, 31.895],
        [120.908, 31.905],
        [120.888, 31.922],
        [120.885, 31.945],
      ],
      markers: [
        { name: '经开区管委会', coords: [120.94, 31.93], type: 'office' },
        { name: '狼山风景区', coords: [120.905, 31.908], type: 'landmark' },
        { name: '南通港（滨江）', coords: [120.895, 31.938], type: 'port' },
      ],
    },
  },
]

export const getParkById = (parkId: ParkId) => parks.find((park) => park.id === parkId)
