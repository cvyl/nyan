import { siteConfig } from '../config'

const defaultHeadTags = `
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="https://nyan.be/raw/1719439218" type="image/x-icon" />
        <meta name="twitter:card" content="summary_large_image">
        <meta name="theme-color" content="#d98c5e">
        <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://nyan.be/raw/home.css">
        <meta property="og:title" content="${siteConfig.TITLE}" />

`

export const homePage = `
<!DOCTYPE html>
<html>
<head>
    ${defaultHeadTags}
    <meta property="og:description" content="${siteConfig.DESCRIPTION}" />
    <title>${siteConfig.TITLE} - ${siteConfig.DESCRIPTION}</title>

    <style>
        a,
        a:hover,
        a:visited,
        a:active {
            color: inherit;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <header>
        <img
        style="width:95%; border-radius: 1%;"
        src="https://nyan.be/raw/1719438473" alt="banner" />
        <h1>Upload Your Files</h1><span>Free Anonymous File Hosting | 100 MB File Limit</span>
    </header>
    <main>
        <input type="file" id="fileInput" multiple />
        <button id="uploadButton">Upload</button>
        <div id="fileUrls" style="display: block;"></div>
    </main>
    <footer>
        <p>© 2024 <a href="https://nyan.be">nyan.be</a> | <a href="https://nyan.be/rules">Rules & Privacy Policy</a> | <a href="mailto:abuse@nyan.be">Report Abuse</a></p>
    </footer>
    <script>
        document.getElementById("uploadButton").addEventListener("click", async function() {
            var fileInput = document.getElementById("fileInput");
            var files = fileInput.files;

            if (files.length > 0) {
                var fileUrlsDiv = document.getElementById("fileUrls");
                fileUrlsDiv.innerHTML = ''; // Clear previous URLs

                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    // check if too many files (max 4)
                    if (files.length > 4) {
                        alert("You can only upload 4 files at a time.");
                        break;
                    }
                    try {
                        const response = await uploadFile(file);
                        const data = await response.json();
                        if (data.success) {
                            var fileUrlInput = document.createElement("input");
                            fileUrlInput.type = "text";
                            fileUrlInput.value = data.image;
                            fileUrlInput.readOnly = true;
                            fileUrlInput.style = "display: block;";
                            fileUrlsDiv.appendChild(fileUrlInput);
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    // Delay before next upload
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } else {
                alert("Please select files to upload.");
            }
        });

        async function uploadFile(file) {
            return fetch("/anonUpload", {
                method: "POST",
                headers: {
                    "Content-Type": file.type,
                    "Content-Length": file.size
                },
                body: file
            });
        }
    </script>
</body>
</html>


`

export const rulesPage = `
<!DOCTYPE html>
<html>
    <head>
        ${defaultHeadTags}
        <meta property="og:description" content="The rules and privacy policy" />
        <title>${siteConfig.TITLE} - Rules & Privacy Policy</title>
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
            <span>This page is subject to change at any time. | Last updated: 27/06/2024</span>
        </main>
        <footer id="fileInput">
            <p>© 2024 <a href="https://nyan.be">nyan.be</a> | <a href="https://nyan.be/rules">Rules & Privacy Policy</a> | <a href="mailto:abuse@nyan.be">Report Abuse</a></p>
        </footer>
    </body>
</html>
`
//todo add GIF support
export const mediaViewer = (
	url: string,
	contentType: string,
	id: string,
	formattedDate: string
) => {
	const isImage = contentType.startsWith('image/')
	const isVideo = contentType.startsWith('video/')

	const headTags = isImage
		? `
        <meta property="og:image" content="${url}" />
        <meta property="og:image:type" content="${contentType}" />
        <title>${siteConfig.TITLE} - Image Viewer</title>
      `
		: `
        <meta property="og:type" content="video.other">
        <meta property="og:video:url" content="${url}">
        <meta property="og:video:type" content="${contentType}" />
        <title>${siteConfig.TITLE} - Video Viewer</title>
      `

	const bodyContent = isImage
		? `<img src="${url}" alt="image" />`
		: `
        <video controls>
          <source src="${url}" type="${contentType}">
          Your browser does not support the video tag.
        </video>
      `

	return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="twitter:card" content="summary_large_image">
        <meta name="theme-color" content="${siteConfig.DEFAULT_EMBED_COLOR}">
        <link rel="icon" href="https://nyan.be/raw/1719439218" type="image/x-icon" />
        <link type="application/json+oembed" href="https://nyan.be/raw/${id}/json" />
        <link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://nyan.be/raw/styles.css">
        ${headTags}
      </head>
      <body>
        <div class="branding"><a href="${siteConfig.BASE_URL}">${siteConfig.TITLE}</a></div>
        <div class="container">
          ${bodyContent}
          <div class="date">Uploaded on: ${formattedDate}</div>
        </div>
      </body>
      </html>
    `
}
