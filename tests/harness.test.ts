import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

describe('test harness', () => {
    it('can read repo files from the project root', () => {
        const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
        expect(pkg.name).toBe('mindfire-homes')
    })
})
