import {Queue} from "bullmq"
import redis from "@/lib/redis"

export const ingestionQueue = new Queue("code-ingestion", {
  connection: redis as any
});

