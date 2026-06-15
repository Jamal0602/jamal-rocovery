import { supabase } from "./supabase"

export async function setupMessagesTable() {
  try {
    // Check if the table exists
    const { count, error: checkError } = await supabase
      .from("messages_star")
      .select("*", { count: "exact", head: true })

    if (checkError && checkError.code === "42P01") {
      // Table doesn't exist, create it
      const { error } = await supabase.rpc("execute_sql", {
        query: `
          CREATE TABLE IF NOT EXISTS messages_star (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            education TEXT,
            subject TEXT,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Create index for performance
          CREATE INDEX IF NOT EXISTS idx_messages_star_created_at ON messages_star(created_at);
        `,
      })

      if (error) throw error
      console.log("Messages table created successfully")
      return true
    }

    return false
  } catch (error) {
    console.error("Error setting up messages table:", error)
    return false
  }
}

