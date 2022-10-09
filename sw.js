importScripts ('js/sw-utils.js');

const CACHE_STATIC_NAME = 'static-v4';

const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const CACHE_DYNAMIC_LIMIT = 50;

const CACHE_INMUTABLE_NAME = 'inmutable-v2';


//Define el APP_SHELL
const APP_SHELL=[
    // '/',
    //Solo es necesario estrictamente para el ambiente de desarrollo 
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];


//Define recursos inmutables
const APP_SHELL_INMUTABLE=[
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'css/fontawesome-free-5.3.1-web-all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];



//Instala el service worker
self.addEventListener('install', event =>{

    //Almacena en el cache CACHE_STATIC_NAME el APP SHELL de la app
    const cacheStatic = caches.open(CACHE_STATIC_NAME)
       .then(cache => cache.addAll(APP_SHELL));

    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME)
        .then(cache => cache.addAll(APP_SHELL_INMUTABLE));

    // Espera obligatoriamente hasta que se termine el almacenamiento en los caches de la app
    event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});



//Refresca los caches cada vez que se actualice el sw
self.addEventListener('activate', event => {

    //Borrar versiones previas del cache estÃ¡tico

    const resp = caches.keys().then(keys => {
        //recupera los nombres de caches existentes

        keys.forEach(key => {

            if (key!==CACHE_STATIC_NAME && key.includes('static')) {
                return caches.delete(key);
            }
            
            if (key!==CACHE_DYNAMIC_NAME && key.includes('dynamic')) {
                return caches.delete(key);
            }

            if (key!==APP_SHELL_INMUTABLE && key.includes('inmutable')) {
                return caches.delete(key);
            }
        })
    });

    event.waitUntil(resp);
})


//Implementa una estrategia de cache with network fallback
self.addEventListener('fetch', event => {

    const returnedResp = caches.match(event.request)
                            .then(res => {

                                if (res) return res;
                                //El recurso se encuentra en el cache y se sirve desde él

                                //El recurso no se encuentra en el cache y debe traerse de internet
                                return fetch(event.request)
                                    .then(newResp => {

                                        /*
                                        caches.open(CACHE_INMUTABLE_NAME)
                                            .then(cache => {
                                                cache.put(event.request,newResp);
                                            });
                                            
                                        return newResp.clone();
                                        */

                                        return actualizaCacheDinamico(CACHE_DYNAMIC_NAME, event.request, newResp);
                                    });
                            });

    event.respondWith(returnedResp);
})


