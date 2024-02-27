import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const storage = getStorage()

export const uploadTeamLogo = async (file: File, name: string) => {
  const fileRef = ref(storage, 'hy-competition-teams/' + name)
  console.log(file)
  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)
  return url
}
export const deleteTeamLogo = (name: string) => {
  const fileRef = ref(storage, 'hy-competition-teams/' + name)
  deleteObject(fileRef)
}

export const uploadTeamSponsor = (file: File, name: string) => {
  const fileRef = ref(storage, 'hy-competition-sponsors/' + name)
  return new Promise((resolve) => {
    uploadBytes(fileRef, file).then(() => {
      getDownloadURL(fileRef).then((url) => {
        resolve(url)
      })
    })
  })
}
export const deleteTeamSponsor = (name: string) => {
  const fileRef = ref(storage, 'hy-competition-sponsors/' + name)
  deleteObject(fileRef)
}
