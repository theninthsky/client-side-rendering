import process from 'node:process'
import { mkdir, writeFile } from 'fs/promises'
import axios from 'axios'

const path = 'public/json'

axios.defaults.transformResponse = res => res
mkdir(path, { recursive: true })
process.on('beforeExit', () => console.log('Fetched all static assets.'))

const fetchInfo = async () => {
  const { data } = await axios.get('https://baconipsum.com/api/?type=meat-and-filler&paras=200')

  writeFile(`${path}/info.json`, data)
}

const fetchQuotes = async () => {
  const [{ data: data1 }, { data: data2 }, { data: data3 }, { data: data4 }] = await Promise.all([
    axios.get('https://zenquotes.io/api/quotes'),
    axios.get('https://zenquotes.io/api/quotes'),
    axios.get('https://zenquotes.io/api/quotes'),
    axios.get('https://zenquotes.io/api/quotes')
  ])

  writeFile(`${path}/quotes.json`, [...data1, ...data2, ...data3, ...data4])
}

fetchInfo()
fetchQuotes()
