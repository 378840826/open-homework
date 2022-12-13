/**
 * 做完一次作业后，再做作业时直接显示错题答案
 */

let tokendata = ''
let loading = false
let answerObj = {}

// 答案和页面答案
const dict = {
  '0': 'A',
  '1': 'B',
  '2': 'C',
  '3': 'D',
  '4': 'E',
  '5': 'F',
  '6': 'G',
  '7': 'H',
  '8': 'I',
  '9': 'J',
}

// 向页面注入 inject.js
function addInjectJs(jsPath) {
  jsPath = 'js/inject.js';
  var temp = document.createElement('script');
  temp.setAttribute('type', 'text/javascript');
  temp.src = chrome.extension.getURL(jsPath);
  temp.onload = function () {
    this.parentNode.removeChild(this);
  };
  document.head.appendChild(temp);
}

// 添加按钮到页面
function addBtnToPage() {
  const div = document.createElement('div')
  div.style.position = 'fixed';
  div.style.top = '10px';
  div.style.right = '20px';
  div.style.width = '100px';
  div.style.height = '190px';
  div.style.background = '#fff';
  div.style.border = '1px solid red';
  div.style.color = 'red';
  div.style.textAlign = 'center'
  div.style.zIndex = '99'
  div.innerText = '作业小助手'
  // 快速全选 A 按钮
  const btnSelect = document.createElement('button')
  btnSelect.innerText = '全选A'
  btnSelect.style.margin = '10px 0'
  // 获取答案按钮
  const btnGetResult = document.createElement('button')
  btnGetResult.innerText = '获取参考答案'
  btnGetResult.style.margin = '10px 0'
  // 一键填充参考答案按钮
  const btnFillResult = document.createElement('button')
  btnFillResult.innerText = '填充参考答案'
  // 绑定事件
  btnSelect.addEventListener('click', () => {
    console.log('点击全选A');
    select('A')
  })
  btnGetResult.addEventListener('click', () => {
    console.log('点击获取参考答案');
    if (loading) {
      window.alert('小助手: 正在获取参考答案，请不要重复获取')
    } else {
      loading = true
      setLoading()
      getResult()
    }
  })
  btnFillResult.addEventListener('click', () => {
    console.log('点击填充参考答案');
    if (loading) {
      window.alert('小助手: 正在获取参考答案，获取完成后再填充')
    } else {
      fillAnswer()
    }
  })
  // 免责声明
  const p = document.createElement('p')
  p.innerText = '仅供学习交流，请仔细阅读readme文件中的免责声明'
  p.style.fontSize = '12px'
  div.appendChild(btnSelect)
  div.appendChild(btnGetResult)
  div.appendChild(btnFillResult)
  div.appendChild(p)
  window.document.body.appendChild(div)
}

function addLockToPage() {
  const div = document.createElement('div')
  div.style.position = 'fixed';
  div.style.top = '10px';
  div.style.right = '20px';
  div.style.width = '200px';
  div.style.height = '150px';
  div.style.background = '#fff';
  div.style.border = '1px solid red';
  div.style.color = 'red';
  div.style.textAlign = 'center'
  div.style.zIndex = '99'
  div.innerText = '作业小助手'
  const psInput = document.createElement('input')
  psInput.placeholder = '输入密码后启用'
  const btnOk = document.createElement('button')
  btnOk.innerText = '确定'
  btnOk.style.margin = '10px 0'
  // 绑定事件
  btnOk.addEventListener('click', () => {
    const date = new Date()
    const y = date.getFullYear().toString().slice(2)
    let m = date.getMonth() + 1
    m = (m > 9) ? m : `0${m}`
    const todayMonth = `${y}${m}`
    // 翻转
    const reverseMonth = todayMonth.split('').reverse()
    const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
    const p = reverseMonth.map(item => arr[item]).join('')
    if (psInput.value === p) {
      addBtnToPage()
      div.remove()
      window.localStorage._exOpenHomeworkAssistantFlag = '1';
    } else {
      window.alert('小助手: 密码错误或密码已失效')
    }
  })
  // 免责声明
  const p = document.createElement('p')
  p.innerText = '每月1日旧密码会失效。仅供学习交流，请仔细阅读readme文件中的免责声明，如有任何疑问请发送邮件到 xie1206@outlook.com '
  p.style.fontSize = '12px'
  div.appendChild(psInput)
  div.appendChild(btnOk)
  div.appendChild(p)
  window.document.body.appendChild(div)
}

