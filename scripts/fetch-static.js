import process from 'node:process'
import { mkdir, writeFile } from 'fs/promises'

const PATH = 'public/json'
const LOG_LABEL = 'Fetched all static assets in'

console.time(LOG_LABEL)

mkdir(PATH, { recursive: true })

const fetchLoremIpsum = async () => {
  const response = await fetch('https://asdfast.beobit.net/api/?startLorem=true&length=200')
  const { text } = await response.json()

  writeFile(`${PATH}/lorem-ipsum.json`, JSON.stringify(text))
}

fetchLoremIpsum()

process.on('beforeExit', () => console.timeLog(LOG_LABEL))
