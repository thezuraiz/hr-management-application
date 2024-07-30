import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const uploadFileToStorage = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storage: any,
  file: Express.Multer.File,
  path: string
): Promise<string> => {
  const storageRef = ref(storage, `file/${path}`);
  const snapshot = await uploadBytesResumable(storageRef, file.buffer, {
    contentType: file.mimetype,
  });
  return getDownloadURL(snapshot.ref);
};

export { uploadFileToStorage };
