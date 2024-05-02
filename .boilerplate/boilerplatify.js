import { rm, cp } from 'node:fs/promises'

const pathsToDelete = ['src/components', 'src/hooks', 'src/images', 'src/pages', 'src/styles']

await Promise.all(pathsToDelete.map(path => rm(path, { force: true, recursive: true })))
await cp('.boilerplate/src', 'src', { force: true, recursive: true })
