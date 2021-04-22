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
                // showDialog(quake.name,'Quake Details',quake);
                $('#myModal').modal()
                console.log('launched modal')
                
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

    let modalContainer = document.querySelector('#modal-container');

    function showModal(title, text) {
        // Clear all existing modal content
        modalContainer.innerHTML = '';

        let modal = document.createElement('div');
        modal.classList.add('modal');
    
        // Add close button and listener to modal
        let closeButtonElement = document.createElement('button');
        closeButtonElement.classList.add('modal-close');
        closeButtonElement.innerText = 'Close';
        closeButtonElement.addEventListener('click', hideModal);

        // Modal Title
        let titleElement = document.createElement('h1');
        titleElement.innerText = title;

        // Modal Text
        let contentElement = document.createElement('p');
        contentElement.innerText = text;    
        
        modal.appendChild(closeButtonElement);
        modal.appendChild(titleElement);
        modal.appendChild(contentElement);

        modalContainer.appendChild(modal);

        modalContainer.classList.add('is-visible');
  }

  let dialogPromiseReject;

  function hideModal(){   
    let modalContainer=document.querySelector('#modal-container');
    modalContainer.classList.remove('is-visible');

    if (dialogPromiseReject){
      dialogPromiseReject();
      dialogPromiseReject=null;
    }
  }

  function showDialog(title,text,quake){
    showModal(title, text);
      
    let modalContainer=document.querySelector('#modal-container');
    let modal = modalContainer.querySelector('.modal');

    // Create a confirm button
    let confirmButton = document.createElement('button');
    confirmButton.classList.add('modal-confirm');
    confirmButton.innerText = 'Confirm';

    // Create a cancel button
    let cancelButton = document.createElement('button');
    cancelButton.classList.add('modal-cancel');
    cancelButton.innerText = 'Cancel';

    // Create an unordered list with details
    let quakeDetails=document.createElement('ul');
    quakeDetails.classList.add('quake-list');

    // Create list items of quake details and all to parent list
    let quakeDetailURL=document.createElement('li');
    quakeDetailURL.innerText='Event URL: '+quake.nonJsonUrl;
    quakeDetails.appendChild(quakeDetailURL);

    let quakeDetailMagnitude=document.createElement('li');
    quakeDetailMagnitude.innerText='Magnitude: '+quake.magnitude;
    quakeDetails.appendChild(quakeDetailMagnitude);

    let quakeDetailLatitude=document.createElement('li');
    quakeDetailLatitude.innerText='Latitude: '+quake.latitude;
    quakeDetails.appendChild(quakeDetailLatitude);

    let quakeDetailLongitude=document.createElement('li');
    quakeDetailLongitude.innerText='Longitude: '+quake.longitude;
    quakeDetails.appendChild(quakeDetailLongitude);

    let quakeDetailDepth=document.createElement('li');
    quakeDetailDepth.innerText='Depth (km): '+quake.depth;
    quakeDetails.appendChild(quakeDetailDepth);

    let quakeImage=document.createElement('img');
    quakeImage.src=quake.imgURL;
 
    modal.appendChild(quakeImage);
    modal.appendChild(quakeDetails);
    modal.appendChild(confirmButton);
    modal.appendChild(cancelButton);

    confirmButton.focus;

    return new Promise((resolve,reject) => {
      cancelButton.addEventListener('click', hideModal);
      confirmButton.addEventListener('click', () => {
        dialogPromiseReject=null;
        hideModal();
        resolve();
      });
      dialogPromiseReject=reject;
    });
  }

  // Listens for escape key to exit modal/dialogue
    window.addEventListener('keydown', (e) =>{
        let modalContainer = document.querySelector('#modal-container');
        if(e.key==='Escape' && modalContainer.classList.contains('is-visible')){
            hideModal();
        }
    });

    // Listens for click outside modal/dialog to exit
    modalContainer.addEventListener('click', (e) => {
        // Since this is also triggered when clicking INSIDE the modal
        // We only want to close if the user clicks directly on the overlay
        let target = e.target;
        if(target=== modalContainer){
            hideModal();
        }
    })

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