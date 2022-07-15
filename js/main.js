fetch('http://127.0.0.1:8000/refresh_api')

async function timerChange() {
  const but = document.getElementById('button')
  if (but.innerText === 'Старт') {
    but.innerText = 'Стоп'
  } else {
    but.innerText = 'Старт'
  }
  await fetch('http://127.0.0.1:8000/record_timer')
}

let commonTimerValue = 0

const map = {
  'Stop' : 'Стоп',
  'Start' : 'Старт'
}

/**
 *
 * @param seconds {number}
 * @returns {string}
 */
function toTime(seconds) {
  let hh = parseInt(seconds / 3600)
  if (hh < 10) { hh = '0' + hh }

  let mm = parseInt((seconds - hh*3600) / 60)
  if (mm < 10) { mm = '0' + mm }

  let ss = parseInt(seconds - hh*3600 - mm*60)
  if (ss < 10) { ss = '0' + ss }

  return `${hh}:${mm}:${ss}`
}

let lastEvent = 'Стоп'
const ws = new WebSocket('ws://127.0.0.1:8000/ws')
ws.onmessage = function(event) {
  const data = JSON.parse(event.data)
  const timerEvent = map[data.event]
  if (lastEvent !== timerEvent) {
    document.getElementById('table').innerHTML += `
      <div class="row ml-1">
        <div class="col">${data.timestamp}</div>
        <div class="col">${toTime(data.timer)}</div>
        <div class="col">${data.event}</div>
      </div>
    `
    lastEvent = timerEvent
  }

  if (document.getElementById('button').innerText === 'Стоп') {
    commonTimerValue += .5
    document.getElementById('timer').innerText = toTime(commonTimerValue)
  }
}
setInterval(()=>{
  ws.send('0')
}, 500)