// 设置页面 loading 提示
function setLoading() {
  const div = window.document.querySelector('.Top-Test-Info')
  if (loading) {
    const p = document.createElement('p');
    p.innerText = '小助手正在获取参考答案，请等候大约1分钟...'
    p.id = 'id-loading'
    p.style.position = 'absolute';
    p.style.top = '70%';
    p.style.left = '80%';
    p.style.color = 'red';
    div.appendChild(p)
  } else {
    div.querySelector('#id-loading').remove()
  }
}

// 添加监听获取 token (需要token来请求题目)
function getToken() {
  window.addEventListener('message', function (e) {
    // console.log('收到message:', e);
    const token = e.data.tokendata
    if (token) {
      tokendata = token
    }
  }, false);
}

// 获取全部作业简介
async function getMyWorkAll() {
  const url = 'https://learn.open.com.cn/StudentCenter/MyWork/GetOnlineJsonAll'
  const r = await fetch(url);
  const res = await r.json();
  return res;
}

// 获取 url 参数
function getUrlParams() {
  let r = {}
  window.location.search.split('?')[1].split('&').forEach(item => {
    const [key, value] = item.split('=')
    r[key] = value
  })
  return r
}

// 请求答案和题目
function getResult() {
  getMyWorkAll().then(myWorkAll => {
    console.log('myWorkAll', myWorkAll);
    if (myWorkAll.status !== 0) {
      window.alert(`小助手: ${myWorkAll.message}。`)
      loading = false
      setLoading()
      return
    }
    // 找到这次作业的简介信息
    const { studentHomeworkId } = getUrlParams()
    let thisWork
    for (let i = 0; i < myWorkAll.data.listWork.length; i++) {
      const work = myWorkAll.data.listWork[i];
      thisWork = work.Data.find(d => d.studentHomeworkId === studentHomeworkId)
      if (thisWork) {
        break
      }
    }
    console.log('thisWork', thisWork);
    // 如果提交次数为 0，则不请求答案，因为还没有错题本答案
    if (thisWork.SubmitCount === 0) {
      window.alert('小助手: 请先全选A并提交一次作业')
    } else {
      getWrongAnswer(tokendata, thisWork)
    }
  })
}

// 获取错题本
function getWrongQuestions(workInfo) {
  const baseUrl = 'https://learn.open.com.cn/StudentCenter/OnlineJob/GetWrongQuestions'
  const { CourseID, studentHomeworkId } = getUrlParams()
  const { homeCourseId } = workInfo
  const url = `${baseUrl}?courseid=${CourseID}&studentHomeworkId=${studentHomeworkId}&homeCourseId=${homeCourseId}`
  return fetch(url).then(r => r.json()).then(r => {
    if (r.status !== 0) {
      return r.message
    }
    return r.data.Rows
  })
}

// 请求题目，生成答案对象,并显示
function getAnswerShow(answerList, tokendata) {
  const { studentHomeworkId } = getUrlParams()
  const getHomeworkUrl = `https://homeworkapi.open.com.cn/getHomework?studentHomeworkId=${studentHomeworkId}`
  fetch(getHomeworkUrl, {
    method: 'get',
    headers: {
      Authorization: localStorage.getItem("token"),
      appType: 'OES',
      Accept: 'application/json, text/plain, */*',
      token: tokendata,
      schoolId: JSON.parse(localStorage.getItem('homeworkSDKXapiData')).organizationId,
    },
  })
    .then(r => r.json())
    .then(res => {
      const homework = res.data.paperInfo.Items
      homework.forEach(homeworkItem => {
        const topicI2 = homeworkItem.I2
        for (let i = 0; i < answerList.length; i++) {
          const answerI2 = answerList[i].I2;
          if (topicI2 === answerI2) {
            answerObj[homeworkItem.I1] = answerList[i].I7
            break
          }
        }
      })
      showAnswer()
    })
}

