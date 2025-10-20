const https = require('https');
const http = require('http');
const { URL } = require('url');

const links = [
  'https://www.invisalign.com.cn/',
  'https://www.invisalign.com.cn/en/',
  'https://www.invisalign.com.cn/mobileapp',
  'https://www.invisalign.com.cn/get-invisalign-trained',
  'https://www.invisalign.com.cn/find-a-doctor',
  'https://www.invisalign.com.cn/how-invisalign-works',
  'https://www.invisalign.com.cn/treatment-process',
  'https://www.invisalign.com.cn/invisalign-cost',
  'https://www.invisalign.com.cn/privacy-policy',
  'https://www.invisalign.com.cn/the-invisalign-difference/teen',
  'https://www.invisalign.com.cn/the-invisalign-difference/parent',
  'https://www.invisalign.com.cn/the-invisalign-difference/adult',
  'https://www.invisalign.com.cn/invisalign-first',
  'https://www.invisalign.com.cn/get-invisalign',
  'https://www.invisalign.com.cn/contact-us',
  'https://www.invisalign.com.cn/faq',
  'https://jobs.aligntech.com/careers',
  'https://www.invisalign.com.cn/terms-of-use',
  'https://www.invisalign.com.cn/sitemap',
  'https://www.invisalign.com.cn/who-we-are',
  'https://www.invisalign.com.cn/en/choose-your-geography',
  'https://images.ctfassets.net/vh25xg5i1h5l/2D0s7FTxt3T3PTk9ZoUZjY/2c4e4f7a6ac0d7b379fd78afc8684b64/weibo_QR_code.jpg',
  'http://www.beian.miit.gov.cn/',
  'https://beian.miit.gov.cn/#/Integrated/index'
];

async function checkLink(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        method: 'HEAD',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
        }
      };

      const req = client.request(url, options, (res) => {
        resolve({
          url,
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400
        });
      });

      req.on('error', (err) => {
        resolve({
          url,
          status: 'ERROR',
          ok: false,
          error: err.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          status: 'TIMEOUT',
          ok: false,
          error: 'Request timeout'
        });
      });

      req.end();
    } catch (err) {
      resolve({
        url,
        status: 'INVALID',
        ok: false,
        error: err.message
      });
    }
  });
}

async function checkAllLinks() {
  console.log('Checking links on https://www.invisalign.com.cn\n');
  console.log('=' .repeat(80));
  
  const results = [];
  for (const link of links) {
    const result = await checkLink(link);
    results.push(result);
    
    const status = result.ok ? '✓' : '✗';
    const statusCode = result.status;
    console.log(`${status} [${statusCode}] ${result.url}`);
    if (!result.ok && result.error) {
      console.log(`  Error: ${result.error}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  const broken = results.filter(r => !r.ok);
  console.log(`\nTotal links checked: ${results.length}`);
  console.log(`Working links: ${results.length - broken.length}`);
  console.log(`Broken links: ${broken.length}`);
  
  if (broken.length > 0) {
    console.log('\n--- BROKEN LINKS ---');
    broken.forEach(link => {
      console.log(`• ${link.url}`);
      console.log(`  Status: ${link.status}`);
      if (link.error) console.log(`  Error: ${link.error}`);
    });
  }
}

checkAllLinks();
