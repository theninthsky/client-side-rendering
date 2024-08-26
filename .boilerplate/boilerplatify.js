import { execSync } from 'node:child_process'
import { rm, cp } from 'node:fs/promises'

console.log('Transforming project into a boilerplate...')

const pathsToDelete = ['src/components', 'src/hooks', 'src/images', 'src/pages', 'src/styles']
const pathsToCopy = ['scripts', 'src']
const dependenciesToUninstall = [
  '@emotion/react',
  '@emotion/styled',
  '@mui/material',
  '@tanstack/react-table',
  'frontend-essentials',
  'jquery',
  'lodash',
  'moment',
  'web-vitals',
  'zustand'
]

await Promise.all(pathsToDelete.map(path => rm(path, { force: true, recursive: true })))
await Promise.all(pathsToCopy.map(path => cp(`.boilerplate/${path}`, path, { force: true, recursive: true })))
await rm('.boilerplate', { recursive: true })

execSync(`npm uninstall ${dependenciesToUninstall.join(' ')}`)

console.log('The project was successfully transformed into a boilerplate')
