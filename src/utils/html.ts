import { siteConfig } from '../config'

export const homePage = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="https://nyan.be/raw/1719009115" type="image/x-icon" />
        <meta property="og:title" content="test" />
        <meta property="og:image" content="https://nyan.be/raw/1719009115" />
        <title>v1 boymoder new site in rework, dont use</title>
        <meta name="twitter:card" content="summary_large_image">
        <meta name="theme-color" content="${siteConfig.DEFAULT_EMBED_COLOR}">
        ${/*<meta property="og:image" content="https://nyan.be/raw/Mikka_1719393039"> */ ''}
        <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://nyan.be/raw/home.css">
    </head>
    <body>
        <header>
            <h1>Upload Your File</h1>
        </header>
        <main>
            <input type="file" id="fileInput" />
            <button id="uploadButton">Upload</button>
            <input type="text" id="fileUrl" readonly />
        </main>
        <script>
            document.getElementById("uploadButton").addEventListener("click", function() {
                var fileInput = document.getElementById("fileInput");
                var file = fileInput.files[0];

                if (file) {
                    var formData = new FormData();
                    formData.append("file", file);

                    fetch("/anonUpload", {
                        method: "POST",
                        headers: {
                            "Content-Type": file.type,
                            "Content-Length": file.size
                        },
                        body: file
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            var fileUrlInput = document.getElementById("fileUrl");
                            fileUrlInput.value = data.image;
                            fileUrlInput.style.display = "block";
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
                } else {
                    alert("Please select a file to upload.");
                }
            });
        </script>
    </body>
</html>
`

export const imageViewer = (
	imageUrl: string,
	id: string,
	formattedDate: string
) => {
	return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta property="og:image" content="${imageUrl}" />
            <meta name="twitter:card" content="summary_large_image">
            <meta name="theme-color" content="${siteConfig.DEFAULT_EMBED_COLOR}">
            <link type="application/json+oembed" href="https://nyan.be/raw/${id}/json" />
            <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://nyan.be/raw/styles.css">
            <title>Nyan.be - Image Viewer</title>
        </head>
        <body>
            <div class="branding"><a href="https://nyan.be">nyan.be</a></div>
            <div class="container">
                <img src="${imageUrl}" alt="image" />
                <div class="date">Uploaded on: ${formattedDate}</div>
            </div>
        </body>
        </html>
        `
}

export const videoPlayer = (
	imageUrl: string,
	contentType: string,
	id: string,
	formattedDate: string
) => {
	return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="twitter:card" content="summary_large_image">
            <meta name="theme-color" content="${siteConfig.DEFAULT_EMBED_COLOR}">
            ${/*<meta property="og:image" content="https://nyan.be/raw/Mikka_1719393039"> */ ''}
            <meta property="og:type" content="video.other">
            <meta property="og:video:url" content="${imageUrl}">
            <meta property="og:video:type" content="${contentType}" />
            <meta property="og:video:height" content="720">
            <meta property="og:video:width" content="960">
            <link type="application/json+oembed" href="https://nyan.be/raw/${id}/json" />
            <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://nyan.be/raw/styles.css">
            <title>Nyan.be - Video Viewer</title>
        </head>
        <body>
            <div class="branding"><a href="https://nyan.be">nyan.be</a></div>
            <div class="container">
                <video controls>
                    <source src="${imageUrl}" type="${contentType}">
                    Your browser does not support the video tag.
                </video>
                <div class="date">Uploaded on: ${formattedDate}</div>
            </div>
        </body>
        </html>
        `
}
