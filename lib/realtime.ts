import type { RealtimeChannel } from "@supabase/supabase-js"
import { supabase } from "./supabase"

type ChannelCallback = () => void

export function subscribeToTable(
  table: string,
  callback: ChannelCallback,
  event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*",
): RealtimeChannel {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      "postgres_changes",
      {
        event,
        schema: "public",
        table,
      },
      () => {
        callback()
      },
    )
    .subscribe()

  return channel
}

export function unsubscribeFromChannel(channel: RealtimeChannel): void {
  supabase.removeChannel(channel)
}

export function subscribeToMultipleTables(
  tables: string[],
  callback: ChannelCallback,
  event: "INSERT" | "UPDATE" | "DELETE" | "*" = "*",
): RealtimeChannel[] {
  return tables.map((table) => subscribeToTable(table, callback, event))
}

