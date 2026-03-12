import { supabase, getServiceSupabase } from "./supabase"

interface UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
}

/**
 * Upload a file to Supabase Storage (client-side, using anon key)
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: {
    contentType?: string
    upsert?: boolean
  }
): Promise<UploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      })

    if (error) {
      console.error("Storage upload error:", error)
      return { success: false, error: error.message }
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}

/**
 * Upload a file using the service role key (server-side only)
 */
export async function uploadFileServer(
  bucket: string,
  path: string,
  file: File | Blob | Buffer,
  options?: {
    contentType?: string
    upsert?: boolean
  }
): Promise<UploadResult> {
  try {
    const serviceSupabase = getServiceSupabase()

    const { data, error } = await serviceSupabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      })

    if (error) {
      console.error("Server storage upload error:", error)
      return { success: false, error: error.message }
    }

    const { data: urlData } = serviceSupabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Server upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}

/**
 * Get the public URL for a file in storage
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Generate a signed (temporary) URL for private files
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600 // seconds, default 1 hour
): Promise<{ url?: string; error?: string }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    return { error: error.message }
  }

  return { url: data.signedUrl }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: string,
  paths: string | string[]
): Promise<{ success: boolean; error?: string }> {
  const pathArray = Array.isArray(paths) ? paths : [paths]

  const { error } = await supabase.storage.from(bucket).remove(pathArray)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Delete a file using the service role key (server-side only)
 */
export async function deleteFileServer(
  bucket: string,
  paths: string | string[]
): Promise<{ success: boolean; error?: string }> {
  const serviceSupabase = getServiceSupabase()
  const pathArray = Array.isArray(paths) ? paths : [paths]

  const { error } = await serviceSupabase.storage.from(bucket).remove(pathArray)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * List files in a storage bucket path
 */
export async function listFiles(
  bucket: string,
  path?: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: { column: string; order: "asc" | "desc" }
  }
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path, {
      limit: options?.limit ?? 100,
      offset: options?.offset ?? 0,
      sortBy: options?.sortBy ?? { column: "created_at", order: "desc" },
    })

  if (error) {
    return { files: [], error: error.message }
  }

  return { files: data, error: null }
}

// Storage bucket names as constants
export const STORAGE_BUCKETS = {
  SERMONS: "sermons",
  AVATARS: "avatars",
  GALLERY: "gallery",
  BLOG: "blog",
  EVENTS: "events",
  GENERAL: "uploads",
} as const
