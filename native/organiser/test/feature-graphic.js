const { chromium } = require('playwright'); const path=require('path'); const O=path.join(__dirname,'..');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1024,height:500}});
const shot='data:image/png;base64,'+require('fs').readFileSync(O+'/store-assets/1080x1920/01-overview.png').toString('base64');
await p.setContent(`<body style="margin:0;width:1024px;height:500px;overflow:hidden;background:linear-gradient(160deg,#2A1546,#3B1F63 55%,#4E2D80);font-family:Georgia,serif;color:#fff;position:relative">
<div style="position:absolute;left:56px;top:96px;width:560px"><div style="font-size:60px;font-weight:700;line-height:1.05">Child Organiser</div>
<div style="font:500 28px/1.35 Helvetica,Arial,sans-serif;margin-top:22px;color:#F4E8FF">Photograph a letter. It is filed. One page for anyone who helps your child.</div>
<div style="display:inline-block;margin-top:28px;background:#E8663C;border-radius:30px;padding:10px 24px;font:700 22px Helvetica,Arial,sans-serif">Free for parents</div></div>
<div style="position:absolute;left:690px;top:50px;width:260px;height:462px;border-radius:30px 30px 0 0;border:6px solid #1b0d30;overflow:hidden;background:#fff"><img src="${shot}" style="width:100%;display:block"></div></body>`);
await p.waitForTimeout(500);await p.screenshot({path:O+'/store-assets/play-feature-graphic-1024x500.png'});await b.close();
require('sharp')(O+'/assets/icon-only.png').resize(512,512).png().toFile(O+'/store-assets/play-icon-512x512.png');})();
