export class FileUtilsService {

  public static dataUrlToBlob(dataUrl: string | undefined, contentType: string): Blob | null {
    if (!dataUrl) {
      return null;
    }
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: contentType });
  }
}
