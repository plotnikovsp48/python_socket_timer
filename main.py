from fastapi import FastAPI, WebSocket
import time
from fastapi.middleware.cors import CORSMiddleware

import psycopg2

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

connection = psycopg2.connect(user='postgres',
                              password='...',
                              host='localhost',
                              port='5432',
                              database='postgres')
cursor = connection.cursor()


event = 'Stop'
lastDate = 0
lastDif = 0
commonTimerValue = 0


@app.get('/refresh_api')
async def refresh_dif():
    global lastDif
    lastDif = 0
    return {'success': True}


@app.get('/record_timer')
async def record_timer_and_event():
    global event, lastDate, lastDif
    if event == 'Start':
        event = 'Stop'
        lastDif += time.time() - lastDate
    else:
        event = 'Start'
        if lastDate == 0:
            lastDate = time.time()

    lastDate = time.time()
    cursor.execute('insert into events ("Timestamp") values (' + str(int(lastDate)) + ')')
    connection.commit()
    return {'event': event}


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    global event, lastDif, commonTimerValue

    if event == 'Start':
        commonTimerValue += .5

    while True:
        await websocket.receive_text()
        cur_date = time.strftime('%H:%M:%S')
        commonTimerValue += .5
        await websocket.send_json({
            'timestamp': cur_date,
            'timer': lastDif,
            'event': event,
            'time': commonTimerValue
        })
