// 获取 token 并发送给 content （获取题目时需要这个 token）
function getTokendata() {
  window.postMessage({ tokendata: window.tokendata }, '*');
}

function __main() {
  console.log('inject.js');
  getTokendata()
}

__main()