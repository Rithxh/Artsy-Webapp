from flask import Flask, json, request
import requests
from datetime import datetime,timezone
import os

app = Flask(__name__)
app.config.from_file(os.path.join(app.root_path,'config.json'),load=json.load)

def authenticate():
    current = datetime.now(timezone.utc)
    if not app.config.get('TOKEN')  or (current > datetime.fromisoformat(app.config['EXPIRES_AT'])):
        params = {'client_id':app.config.get('CLIENT_ID'),'client_secret':app.config.get('CLIENT_SECRET')}
        response = requests.post('https://api.artsy.net/api/tokens/xapp_token',data=params)
        data = response.json()
        print(data)
        with open(os.path.join(app.root_path,'config.json'),'w') as file:
            json.dump({'TOKEN':data['token'],'EXPIRES_AT':data['expires_at'],'CLIENT_ID':app.config.get('CLIENT_ID'),'CLIENT_SECRET':app.config.get('CLIENT_SECRET')},file)
        app.config.from_file(os.path.join(app.root_path,'config.json'),load=json.load)


@app.route('/', methods=['GET','POST'])
def renderPage():
    authenticate()
    return app.send_static_file('templates/index.html')

@app.route('/artists',methods=['GET','POST'])
def get_artists():
    print(app.config)
    requestData = request.get_json()
    name = requestData.get('query')
    artists=[]
    params = {'q':name, 'size':'10', 'type':'artist'}
    headers = {'X-XAPP-Token':app.config.get('TOKEN')}
    response = requests.get('https://api.artsy.net/api/search',data=params,headers=headers)
    data = response.json()['_embedded']['results']
    for obj in data:
        new_artist={'title':obj['title'],'id':obj['_links']['self']['href'].split('/')[5],'image':obj['_links']['thumbnail']['href']}
        artists.append(new_artist)
    return artists

@app.route('/bio',methods=['GET','POST'])
def get_artist_bio():
    requestData = request.get_json()
    id = requestData.get('id')
    headers = {'X-XAPP-Token':app.config.get('TOKEN')}
    response = requests.get(f'https://api.artsy.net/api/artists/{id}',headers=headers)
    data = response.json()
    bios={'name':data['name'],'birthday':data['birthday'],'deathday':data['deathday'],'nationality':data['nationality'],'biography':data['biography']}
    return bios

if __name__=="__main__":
    app.run(debug=True)