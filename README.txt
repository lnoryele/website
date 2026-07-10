Oryele complete static website

Upload all files and the assets directory to the website root.
Primary domain: https://oryele.com
Redirect oryele.ai and www variants to https://oryele.com using permanent 301 redirects.

Clean URLs (no .html in the address bar):
- Local preview: python serve.py --port 5501
- Production (Apache): .htaccess is included for extensionless routes

Oryele Agent:
- Knowledge file: oryele-knowledge.json
- Chat UI script: agent.js (loaded site-wide via chrome.js)
