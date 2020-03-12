const fetch = require('node-fetch'); //annoying message, doesnt matter!


//Building search class
class AzureSearchClient{
    constructor(searchServiceName, adminKey, queryKey, indexName) {
        this.searchServiceName = searchServiceName;
        this.adminKey = adminKey;
        this.queryKey = queryKey; //only for read-only requests
        this.indexName = indexName;
        this.apiVersion = '2019-05-06';
    }

    //Builds the https url of the index
    getIndexUrl() { 
        return `https://${this.searchServiceName}.search.windows.net/indexes/${this.indexName}?api-version=${this.apiVersion}`; 
    }

    //Returns Fetch API's "promise" to execute HTTP request
    static async request(url, method, apiKey, bodyJson = null) {
        //Uncomment the following for request details:
        //Not sure what this does..
        console.log(`\n${method} ${url}`);
        console.log(`\nKey ${apiKey}`);
        if (bodyJson !== null) {
            console.log(`\ncontent: ${JSON.stringify(bodyJson, null, 4)}`);
        }
        

        //Maps the queryKey to the 'api-key' request header
        const headers = {
            'content-type': 'application/json',
            'api-key': apiKey
        };

        //Constructs the HTTP request
        const init = bodyJson === null ?
            {
                method,
                headers
            }
            :
            {
                method,
                headers,
                body: JSON.stringify(bodyJson)  //Converts object to json string
            };

        return fetch(url, init)
    }

    //Throws an exception if the request fails !!!! Make more robust if needed
    static throwOnHttpError(response) {
        const statusCode = response.status;
        if (statusCode >= 300){
            console.log(`Request failed: ${JSON.stringify(response, null, 4)}`);
            throw new Error(`Failure in request. HTTP Status was ${statusCode}`);
        }
    }


    //Checks if the index exists
    async indexExistsAsync() {
        console.log("\n Checking if the index exists..");
        const endpoint = this.getIndexUrl();  //Gets the request endpoint
        const response = await AzureSearchClient.request(endpoint, "GET", this.adminKey);  //await the response
        const exists = response.status >= 200 && response.status < 300;  //checks if the index exists or not based on the response
        return exists;  //whether the index exists or not
    }

    //Deletes the current index
    async deleteIndexAsync() {
        console.log("\n Deleting existing index..");
        const endpoint = this.getIndexUrl();
        const response = await AzureSearchClient.request(endpoint, "DELETE", this.adminKey);
        AzureSearchClient.throwOnHttpError(response);
        return this;  //Returns the current index
    }
    
    //Creates a new index, "definition" is a JSON body
    async createIndexAsync(definition) {
        console.log("\n Creating index..");
        const endpoint = this.getIndexUrl();
        const response = await AzureSearchClient.request(endpoint, "PUT", this.adminKey, definition);
        AzureSearchClient.throwOnHttpError(response);
        return this;
    }

}

module.exports = AzureSearchClient;