'use client'
import { useScreenRecording } from "@/app/hooks/useScreenRecording"
import { useFileInput } from "@/app/hooks/useFileHandle"
import { MAX_VIDEO_SIZE} from "@/app/constants"
import { useEffect, useState } from "react"
import { uploadVideoAction } from "./lib/actions/upload"

export default function Home() {
  
    const {
        resetRecording,
        startRecording,
        stopRecording,
        isRecording,
        recordedBlob,
        recordedVideoUrl,
        recordingDuration
   } = useScreenRecording()

   const [loading, setLoading] = useState(false)

   const video = useFileInput(MAX_VIDEO_SIZE)

   const recordAgain = async () => {
           resetRecording()
           await startRecording()

        }

        const gotoUpload = () => {

           if(!recordedBlob) return

            const url = URL.createObjectURL(recordedBlob)

            sessionStorage.setItem('recordedVideo', 
               JSON.stringify({
                 url,
                 name: 'screen-recording.webm',
                 type: recordedBlob.type,
                 size: recordedBlob.size,
                 duration: recordingDuration || 0
               })
            )
        }

        useEffect(() => {
            const checkForRecordedVideo = async () => {
               try {
                  const stored = sessionStorage.getItem('recordedVideo')
                  if(!stored) return 
                   
                  const {url, name, type, duration} = JSON.parse(stored)
                  const blob = await fetch(url).then((res) => res.blob())
                  const file = new File([blob], name, {type, lastModified: Date.now()})

                  if(video.inputRef.current) {
                     const dataTransfer = new DataTransfer()
                     dataTransfer.items.add(file)
                     video.inputRef.current.files = dataTransfer.files

                     const event = new Event('change', {bubbles: true})
                     video.inputRef.current.dispatchEvent(event)
                     video.handleFileChange({
                       target: {files: dataTransfer.files}
                     })
                  }


                    sessionStorage.removeItem('recordedVideo')
                  URL.revokeObjectURL(url)

                  } catch (error) {
                 console.error(error, 'Error loading recorded video')
               }
            }

            checkForRecordedVideo()
        }, [video])


const handleUploadVideo = async () => {
   setLoading(false)
  let fileToUpload: File | null = null

  // If user uploaded a file
  if (video.file) {
    fileToUpload = video.file
  } 
  // If user recorded a video
  else if (recordedBlob) {
    fileToUpload = new File(
      [recordedBlob], 
      'screen-recording.webm', 
      { type: recordedBlob.type, lastModified: Date.now() }
    )
  }

  if (!fileToUpload) {
    alert("No video selected!")
    return
  }

  const formData = new FormData()
  formData.append('video', fileToUpload)

  try {
     setLoading(true)
    const res = await uploadVideoAction(formData)
    console.log("Uploaded to Cloudinary:", res)
    alert("Video uploaded successfully!")
  } catch (err) {
    console.error("Upload failed:", err)
    alert("Upload failed. Check console for details.")
  } finally {
     setLoading(false)
  }
}

  return (
    <div className="flex sm:flex-row flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-2 ">
       <div className="flex flex-col h-[30rem] w-full max-w-md items-center">
          <div className="border-2 rounded-lg  border-white h-[20rem] w-full shadow-sm">
          
        
          </div>
         <div className="flex items-center gap-3 my-5 mx-2">
           { isRecording ? (
            <button className="bg-red-400 p-2 px-20 rounded-sm font-semibold cursor-pointer w-full w-[20rem] animate-bounce" onClick={() => {stopRecording(), gotoUpload()}}>
               Recording...
            </button> 
           )
            : (
              <button className="bg-green-400 p-2 px-20 rounded-sm font-semibold cursor-pointer w-full w-[20rem]" onClick={() => startRecording(true, true)}>Record Project</button>)
            }
         </div>
       </div>


       <div className="flex flex-col h-[30rem] w-full max-w-md items-center">
          <div className="border-2 rounded-lg  border-white h-[20rem] w-full shadow-sm">
           <div className="h-[18rem] flex flex-col sm:mt-13 px-2">
                         <div className="h-[70%] bg-black-100 rounded-t-lg flex items-center justify-center">
                               {recordedVideoUrl ? <video 
              src={recordedVideoUrl} 
              controls 
              className="rounded-lg"
              autoPlay
            /> : video.previewUrl ? <video src={video.previewUrl && video.previewUrl} controls></video> : ''}
                         </div>
                      </div>
          </div>
         <div className="flex items-center gap-3 my-5 mx-2">
           {
            video.previewUrl === "" ?
          <button className="bg-red-400 py-2 px-10 rounded-sm text-lg text-sm cursor-pointer " onClick={() => video.inputRef.current.click()}>
          <input type='file' className="hidden" onChange={video.handleFileChange}  ref={video.inputRef} accept="video/*"/>
          Upload Video</button> 
          :  <button className="bg-red-400 py-2 px-10 rounded-sm text-lg text-sm cursor-pointer " onClick={recordAgain}>
          Record Again</button>
            }
          <button className="bg-white rounded-sm text-black text-lg text-sm cursor-pointer py-2 px-10"  onClick={handleUploadVideo}>{loading ? 'Loading..' : 'Post Project'}</button>
         </div>
         <div className="rounded-b-lg flex flex-col items- justify-end">
                              <p className="text-lg font-semibold text-base ">Filename</p>
                              <p className="text-[14px] text-white-100 font-sans font-semibold">{video.file?.name}</p>
                         </div>
       </div>
      </div>
  );
}
