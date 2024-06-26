import { siteConfig } from '../config'

export const homePage = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="https://nyan.be/raw/1719439218" type="image/x-icon" />
        <meta property="og:title" content="Nyan.be" />
        <meta property="og:description" content="Free Anonymous File Hosting" />
        <meta property="og:image" content="https://nyan.be/raw/1719438473" />
        <title>Nyan.be - Free Anonymous File Hosting</title>
        <meta name="twitter:card" content="summary_large_image">
        <meta name="theme-color" content="${siteConfig.DEFAULT_EMBED_COLOR}">
        <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://nyan.be/raw/home.css">
        <style>
            a,
            a:hover,
            a:visited,
            a:active {
	            color: inherit;
	            text-decoration: none;
        </style>
    </head>
    <body>
        <header>
            <img
            style="width:95%; border-radius: 1%;"
            src="https://nyan.be/raw/1719438473" alt="banner" />
            <h1>Upload Your File</h1><span>Free Anonymous File Hosting | 100 MB File Limit</span>
        </header>
        <main>
            <input type="file" id="fileInput" />
            <button id="uploadButton">Upload</button>
            <input type="text" id="fileUrl" readonly />
        </main>
        <footer id="fileInput">
            <p>© 2024 <a href="https://nyan.be">nyan.be</a> | <a href="https://nyan.be/rules">Rules & Privacy Policy</a> | <a href="mailto:abuse@nyan.be">Report Abuse</a></p>
        </footer>
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

export const rulesPage = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="https://nyan.be/raw/1719439218" type="image/x-icon" />
        <meta property="og:title" content="Nyan.be" />
        <meta property="og:description" content="The rules and privacy policy" />
        <meta property="og:image" content="https://nyan.be/raw/1719438473" />
        <title>Nyan.be - Rules & Privacy Policy</title>
        <meta name="twitter:card" content="summary_large_image">
        <meta name="theme-color" content="${siteConfig.DEFAULT_EMBED_COLOR}">
        <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://nyan.be/raw/home.css">
        <style>
            a,
            a:hover,
            a:visited,
            a:active {
	            color: inherit;
	            text-decoration: none;
        </style>
    </head>
    <body>
        <header style="margin-top: 20%;">
            <h1>The Rules and Privacy Policy</h1><span>Please read the rules and privacy policy before uploading a file.</span>
        </header>
        <main>
            <p>Rules & Privacy Policy</p>
            <p>1. No illegal content. This includes, but is not limited to pirated software, copyrighted material, and CSAM/CSEM.</p>
            <p>2. No harmful content. This includes, but is not limited to malware, viruses, and phishing links.</p>
            <p>3. No personal information. This includes, but is not limited to addresses, phone numbers, and social security numbers.</p>
            <p>4. No spam. This includes, but is not limited to excessive uploads.</p>
            <p>5. NSFW is allowed, but excessive gore, revenge porn and other extreme content is not allowed.</p>
            <p>6. I am allowed to remove any file for any reason.</p>

            <p>Privacy Policy</p>
            <p>1. Files are stored forever unless the original uploader contacts me to remove them.</p>
            <p>2. Files are not scanned for personal information, but are scanned for known hashes of CSAM/CSEM. If a match is found, the file is reported to the National Center for Missing & Exploited Children (NCMEC) and law enforcement.</p>
            <p>3. Your IP address and user agent are stored for security reasons. This information is not shared with third parties unless required by law enforcement.</p>
            <p>4. Nyan.be will disclose if any information is requested by law enforcement, see the <a href="#soon"> transparency report</a> for more information.</p>


            <p>By uploading a file, you agree to the rules and privacy policy. Violating the rules will result in a ban.</p>
            <p>Report Abuse: If you see a file that violates the rules, please email me at <a href="mailto:abuse@nyan.be">abuse@nyan.be</a>.</p>
            <p>Thank you for using Nyan.be!</p>
        </main>
        <footer id="fileInput">
            <p>© 2024 <a href="https://nyan.be">nyan.be</a> | <a href="https://nyan.be/rules">Rules & Privacy Policy</a> | <a href="mailto:abuse@nyan.be">Report Abuse</a></p>
        </footer>
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
