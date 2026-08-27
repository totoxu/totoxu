import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { getParkById, MarkerType, ParkGeo, ParkId } from '../../data/parkGeo'
import './RegionMap.css'

const MARKER_META: Record<
  MarkerType,
  { color: string; border: string; symbolSize: number; symbol: string; label: string }
> = {
  office: {
    color: '#0c8a74',
    border: '#ffffff',
    symbolSize: 18,
    symbol: 'circle',
    label: '管委会',
  },
  station: {
    color: '#e8853b',
    border: '#ffffff',
    symbolSize: 16,
    symbol: 'diamond',
    label: '交通枢纽',
  },
  port: {
    color: '#3b82e8',
    border: '#ffffff',
    symbolSize: 16,
    symbol: 'triangle',
    label: '港口',
  },
  landmark: {
    color: '#7b6b43',
    border: '#ffffff',
    symbolSize: 15,
    symbol: 'roundRect',
    label: '地标',
  },
}

const makeImageSeries = (image: HTMLImageElement): echarts.SeriesOption => ({
  type: 'custom',
  name: 'base-image',
  silent: true,
  data: [0],
  coordinateSystem: 'cartesian2d',
  renderItem: (params, api) => {
    const topLeft = api.coord([0, 0])
    const bottomRight = api.coord([1, 1])
    return {
      type: 'image',
      style: {
        image,
        x: topLeft[0],
        y: topLeft[1],
        width: bottomRight[0] - topLeft[0],
        height: bottomRight[1] - topLeft[1],
        opacity: 1,
      },
      z: 0,
    }
  },
  tooltip: {
    show: false,
  },
})

const buildOption = (park: ParkGeo, image: HTMLImageElement): echarts.EChartsOption => {
  const boundaryData = [...park.boundaryPolygon, park.boundaryPolygon[0]]

  return {
    animation: false,
    backgroundColor: 'transparent',
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: false,
    },
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      backgroundColor: 'rgba(18, 31, 31, 0.94)',
      borderWidth: 0,
      padding: [12, 14],
      textStyle: {
        color: '#ffffff',
        fontSize: 12,
        lineHeight: 18,
      },
      formatter: (params: any) => {
        const data = params.data
        if (!data || !data.description) return ''
        const meta = MARKER_META[data.markerType as MarkerType]
        return [
          `<div class="map-tooltip-title">${data.name}</div>`,
          `<div class="map-tooltip-type">${meta.label}</div>`,
          `<div class="map-tooltip-desc">${data.description}</div>`,
        ].join('')
      },
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 1,
      show: false,
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      inverse: true,
      show: false,
    },
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none',
        start: park.viewport.xStart,
        end: park.viewport.xEnd,
        minSpan: park.viewport.minSpan,
        maxSpan: park.viewport.maxSpan,
        moveOnMouseMove: true,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: false,
        preventDefaultMouseMove: true,
      },
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none',
        start: park.viewport.yStart,
        end: park.viewport.yEnd,
        minSpan: park.viewport.minSpan,
        maxSpan: park.viewport.maxSpan,
        moveOnMouseMove: true,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: false,
        preventDefaultMouseMove: true,
      },
    ],
    series: [
      makeImageSeries(image),
      {
        type: 'line',
        name: 'boundary',
        coordinateSystem: 'cartesian2d',
        data: boundaryData,
        symbol: 'none',
        smooth: 0.08,
        z: 6,
        lineStyle: {
          color: '#0c8a74',
          width: 3,
          shadowColor: 'rgba(12, 138, 116, 0.28)',
          shadowBlur: 12,
        },
        areaStyle: {
          color: 'rgba(46, 230, 200, 0.18)',
        },
        tooltip: {
          show: false,
        },
      },
      {
        type: 'scatter',
        name: 'labels',
        coordinateSystem: 'cartesian2d',
        data: [
          {
            value: park.labelAnchor,
            symbolSize: 1,
            itemStyle: { color: 'transparent' },
            label: {
              show: true,
              formatter: park.name,
              position: 'top',
              color: '#16302c',
              fontWeight: 700,
              fontSize: 15,
              backgroundColor: 'rgba(255,255,255,0.92)',
              borderColor: 'rgba(12,138,116,0.22)',
              borderWidth: 1,
              borderRadius: 14,
              padding: [7, 12],
              shadowBlur: 12,
              shadowColor: 'rgba(9, 36, 34, 0.12)',
            },
          },
        ],
        tooltip: {
          show: false,
        },
        z: 7,
      },
      {
        type: 'scatter',
        id: 'markers',
        name: 'markers',
        coordinateSystem: 'cartesian2d',
        z: 8,
        data: park.markers.map((marker) => {
          const meta = MARKER_META[marker.type]
          return {
            name: marker.name,
            value: marker.coords,
            markerType: marker.type,
            description: marker.description,
            symbol: meta.symbol,
            symbolSize: meta.symbolSize,
            itemStyle: {
              color: meta.color,
              borderColor: meta.border,
              borderWidth: 2,
              shadowBlur: 14,
              shadowColor: 'rgba(8, 31, 31, 0.18)',
            },
            label: {
              show: true,
              formatter: marker.shortName,
              position: 'right',
              distance: 10,
              color: '#1a2b2b',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: 'rgba(255,255,255,0.94)',
              borderColor: 'rgba(226, 235, 233, 0.92)',
              borderWidth: 1,
              borderRadius: 10,
              padding: [4, 8],
            },
            emphasis: {
              scale: 1.12,
              label: {
                backgroundColor: 'rgba(255,255,255,0.98)',
              },
            },
          }
        }),
      },
    ],
  }
}

