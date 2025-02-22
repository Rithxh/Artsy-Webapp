function resetDivs(){
    const artist_cards = document.getElementById('search-results-cards');
    artist_cards.innerHTML = "";
    artist_cards.hidden = true;
    const artist_bio_card = document.getElementById('artist-bio');
    artist_bio_card.innerHTML = "";
    artist_bio_card.hidden = true;
    document.getElementById('no-results').hidden = true;
}

async function getArtistDetails(event){
    event.preventDefault();
    resetDivs();

    const name = document.getElementById('query').value;
    document.getElementById('loader').hidden = false;

    const artist_cards = document.getElementById('search-results-cards');

    try{
        const response =  await fetch('/artists',{
            method: 'POST',
            headers: new Headers({'Content-Type':'application/JSON'}),
            body: JSON.stringify({'query':name})
        });
        const artists = await response.json();

        artists.forEach(artist => {
            const new_artist = document.createElement('div');
            new_artist.classList.add('artist-card');
            new_artist.id='artist-'+artist['id'];

            const artist_thumbnail = document.createElement('img');
            artist_thumbnail.classList.add('artist-thumbnail');
            artist_thumbnail.src = artist['image'].includes('missing_image')?'/static/images/artsy_logo.svg':artist['image'];

            const artist_name = document.createElement('p');
            artist_name.textContent = artist['title'];

            new_artist.addEventListener('click',()=>getArtistBio(artist['id']));    

            new_artist.appendChild(artist_thumbnail);
            new_artist.appendChild(artist_name);
            artist_cards.appendChild(new_artist);
        })
    }catch(error){
        console.error("Error fetching artists ",error)
    }finally{
        document.getElementById('loader').hidden = true;
        if(document.getElementById('search-results-cards').childElementCount>0)
            document.getElementById('search-results-cards').hidden = false;
        else
            document.getElementById('no-results').hidden = false;
    }  
}

async function getArtistBio(id){
    document.querySelectorAll('.artist-card').forEach(el=>{el.style.backgroundColor = '#205375' });
    document.getElementById('loader').hidden = false;
    document.getElementById('artist-'+id).style.backgroundColor = '#112B3C';

    const artist_bio_card = document.getElementById('artist-bio');
    artist_bio_card.innerHTML = "";

    try{
        const response = await fetch('/bio',{
            method: 'POST',
            headers: new Headers({'Content-Type':'application/JSON'}),
            body:JSON.stringify({'id':id})
        });
        const bio = await response.json();
        
        const artist_details = document.createElement('h3');
        artist_details.textContent = bio['name'] + " (" + bio['birthday'] + "-" + bio['deathday'] + ")";

        const artist_nation = document.createElement('h4');
        artist_nation.textContent = bio['nationality'];

        const artist_bio = document.createElement('p');
        artist_bio.textContent = bio['biography'];
        
        artist_bio_card.appendChild(artist_details);
        artist_bio_card.appendChild(artist_nation);
        artist_bio_card.appendChild(artist_bio);
    }catch(error){
        console.error("Error fetching bio ",error)
    }finally{
        document.getElementById('loader').hidden = true;
        document.getElementById('artist-bio').hidden = false;
    }
}