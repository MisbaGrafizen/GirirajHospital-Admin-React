export default async function uploadToHPanel(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const res = await fetch("https://storage.server.grafizen.in/upload.php", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      return data?.fileUrl || null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  }
  