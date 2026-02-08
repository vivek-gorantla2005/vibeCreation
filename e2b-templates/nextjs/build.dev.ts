import "dotenv/config";
import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'

async function main() {
    Template.build(template, {
        alias: "vibeCreation-v1",
        cpuCount: 2,
        memoryMB: 4096,
        onBuildLogs: defaultBuildLogger(),
    })
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})

