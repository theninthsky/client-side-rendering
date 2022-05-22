import process from 'node:process'
import { mkdir, writeFile } from 'fs/promises'
import axios from 'axios'

const path = 'public/json'
const axiosOptions = { transformResponse: res => res }

mkdir(path, { recursive: true })
process.on('beforeExit', () => console.log('Fetched all static assets.'))

const fetchInfo = async () => {
  const { data } = await axios.get('https://baconipsum.com/api/?type=meat-and-filler&paras=100', axiosOptions)

  writeFile(`${path}/info.json`, data)
}

fetchInfo()
