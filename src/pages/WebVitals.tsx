import { useState, useEffect, FC } from 'react'
import { Meta } from 'frontend-essentials'
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals'
import { css } from '@emotion/css'

import pages from 'pages'
import Title from 'components/common/Title'
import Info from 'components/common/Info'

/* Bloat */
import _ from 'lodash'
import $ from 'jquery'
import moment from 'moment'
$(`#${_.isDate(moment().toDate())}`)

type Metrics = {
  [name: string]: {
    value: number
    rating: string
  }
}

const METRICS_ORDER = ['TTFB', 'FCP', 'LCP', 'CLS', 'FID', 'INP']
const { title, description } = pages.find(({ chunk }) => chunk === 'core-web-vitals')!

const WebVitals: FC<{}> = () => {
  const [metrics, setMetrics] = useState<Metrics>({})

  useEffect(() => {
    onCLS(addMetric)
    onFCP(addMetric)
    onFID(addMetric)
    onINP(addMetric)
    onLCP(addMetric)
    onTTFB(addMetric)

    setTimeout(() => document.body.click(), 50)
  }, [])

  const addMetric = ({ name, value, rating }) => {
    setMetrics(prevState => ({
      ...prevState,
      [name]: { value: `${~~value}ms`, rating: `${rating[0].toUpperCase()}${rating.slice(1)}` }
    }))
  }

  return (
    <div>
      <Meta title={`${title} | Client-side Rendering`} description={description} />

      <Title>{title}</Title>

      <Info className={style.info}>{description}</Info>

      <div className={style.metrics}>
        {Object.entries(metrics)
          .sort(([metricA], [metricB]) => METRICS_ORDER.indexOf(metricA) - METRICS_ORDER.indexOf(metricB))
          .map(([metric, { value, rating }]) => (
            <div key={metric} className={style.metric}>
              <strong>{metric}</strong>: {value} ({rating})
            </div>
          ))}
      </div>
    </div>
  )
}

const style = {
  info: css`
    margin-top: 20px;
  `,
  metrics: css`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    font-size: 18px;
  `,
  metric: css`
    margin-bottom: 20px;
  `
}

export default WebVitals
