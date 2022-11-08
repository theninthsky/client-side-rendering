import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

const metrics = {}

const addMetric = ({ name, value, rating }: Metric) => {
  metrics[name] = { value: `${~~value}ms`, rating: `${rating[0].toUpperCase()}${rating.slice(1)}` }

  if (Object.keys(metrics).length > 1) console.table(metrics)
}

onCLS(addMetric)
onFCP(addMetric)
onFID(addMetric)
onINP(addMetric)
onLCP(addMetric)
onTTFB(addMetric)
