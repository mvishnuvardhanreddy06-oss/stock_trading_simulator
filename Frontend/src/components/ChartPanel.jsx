import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Camera, Crosshair, Maximize2, Minus, Plus, Ruler, Star, TrendingUp } from "lucide-react";
import { ColorType, CrosshairMode, LineStyle, createChart } from "lightweight-charts";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});

const TIMEFRAMES = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y", "MAX"];
const INDICATORS = ["SMA", "EMA", "RSI", "MACD", "Bollinger", "VWAP", "Volume Profile"];
const DRAWING_TOOLS = ["Trend", "Support", "Fibonacci"];

function toTimestamp(value, index) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
  if (typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return Math.floor(numeric);
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return Math.floor(parsed.getTime() / 1000);
  }
  return Math.floor(Date.now() / 1000) - (48 - index) * 1800;
}

function buildCandles(stock) {
  const history = Array.isArray(stock?.history) ? stock.history.slice(-80) : [];
  const source = history.length ? history : [{ price: stock?.price || 0, at: new Date() }];

  return source
    .map((point, index) => {
      const previous = source[index - 1]?.price ?? stock?.previousClose ?? point.price ?? stock?.price ?? 0;
      const close = Number(point.close ?? point.price ?? stock?.price ?? previous);
      const open = Number(point.open ?? previous);
      const spread = Math.max(Math.abs(close - open), close * 0.002, 0.08);
      const high = Number(point.high ?? Math.max(open, close) + spread * (0.55 + (index % 4) * 0.12));
      const low = Number(point.low ?? Math.max(0, Math.min(open, close) - spread * (0.55 + (index % 3) * 0.11)));
      const volume = Number(point.volume ?? stock?.volume ?? 850000 + index * 27500);

      return {
        time: toTimestamp(point.time ?? point.date ?? point.at, index),
        open,
        high,
        low,
        close,
        volume
      };
    })
    .sort((a, b) => a.time - b.time)
    .filter((point, index, array) => index === 0 || point.time !== array[index - 1].time);
}

function movingAverage(candles, period) {
  return candles
    .map((candle, index) => {
      if (index < period - 1) return null;
      const window = candles.slice(index - period + 1, index + 1);
      const value = window.reduce((sum, item) => sum + item.close, 0) / period;
      return { time: candle.time, value };
    })
    .filter(Boolean);
}

function exponentialAverage(candles, period) {
  const multiplier = 2 / (period + 1);
  let previous;
  return candles
    .map((candle, index) => {
      previous = index === 0 ? candle.close : candle.close * multiplier + previous * (1 - multiplier);
      if (index < period - 1) return null;
      return { time: candle.time, value: previous };
    })
    .filter(Boolean);
}

function bollingerBands(candles, period = 20) {
  const upper = [];
  const lower = [];

  candles.forEach((candle, index) => {
    if (index < period - 1) return;
    const window = candles.slice(index - period + 1, index + 1);
    const average = window.reduce((sum, item) => sum + item.close, 0) / period;
    const variance = window.reduce((sum, item) => sum + (item.close - average) ** 2, 0) / period;
    const deviation = Math.sqrt(variance);
    upper.push({ time: candle.time, value: average + deviation * 2 });
    lower.push({ time: candle.time, value: Math.max(0, average - deviation * 2) });
  });

  return { upper, lower };
}

function vwap(candles) {
  let priceVolume = 0;
  let totalVolume = 0;
  return candles.map((candle) => {
    const typical = (candle.high + candle.low + candle.close) / 3;
    priceVolume += typical * candle.volume;
    totalVolume += candle.volume;
    return { time: candle.time, value: priceVolume / Math.max(totalVolume, 1) };
  });
}

