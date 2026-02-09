import path from "path"
import Sandbox from "@e2b/code-interpreter"

export const  PROJECT_ROOT = "/home/user/project"

export async function getSandbox(sandboxId: string) {
    return await Sandbox.connect(sandboxId)
}

export const toProjectPath = (p: string) => {
    const normalized = p.replace(/\\/g,"/").trim()
    if(normalized.startsWith("/")){
        return normalized
    }
    return path.posix.join(PROJECT_ROOT,normalized)
}