const applyViewport = (chart: echarts.ECharts, park: ParkGeo) => {
  chart.dispatchAction({
    type: 'dataZoom',
    dataZoomIndex: 0,
    start: park.viewport.xStart,
    end: park.viewport.xEnd,
  })
  chart.dispatchAction({
    type: 'dataZoom',
    dataZoomIndex: 1,
    start: park.viewport.yStart,
    end: park.viewport.yEnd,
  })
}

const RegionMap: React.FC<{ parkId: ParkId }> = ({ parkId }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const park = useMemo(() => getParkById(parkId), [parkId])
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!park) return

    setImageState('loading')
    setLoadedImage(null)
    chartRef.current?.clear()

    const image = new Image()
    image.decoding = 'async'
    image.src = park.baseImage

    image.onload = () => {
      setLoadedImage(image)
      setImageState('ready')
    }

    image.onerror = () => {
      setImageState('error')
    }

    return () => {
      image.onload = null
      image.onerror = null
    }
  }, [park])

  useEffect(() => {
    if (!park || !loadedImage || !chartContainerRef.current) return

    const chart =
      chartRef.current || echarts.init(chartContainerRef.current, undefined, { renderer: 'canvas' })
    chartRef.current = chart

    chart.setOption(buildOption(park, loadedImage), true)
    applyViewport(chart, park)

    const resizeObserver = new ResizeObserver(() => {
      chart.resize()
    })
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [park, loadedImage])

  useEffect(() => {
    return () => {
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  if (!park) return null

  return (
    <div className="region-map-wrap">
      <div className="region-map-shell">
        <div ref={chartContainerRef} className="region-map-container" />

        {imageState === 'loading' && (
          <div className="map-status map-loading">
            <span className="spinner-ring" />
            正在加载园区底图...
          </div>
        )}

        {imageState === 'error' && (
          <div className="map-status map-error">
            <strong>底图加载失败</strong>
            <span>请检查本地地图资源是否完整，或稍后重新刷新页面</span>
          </div>
        )}

        <div className="map-toolbar">
          <span className="map-mode-tag">ECharts 覆盖层</span>
          <button
            className="map-reset-btn"
            onClick={() => {
              if (chartRef.current) applyViewport(chartRef.current, park)
            }}
          >
            重置视图
          </button>
        </div>

        <div className="map-legend">
          <span className="legend-item">
            <i className="legend-line" /> 园区范围
          </span>
          <span className="legend-item">
            <i className="legend-dot" style={{ background: MARKER_META.office.color }} /> 管委会
          </span>
          <span className="legend-item">
            <i className="legend-dot legend-diamond" style={{ background: MARKER_META.station.color }} /> 交通枢纽
          </span>
          <span className="legend-item">
            <i className="legend-dot legend-triangle" style={{ color: MARKER_META.port.color }} /> 港口/地标
          </span>
        </div>
      </div>

      <div className="map-caption">
        <p className="map-desc">{park.note}</p>
        <p className="map-note">{park.sourceNote}</p>
      </div>
    </div>
  )
}

export default RegionMap