function ChartPanel({ stock }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const indicatorSeriesRef = useRef([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeframe, setTimeframe] = useState("1D");
  const [activeIndicators, setActiveIndicators] = useState(["SMA", "EMA"]);
  const [activeTool, setActiveTool] = useState("Trend");
  const [tooltip, setTooltip] = useState(null);

  const candles = useMemo(() => buildCandles(stock), [stock]);
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2] || latest;
  const priceChange = latest && previous ? latest.close - previous.close : 0;
  const percentChange = previous?.close ? (priceChange / previous.close) * 100 : 0;
  const dailyHigh = stock?.high || Math.max(...candles.map((candle) => candle.high), stock?.price || 0);
  const dailyLow = stock?.low || Math.min(...candles.map((candle) => candle.low), stock?.price || 0);
  const totalVolume = stock?.volume || candles.reduce((sum, candle) => sum + candle.volume, 0);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 620,
      layout: {
        background: { type: ColorType.Solid, color: "#0A0F1F" },
        textColor: "#A8B3C7",
        fontFamily: "Inter, Segoe UI, sans-serif"
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.1)" }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(125, 211, 252, 0.45)", width: 1, style: LineStyle.Dashed },
        horzLine: { color: "rgba(125, 211, 252, 0.45)", width: 1, style: LineStyle.Dashed }
      },
      rightPriceScale: {
        borderColor: "rgba(148, 163, 184, 0.16)",
        scaleMargins: { top: 0.06, bottom: 0.18 }
      },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.16)",
        timeVisible: true,
        secondsVisible: false
      },
      handleScroll: true,
      handleScale: true
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#00C076",
      downColor: "#F6465D",
      borderVisible: false,
      priceScaleId: "right",
      wickUpColor: "#00C076",
      wickDownColor: "#F6465D",
      priceLineColor: "#F8FAFC",
      priceLineWidth: 1,
      priceLineStyle: LineStyle.Dashed,
      lastValueVisible: true,
      priceLineVisible: true
    });

    const volumeSeries = chart.addHistogramSeries({
      color: "rgba(59, 130, 246, 0.42)",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false
    });

    chart.priceScale("right").applyOptions({
      borderColor: "rgba(148, 163, 184, 0.16)",
      scaleMargins: { top: 0.06, bottom: 0.18 }
    });

    chart.priceScale("volume").applyOptions({
      borderVisible: false,
      scaleMargins: { top: 0.82, bottom: 0 }
    });

    chart.subscribeCrosshairMove((param) => {
      if (!param?.time || !param.seriesData?.get(candleSeries)) {
        setTooltip(null);
        return;
      }

      const value = param.seriesData.get(candleSeries);
      setTooltip({
        x: Math.min(Math.max(param.point?.x || 0, 12), (containerRef.current?.clientWidth || 0) - 190),
        y: Math.min(Math.max(param.point?.y || 0, 12), 180),
        ...value
      });
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const resize = () => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 620
      });
      chartRef.current.timeScale().fitContent();
    };

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current || !candleSeriesRef.current || !volumeSeriesRef.current) return;

    const volume = candles.map((candle) => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open ? "rgba(0, 192, 118, 0.34)" : "rgba(246, 70, 93, 0.34)"
    }));

    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(volume);

    // Safely remove any existing indicator series — guard against undefined entries
    if (Array.isArray(indicatorSeriesRef.current) && chartRef.current?.removeSeries) {
      indicatorSeriesRef.current.forEach((series) => {
        if (!series) return;
        try {
          chartRef.current.removeSeries(series);
        } catch (err) {
          // Non-fatal: log and continue
          // eslint-disable-next-line no-console
          console.warn("Failed to remove series:", err);
        }
      });
    }
    indicatorSeriesRef.current = [];

    const addLine = (data, color, title, width = 1) => {
      if (!data.length) return;
      const series = chartRef.current.addLineSeries({
        color,
        lineWidth: width,
        priceScaleId: "right",
        priceLineVisible: false,
        lastValueVisible: false,
        title: ""
      });
      series.setData(data);
      indicatorSeriesRef.current.push(series);
    };

    if (activeIndicators.includes("SMA")) addLine(movingAverage(candles, 10), "#F59E0B", "SMA 10", 2);
    if (activeIndicators.includes("EMA")) addLine(exponentialAverage(candles, 12), "#38BDF8", "EMA 12", 2);
    if (activeIndicators.includes("VWAP")) addLine(vwap(candles), "#A78BFA", "VWAP", 2);
    if (activeIndicators.includes("Bollinger")) {
      const bands = bollingerBands(candles, 20);
      addLine(bands.upper, "rgba(251, 113, 133, 0.78)", "BB Upper");
      addLine(bands.lower, "rgba(251, 113, 133, 0.78)", "BB Lower");
    }

    chartRef.current.timeScale().fitContent();
  }, [candles, activeIndicators, timeframe]);

  useEffect(() => {
    setTimeout(() => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 620
      });
      chartRef.current.timeScale().fitContent();
    }, 60);
  }, [isFullscreen]);

  function toggleIndicator(indicator) {
    setActiveIndicators((current) =>
      current.includes(indicator) ? current.filter((item) => item !== indicator) : [...current, indicator]
    );
  }

  function zoom(direction) {
    const timeScale = chartRef.current?.timeScale();
    const range = timeScale?.getVisibleLogicalRange?.();
    if (!timeScale || !range) return;
    const center = (range.from + range.to) / 2;
    const width = (range.to - range.from) * (direction === "in" ? 0.78 : 1.22);
    timeScale.setVisibleLogicalRange({ from: center - width / 2, to: center + width / 2 });
  }

  function exportScreenshot() {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${stock?.symbol || "chart"}-chart.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <section className={`chart-panel pro-chart-panel ${isFullscreen ? "fullscreen" : ""}`}>
      <header className="pro-chart-top">
        <div className="symbol-stack">
          <p className="eyebrow">Advanced trading chart</p>
          <h2>{stock ? `${stock.symbol} - ${stock.name}` : "Select a stock"}</h2>
          <div className="market-status">
            <span />
            Market open
          </div>
        </div>

        <div className="quote-strip" aria-label="Live quote data">
          <div>
            <span>Price</span>
            <strong>{latest ? money.format(latest.close) : "$0.00"}</strong>
          </div>
          <div>
            <span>Change</span>
            <strong className={priceChange >= 0 ? "positive" : "negative"}>
              {priceChange >= 0 ? "+" : ""}{money.format(priceChange)} ({percentChange.toFixed(2)}%)
            </strong>
          </div>
          <div>
            <span>Volume</span>
            <strong>{compact.format(totalVolume || 0)}</strong>
          </div>
          <div>
            <span>Market Cap</span>
            <strong>{compact.format((stock?.price || latest?.close || 0) * 16000000000)}</strong>
          </div>
        </div>
      </header>

      <div className="ohlc-strip" aria-label="OHLC data">
        <span>O <strong>{money.format(latest?.open || 0)}</strong></span>
        <span>H <strong>{money.format(dailyHigh || 0)}</strong></span>
        <span>L <strong>{money.format(dailyLow || 0)}</strong></span>
        <span>C <strong>{money.format(latest?.close || 0)}</strong></span>
      </div>

      <div className="pro-chart-toolbar">
        <div className="timeframes" role="tablist" aria-label="Chart timeframes">
          {TIMEFRAMES.map((tf) => (
            <button key={tf} type="button" className={timeframe === tf ? "active" : ""} onClick={() => setTimeframe(tf)}>
              {tf}
            </button>
          ))}
        </div>

        <div className="indicator-row" aria-label="Technical indicators">
          {INDICATORS.map((indicator) => (
            <button
              key={indicator}
              type="button"
              className={activeIndicators.includes(indicator) ? "active" : ""}
              onClick={() => toggleIndicator(indicator)}
            >
              {indicator}
            </button>
          ))}
        </div>

        <div className="drawing-row" aria-label="Drawing tools">
          {DRAWING_TOOLS.map((tool) => (
            <button key={tool} type="button" className={activeTool === tool ? "active" : ""} onClick={() => setActiveTool(tool)}>
              <Ruler size={13} />
              {tool}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-stage pro-chart-stage" ref={containerRef} aria-label="Professional candlestick chart">
        <div className="live-price-badge">
          <TrendingUp size={14} />
          {latest ? money.format(latest.close) : "$0.00"}
        </div>
        <div className="crosshair-badge">
          <Crosshair size={14} />
          Crosshair
        </div>
        {tooltip ? (
          <div className="price-tooltip" style={{ transform: `translate(${tooltip.x}px, ${tooltip.y}px)` }}>
            <strong>{money.format(tooltip.close)}</strong>
            <span>O {money.format(tooltip.open)}</span>
            <span>H {money.format(tooltip.high)}</span>
            <span>L {money.format(tooltip.low)}</span>
          </div>
        ) : null}
      </div>

      <footer className="pro-chart-actions">
        <button type="button" onClick={() => zoom("in")}><Plus size={15} /> Zoom</button>
        <button type="button" onClick={() => zoom("out")}><Minus size={15} /> Zoom</button>
        <button type="button"><Bell size={15} /> Alert</button>
        <button type="button"><Star size={15} /> Watchlist</button>
        <button type="button" onClick={exportScreenshot}><Camera size={15} /> Export</button>
        <button type="button" onClick={() => setIsFullscreen((value) => !value)}>
          <Maximize2 size={15} />
          {isFullscreen ? "Exit" : "Fullscreen"}
        </button>
      </footer>
    </section>
  );
}

export default ChartPanel;
