ORYELE COMPLETE STATIC WEBSITE

PRIMARY WEBSITE
https://oryele.ai

DEPLOYMENT
Upload all files and the assets directory in this package directly to the document root for oryele.ai.
The deployment root should contain index.html, robots.txt, sitemap.xml, styles.css, app.js, and the assets directory.

Do not upload this package into an additional parent folder.
Do not redirect oryele.ai to oryele.com.

DOMAIN REDIRECT
oryele.com and www.oryele.com are alias domains and must permanently redirect to the matching path on https://oryele.ai.
Use the instructions in CLOUDFLARE-SEO-SETUP.txt.

Examples:
https://oryele.com/ -> https://oryele.ai/
https://www.oryele.com/about.html -> https://oryele.ai/about.html

CONTACT FORM
The Request a Briefing form submits through FormSubmit to info@oryele.com. The email address is intentional and does not change the primary website domain.

On the first live submission, FormSubmit may send a one-time activation email to info@oryele.com. Confirm that email once; subsequent submissions should then be delivered automatically.

When contact.html is opened directly from Finder as a local file, the form may open the visitor's email application with a pre-filled message. For full testing, deploy the site or run it through a local HTTP server.

SEO AFTER DEPLOYMENT
1. Confirm https://oryele.ai/ loads without a redirect to .com.
2. Confirm https://oryele.ai/robots.txt and https://oryele.ai/sitemap.xml load.
3. Submit https://oryele.ai/sitemap.xml in the oryele.ai Google Search Console property.
4. Inspect the homepage and request indexing.
5. Keep the .com-to-.ai redirects active as permanent 301 redirects.
