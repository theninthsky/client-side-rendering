import process from 'node:process'
import { mkdir, writeFile } from 'fs/promises'
import axios from 'axios'

const path = 'public/json'
const axiosOptions = { transformResponse: res => res }

mkdir(path, { recursive: true })
process.on('beforeExit', () => console.log('Fetched all static assets.'))

const fetchInfo = async () => {
  const { data } = await axios.get('https://baconipsum.com/api/?type=meat-and-filler&paras=200', axiosOptions)

  writeFile(`${path}/info.json`, data)
}

const fetchQuotes = async () => {
  const [{ data: data1 }, { data: data2 }, { data: data3 }] = await Promise.all([
    axios.get('https://zenquotes.io/api/quotes'),
    axios.get('https://zenquotes.io/api/quotes'),
    axios.get('https://zenquotes.io/api/quotes')
  ])

  writeFile(`${path}/quotes.json`, JSON.stringify([...data1, ...data2, ...data3]))
}

fetchInfo()
fetchQuotes()
