import process from 'node:process'
import { mkdir, writeFile } from 'fs/promises'
import axios from 'axios'

const PATH = 'public/json'
const LOG_LABEL = 'Fetched all static assets in'

console.time(LOG_LABEL)

mkdir(PATH, { recursive: true })

const fetchLoremIpsum = async () => {
  const { data } = await axios('https://asdfast.beobit.net/api/?startLorem=true&length=200')

  writeFile(`${PATH}/lorem-ipsum.json`, JSON.stringify(data.text))
}

fetchLoremIpsum()

process.on('beforeExit', () => console.timeLog(LOG_LABEL))
