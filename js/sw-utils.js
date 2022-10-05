
/*Actualiza el cache cacheName, guardando en él el request. La respuesta que se use en el método put debe
pasarse en en resp. 
Retorna una promesa.
*/
function actualizaCacheDinamico(cacheName, request, resp) {

    if (resp.ok) {
        //La respuesta tiene datos y es almacenable
        
        return caches.open(cacheName)
            .then(cache => {
                cache.put(request, resp.clone());
                return resp.clone();
            });

    } else {
        //La respuesta no es almacenable
        return resp
    }
}