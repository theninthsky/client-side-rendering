import { useState, useEffect } from 'react'
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals'
import { css } from '@emotion/css'

const WebVitals = () => {
  const [metrics, setMetrics] = useState({})

  useEffect(() => {
    onCLS(addMetric)
    onFCP(addMetric)
    onFID(addMetric)
    onINP(addMetric)
    onLCP(addMetric)
    onTTFB(addMetric)
  }, [])

  const addMetric = ({ name, value, rating }) => {
    setMetrics(prevState => ({
      ...prevState,
      [name]: { value: `${~~value}ms`, rating: `${rating[0].toUpperCase()}${rating.slice(1)}` }
    }))
  }

  return (
    <div className={style.wrapper}>
      {Object.entries(metrics).map(([metric, value]) => (
        <div key={metric} className={style.metric}>
          <strong>{metric}</strong>: {value.value}
        </div>
      ))}
    </div>
  )
}

const style = {
  wrapper: css`
    display: flex;
    flex-direction: column;
  `,
  metric: css`
    margin: 10px 0;
  `
}

export default WebVitals
