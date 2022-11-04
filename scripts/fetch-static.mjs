import process from 'node:process'
import { mkdir, writeFile } from 'fs/promises'
import axios from 'axios'

const path = 'public/json'
const axiosOptions = { transformResponse: res => res }

mkdir(path, { recursive: true })
process.on('beforeExit', () => console.log('Fetched all static assets'))

const fetchLoremIpsum = async () => {
  const { data } = await axios.get('https://loripsum.net/api/100/long/plaintext', axiosOptions)

  writeFile(`${path}/lorem-ipsum.json`, JSON.stringify(data))
}

fetchLoremIpsum()
