import { supabase } from "./supabase"

export async function uploadFile(
  file: File,
  bucket = "portfolio",
  folder = "uploads",
): Promise<{ url: string; path: string } | null> {
  try {
    if (!file) return null

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return {
      url: data.publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return null
  }
}

export async function deleteFile(path: string, bucket = "portfolio"): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}

export async function getFileUrl(path: string, bucket = "portfolio"): Promise<string | null> {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl
  } catch (error) {
    console.error("Error getting file URL:", error)
    return null
  }
}

