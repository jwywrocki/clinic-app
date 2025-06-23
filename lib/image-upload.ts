export async function uploadImage(file: File): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => {
            const fileName = encodeURIComponent(file.name);
            const fileSize = Math.round(file.size / 1024);

            const placeholderUrl = `/images/placeholder.svg?height=300&width=400&text=${fileName} (${fileSize}KB)`;
            resolve(placeholderUrl);
        }, 1000);
    });
}
