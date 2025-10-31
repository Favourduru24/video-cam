'use server'

import { v2 as cloudinary } from 'cloudinary'
import { revalidatePath } from 'next/cache'
import { Readable } from 'stream'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function uploadVideoAction(formData: FormData) {
  const file = formData.get('video') as File
  if (!file) throw new Error('No video file provided')

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'video-cam' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    )

    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    readable.pipe(uploadStream)
  })

  console.log('✅ Uploaded:', uploadResult)


  return uploadResult
}
