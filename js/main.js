fetch('http://109.195.6.233/refresh_api')

async function timerChange() {
  const but = document.getElementById('button')
  if (but.innerText === 'Старт') {
    but.innerText = 'Стоп'
  } else {
    but.innerText = 'Старт'
  }
  await fetch('http://109.195.6.233/record_timer')
}

const map = {
  'Stop' : 'Стоп',
  'Start' : 'Старт'
}

const mapInverse = {
  'Stop' : 'Старт',
  'Start' : 'Стоп'
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

let lastEvent
const ws = new WebSocket('ws://109.195.6.233/ws')
ws.onmessage = function(event) {
  const data = JSON.parse(event.data)
  const timerEvent = map[data.event]
  if (lastEvent && lastEvent !== timerEvent) {
    document.getElementById('table').innerHTML += `
      <div class="row ml-1">
        <div class="col">${data.timestamp}</div>
        <div class="col">${toTime(data.timer)}</div>
        <div class="col">${data.event}</div>
      </div>
    `
    lastEvent = timerEvent
  }
  const timerFrontObj = document.getElementById('timer')
  timerFrontObj.innerText = toTime(data.time)
  if (timerFrontObj.style.visibility === 'hidden') {
    const btn = document.getElementById('button')
    btn.innerText = mapInverse[data.event]
    lastEvent = timerEvent
    timerFrontObj.style.visibility = btn.style.visibility = document.getElementById('table').style.visibility = 'visible'
  }
}
setInterval(()=>{
  ws.send('0')
}, 500)