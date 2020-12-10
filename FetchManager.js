class Fetch {
    URI = null;
    handler = null;
    done = false;

    constructor(uri, handler) {
        this.URI = uri;
        this.handler = handler;
    }

    async do() {
        fetch(this.URI, {
            credentials: 'same-origin'
        })
        .then(response=>response.json())
        .then(json=> {
            this.done = true;
            this.handler(json);
        })
    }
}

// A queue of all of the fetches that need to be done.
FETCH_QUEUE = []

async function QueueFetch(fetch) {
    FETCH_QUEUE.push(fetch)
    
    for (f of FETCH_QUEUE) {
        await f.do()        
    }
}
