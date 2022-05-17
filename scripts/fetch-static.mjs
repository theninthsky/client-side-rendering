import { mkdir, writeFile } from 'fs/promises'
import axios from 'axios'

const path = 'public/json'

const fetchAssets = async () => {
  mkdir(path, { recursive: true })

  const { data } = await axios.get('https://baconipsum.com/api/?type=meat-and-filler&paras=50', {
    transformResponse: res => res
  })

  writeFile(`${path}/lorem-ipsum.json`, data)
  console.log("Generated 'lorem-ipsum.json'")
}

fetchAssets()
