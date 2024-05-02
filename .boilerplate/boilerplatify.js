import { execSync } from 'node:child_process'
import { rm, cp } from 'node:fs/promises'

const pathsToDelete = ['src/components', 'src/hooks', 'src/images', 'src/pages', 'src/styles']
const pathsToCopy = ['scripts', 'src']

await Promise.all(pathsToDelete.map(path => rm(path, { force: true, recursive: true })))
await Promise.all(pathsToCopy.map(path => cp(`.boilerplate/${path}`, path, { force: true, recursive: true })))
await rm('.boilerplate', { recursive: true })

execSync('npm uninstall frontend-essentials')

console.log('Project was successfully transformed into a boilerplate')
