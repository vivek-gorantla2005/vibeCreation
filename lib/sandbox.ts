import path from "path"
import Sandbox from "@e2b/code-interpreter"

export const PROJECT_ROOT = "/home/user/project"

export const SANDBOX_TEMPLATE_ID = "23eg105j66/vibecreation-v1"

export async function getSandbox(sandboxId: string) {
    return await Sandbox.connect(sandboxId)
}

export async function createSandbox() {
    return await Sandbox.create(SANDBOX_TEMPLATE_ID)
}

export const toProjectPath = (p: string) => {
    const normalized = p.replace(/\\/g, "/").trim()
    if (normalized.startsWith("/")) {
        return normalized
    }
    return path.posix.join(PROJECT_ROOT, normalized)
}



