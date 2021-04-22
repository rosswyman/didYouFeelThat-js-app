// IIFE creates a new array quakeRepository while leaving original quakeList unchanged
let quakeRepository=(function(){
    
    // initial array declartion
    let quakeList = []; 

    //Currently fetches data for 4/01/2021-4/02/2021 UTC time within 1000 km radius of Houston, TX.  Plan to replace this user input for date, center, and radius
    let apiUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake&starttime=2021-04-01&endtime=2021-04-02&latitude=29.76&longitude=-95.37&maxradiuskm=1000';

    // // adds a new quake to the end of quakeRepository
    function add(quake){
        // Checks to see if the parameter being passed to the add function is an object
        if (typeof(quake) === 'object'){     
              quakeList.push(quake);
            } else{
            alert('That is not allowed.  You have attempted to add incorrect quake information');
            }
        }

    // returns the list of resorts
    function getAll(){
        return quakeList;
    }

    // creates an unordered list of earthquakes that the user can click on for details
    function addListItem(quake){
        console.log('running addListItem')
        let quakeList=document.querySelector('.list-group');
        let listQuake=document.createElement('li');
        let button=document.createElement('button')
        button.innerText=quake.name;
        listQuake.appendChild(button);
        quakeList.appendChild(listQuake);
        listQuake.classList.add('group-list-item');
        button.classList.add('btn-success'); 
        showDetails(button, quake);
    }

    // Shows the details of an earthquake by calling the showDialog function when the button is pressed
    function showDetails(button, quake){
        button.addEventListener('click',function(){
            loadDetails(quake).then(function(){
                // Create an unordered list with details
                let quakeDetails=document.createElement('ul');
                quakeDetails.classList.add('list-group');
                 
                // Clear out existing text
                $('#myModal').find('.modal-body').text('');

                // Create list items of quake details and add to parent list
                let quakeDetailURL=document.createElement('li');
                quakeDetailURL.innerText='Event URL: '+quake.nonJsonUrl;
                quakeDetails.appendChild(quakeDetailURL);
                $('#body-modal').append(quakeDetailURL);

                let quakeDetailMagnitude=document.createElement('li');
                quakeDetailMagnitude.innerText='Magnitude: '+quake.magnitude;
                quakeDetails.appendChild(quakeDetailMagnitude);
                $('#body-modal').append(quakeDetailMagnitude);

                let quakeDetailLatitude=document.createElement('li');
                quakeDetailLatitude.innerText='Latitude: '+quake.latitude;
                quakeDetails.appendChild(quakeDetailLatitude);
                $('#body-modal').append(quakeDetailLatitude);

                let quakeDetailLongitude=document.createElement('li');
                quakeDetailLongitude.innerText='Longitude: '+quake.longitude;
                quakeDetails.appendChild(quakeDetailLongitude);
                $('#body-modal').append(quakeDetailLongitude);

                let quakeDetailDepth=document.createElement('li');
                quakeDetailDepth.innerText='Depth (km): '+quake.depth;
                quakeDetails.appendChild(quakeDetailDepth);
                $('#body-modal').append(quakeDetailDepth);

                let quakeImage=document.createElement('img');
                quakeImage.src=quake.imgURL;
                $('#body-modal').append(quakeImage);       

                $('#myModal').find('.modal-title').text(quake.name);      
                $('#myModal').modal();               
            });            
        });
    }

    // Fetches a list of earthqukes meeting the user criteria from USGS
    function loadList() {
        showLoadingMessage();
        return fetch(apiUrl).then(function (response) {
          return response.json();
        }).then(function (json){
            json.features.forEach(function(item){
                // Define what information will be gather for each earthquake
                let quake ={
                    name: item.properties.title,
                    detailURL: item.properties.detail,
                    // The following fields that will be populated from detailURL
                    imgURL: null,
                    nonJsonUrl: null,
                    magnitude: null,
                    latitude: null,
                    longitude: null,
                    depth: null              
                };
                
                add(quake);
                hideLoadingMessage();
            });
        }).catch(function(e){
            hideLoadingMessage();
            console.error(e);
        });
    }
    
    function loadDetails(quake){
        showLoadingMessage();
        let url=quake.detailURL;
        return fetch(url).then(function(response){
            return response.json();
        }).then(function (item) {
            // quake.imgURL=item.properties.products.dyfi["contents.nm60331242_ciim.jpg"]url;
            quake.imgURL='https://via.placeholder.com/150';
            quake.nonJsonUrl=item.properties.url;
            quake.magnitude=item.properties.mag.toFixed(1);
            quake.latitude=item.geometry.coordinates[0].toFixed(4);
            quake.longitude=item.geometry.coordinates[1].toFixed(4);
            quake.depth=item.geometry.coordinates[2].toFixed(3);
            hideLoadingMessage();
        }).catch(function(e){
            hideLoadingMessage();
            console.error(e);
        });
    }

    function showLoadingMessage(){
        console.log('Sit tight while we get that information pulled together for ya');
    }

    function hideLoadingMessage(){
        console.clear();
    }

    return{
        add: add,
        getAll: getAll,
        addListItem: addListItem,
        showDetails: showDetails,
        loadList: loadList,
        loadDetails: loadDetails,
        showLoadingMessage: showLoadingMessage,
        hideLoadingMessage: hideLoadingMessage
    };
})();


quakeRepository.loadList().then(function() {
    // Now the data is loaded!
    
    quakeRepository.getAll().forEach(function(quake){
    quakeRepository.addListItem(quake);
    });
  });