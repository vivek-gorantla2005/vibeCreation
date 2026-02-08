"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

export default function Home() {
  return (
    <div>
      <Button onClick={async () => {
        const res = await apiClient.messages.get()
        console.log(res)
      }}>Click me</Button>
    </div>
  );
}