// 请求错题本的答案
function getWrongAnswer(tokendata, workInfo) {
  // 获取错题本
  getWrongQuestions(workInfo).then(list => {
    console.log('错题本list', list);
    if (typeof list === 'string') {
      window.alert(`小助手: ${list}。如果未找到错题信息，请先全选A并提交一次当前作业`)
      loading = false
      setLoading()
      return;
    }
    // 循环请求全部错题答案
    let index = 0
    const answerList = []
    const baseUrl = 'https://learn.open.com.cn/StudentCenter/OnlineJob/GetQuestionDetail'
    const timer = setInterval(() => {
      console.log('index', index);
      // 终止循环的条件
      if (index >= list.length) {
        clearInterval(timer)
        console.log('答案 answerList', answerList);
        // 答案全部拿到后，再获取题目内容来对应题目
        getAnswerShow(answerList, tokendata)
      }
      const { ItemBankId, QuestionId } = list[index]
      const url = `${baseUrl}?itemBankId=${ItemBankId}&questionId=${QuestionId}`
      fetch(url).then(r => r.json()).then(r => {
        answerList.push(r.data)
      })
      index++;
    }, 500)
  })
}

// 把答案显示在页面上
function showAnswer() {
  console.log('最终答案', answerObj);
  loading = false
  setLoading()
  // 题目
  const nodeList = document.querySelectorAll('.Subject-Description')
  for (let i = 0; i < nodeList.length; i++) {
    const div = nodeList[i];
    const columnNumberDiv = div.querySelector('.Column-Number')
    const itemid = div.getAttribute('itemid')
    const answerArr = answerObj[itemid]
    const p = document.createElement('p');
    let innerText = '';
    if (answerArr) {
      const itemAnswer = answerArr.map(item => dict[item])
      innerText = `参考答案: ${itemAnswer}`
    } else {
      // 未获取到答案的题目，也就是没在错题本中的题目，也就是上一次全选A提交是正确的，答案是 A
      innerText = '参考答案: (A) 未获取到参考答案，如果你是严格按流程操作的，那此题参考答案是 A'
    }
    p.innerText = innerText
    p.style.color = 'red'
    columnNumberDiv.appendChild(p)
  }
}

// 把答案填充
function fillAnswer() {
  console.log('填充答案', answerObj);
  if (Object.keys(answerObj).length === 0) {
    window.alert('小助手: 还未获取答案')
    return;
  }
  // 题目
  const nodeList = document.querySelectorAll('.Subject-Description')
  for (let i = 0; i < nodeList.length; i++) {
    const div = nodeList[i];
    const itemid = div.getAttribute('itemid')
    const answerArr = answerObj[itemid]
    const iList = div.querySelectorAll('.Subject-Options .Item-Option i')
    if (answerArr) {
      const itemAnswer = answerArr.map(item => dict[item])
      // 考虑多选的情况
      iList.forEach(option => {
        // 如果是正确选项
        if (itemAnswer.includes(option.innerText)) {
          // 如果正确选项没有被选中，点击他选中
          if (!option.closest('.Item-Option').classList.contains('Choosed')) {
            option.click()
          }
        } else {
          // 如果错误选项
          // 并且被选中了，点击他取消选中
          if (option.closest('.Item-Option').classList.contains('Choosed')) {
            option.click()
          }
        }
      });
    } else {
      // 未获取到答案的题目，也就是没在错题本中的题目，也就是上一次全选A提交是正确的，答案是 A
      const optionA = Array.from(iList).find(iEl => iEl.innerText === 'A')
      if (!optionA.closest('.Item-Option').classList.contains('Choosed')) {
        optionA.click()
      }
    }
  }
}

// 选择页面的某个选项
function select(option) {
  const allUl = Array.from($('.Subject-Options'))
  allUl.forEach(ul => {
    const iList = $(ul).find('.Item-Option i')
    const targetOption = Array.from(iList).find(iEl => iEl.innerText === option)
    if (!targetOption.closest('.Item-Option').classList.contains('Choosed')) {
      targetOption.click()
    }
  })
}

const __mainContentHomework = () => {
  if (window.location.pathname !== '/StudentCenter/OnLineJob/TestPaper') {
    return
  }
  getToken()
  console.log('content_homework.js');
  addInjectJs()
  if (window.localStorage._exOpenHomeworkAssistantFlag === '1') {
    addBtnToPage()
  } else {
    addLockToPage()
  }
}

__mainContentHomework()
