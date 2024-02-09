import { db } from '@/firebase-firestore.js'
import { doc, getDoc, writeBatch } from 'firebase/firestore'
import type { DocumentReference, CollectionReference } from 'firebase/firestore'

export default function useFireBase() {
  const writeDocs = async (
    rows: any[],
    coll: CollectionReference
  ): Promise<DocumentReference[]> => {
    const docRefs: DocumentReference[] = []
    const batch = writeBatch(db)
    rows.forEach((row) => {
      const document = { ...row }
      const docRef = document.id ? doc(coll, document.id) : doc(coll)
      delete document.id
      batch.set(docRef, document)
      docRefs.push(docRef)
    })
    console.time('write.commit')
    await batch.commit()
    console.timeEnd('write.commit')
    return docRefs
  }
  const deleteDocs = async (docRefs: DocumentReference[]) => {
    const batch = writeBatch(db)
    docRefs.forEach((doc) => {
      batch.delete(doc)
    })
    console.time('delete.commit')
    await batch.commit()
    console.timeEnd('delete.commit')
  }

  const readDoc = async (docRef: DocumentReference) => {
    const doc = await getDoc(docRef)
    if (doc.exists()) {
      const row = doc.exists()
        ? {
            id: doc.id,
            ...doc.data()
          }
        : null
      return row
    }
  }

  return {
    readDoc,
    writeDocs,
    deleteDocs
  }
}
