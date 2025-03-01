from flask import Flask, json
import requests
from datetime import datetime,timezone
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

def authenticate():
    current = datetime.now(timezone.utc)
    if not os.getenv('TOKEN')  or (current > datetime.fromisoformat(os.getenv('EXPIRES_AT'))):
        params = {'client_id':os.getenv('CLIENT_ID'),'client_secret':os.getenv('CLIENT_SECRET')}
        response = requests.post('https://api.artsy.net/api/tokens/xapp_token',data=params)
        data = response.json()
        os.environ['TOKEN'] = data['token']
        os.environ['EXPIRES_AT'] =data['expires_at']

        with open(os.path.join(app.root_path,'.env'),'w') as file:
            file.write(f"CLIENT_ID={os.environ['CLIENT_ID']}\n")
            file.write(f"CLIENT_SECRET={os.environ['CLIENT_SECRET']}\n")
            file.write(f"TOKEN={data['token']}\n")
            file.write(f"EXPIRES_AT={data['expires_at']}\n")
        return data['token']
    return os.environ['TOKEN']
                    

@app.route('/', methods=['GET','POST'])
def renderPage():
    return app.send_static_file('templates/index.html')

@app.route('/artists/<string:artist>',methods=['GET'])
def get_artists(artist):
    artists=[]
    params = {'q':artist, 'size':'10', 'type':'artist'}
    headers = {'X-XAPP-Token':authenticate()}
    response = requests.get('https://api.artsy.net/api/search',data=params,headers=headers)
    data = response.json().get('_embedded').get('results')
    for obj in data:
        new_artist={'title':obj['title'],'id':obj['_links']['self']['href'].split('/')[5],'image':obj['_links']['thumbnail']['href']}
        artists.append(new_artist)
    return artists

@app.route('/bio/<string:id>',methods=['GET'])
def get_artist_bio(id):
    headers = {'X-XAPP-Token':authenticate()}
    response = requests.get(f'https://api.artsy.net/api/artists/{id}',headers=headers)
    data = response.json()
    bios={'name':data['name'],'birthday':data['birthday'],'deathday':data['deathday'],'nationality':data['nationality'],'biography':data['biography']}
    return bios

if __name__=="__main__":
    app.run(debug=True)