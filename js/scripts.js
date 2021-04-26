// IIFE creates a new array quakeRepository while leaving original quakeList unchanged
let quakeRepository=(function(){
    
    // initial array declartion
    let quakeList = []; 

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
        let quakeList=document.querySelector('.list-group');
        let listQuake=document.createElement('li');
        let button=document.createElement('button')
        button.innerText=quake.name;
        listQuake.appendChild(button);
        quakeList.appendChild(listQuake);
        listQuake.classList.add('group-list-item');
        button.classList.add('btn');
        button.classList.add('btn-primary');
        button.classList.add('button-quake');
        button.setAttribute('data-toggle','modal');
        button.setAttribute('data-target','myModal');
        button.addEventListener('click', function(){
            showDetails(quake);
    });
}

    // Shows the details of an earthquake by calling the showDialog function when the button is pressed
    function showDetails(quake){

            loadDetails(quake).then(function(){
                // Create an unordered list with details
                let quakeDetails=document.createElement('ul');
                quakeDetails.classList.add('list-group');
                 
                // Clear out existing text
                $('#myModal').find('.modal-body').text('');

                // Create list items of quake details and add to parent list
                
                let quakeDetailURL=document.createElement('li');
                quakeDetailURL.innerText='Event URL: ';
                var USGSUrl = document.createElement("a");
                USGSUrl.textContent = quake.nonJsonUrl;
                USGSUrl.setAttribute('href', quake.nonJsonUrl);
                USGSUrl.setAttribute('target','_blank')
                quakeDetailURL.appendChild(USGSUrl);
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

                $('#myModal').find('.modal-title').text(quake.name);      
                $('#myModal').modal();               
            });            
        };
    

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
    
    function assembleTargetURL(){
        // Gather user input to create the USGS search string
        let startDate=$('#input-start-date').val();
        let endDate=$('#input-end-date').val();
        let latitude=$('#input-center-latitude').val();
        let longitude=$('#input-center-longitude').val();
        let radius=$('#input-event-radius').val();
        let assembledTargetURL='https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake&starttime='+startDate+'&endtime='+endDate+'&latitude='+latitude+'&longitude='+longitude+'&maxradiuskm='+radius;
        // Assign to target variable for function loadList
        apiUrl=assembledTargetURL;

        // Call load
        loadList().then(function() {
            // Now the data is loaded!
            getAll().forEach(function(quake){
                addListItem(quake);
            })
        })
    }

    return{
        add: add,
        getAll: getAll,
        addListItem: addListItem,
        showDetails: showDetails,
        loadList: loadList,
        loadDetails: loadDetails,
        showLoadingMessage: showLoadingMessage,
        hideLoadingMessage: hideLoadingMessage,
        assembleTargetURL: assembleTargetURL
    };
})();