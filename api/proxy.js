export const config = {
  api: { bodyParser: false }  // 關閉 Next.js 內建解析
};

export default async function handler(req, res) {
  // 處理 OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*')
      .end();
  }

  const { url: targetUrl } = req.query;
  if (!targetUrl) {
    return res.status(400)
      .setHeader('Access-Control-Allow-Origin', '*')
      .send('缺少 url 參數');
  }

  try {
    const headers = { ...req.headers };
    delete headers.host;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
	  duplex: 'half',
    });

    // 設定 CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(response.status);

    const { Readable } = await import('stream');
    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    res.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .send(`錯誤: ${error.message}`);
  }
}