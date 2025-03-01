async function getArtistDetails(event){
    event.preventDefault();

    const artist_bio_card = document.getElementById('artist-bio');
    artist_bio_card.innerHTML = "";
    artist_bio_card.style.display = "none";

    const name = document.getElementById('query').value;
    document.getElementById('loader').style.display = "block";

    const artist_cards = document.getElementById('search-results-cards');

    try{
        const response =  await fetch(`/artists/${name}`);
        if(!response.ok){
            throw new Error("Artist not found");
        }
        const artists = await response.json();

        artist_cards.innerHTML = "";

        if(artists && artists.length){
            artists.forEach(artist => {
                const no_results_card = document.getElementById('no-results');
                no_results_card.style.display = "none";

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
        }else{
            const no_results_card = document.getElementById('no-results');
            no_results_card.style.display = "block";
        }
    }catch(error){
        console.error("Error fetching artists ",error)
    }finally{
        document.getElementById('loader').style.display = "none";
    }  
}

async function getArtistBio(id){
    document.querySelectorAll('.artist-card').forEach(el=>{el.classList.remove('selected-card')});
    document.getElementById('loader').style.display = "block";
    const selectedArtist = document.getElementById('artist-'+id);
    selectedArtist.classList.add('selected-card');

    const artist_bio_card = document.getElementById('artist-bio');
    artist_bio_card.style.display = "flex";
    artist_bio_card.innerHTML = "";

    try{
        const response = await fetch(`/bio/${id}`);
        if(!response.ok){
            throw new Error("Artist not found");
        }
        const bio = await response.json();
        
        const artist_details = document.createElement('h2');
        artist_details.textContent = bio['name'] + " (" + bio['birthday'] + "-" + bio['deathday'] + ")";

        const artist_nation = document.createElement('h3');
        artist_nation.textContent = bio['nationality'];

        const artist_bio = document.createElement('p');
        artist_bio.textContent = bio['biography'];
        
        artist_bio_card.appendChild(artist_details);
        artist_bio_card.appendChild(artist_nation);
        artist_bio_card.appendChild(artist_bio);
    }catch(error){
        console.error("Error fetching bio ",error)
    }finally{
        document.getElementById('loader').style.display = "none";
    }
}