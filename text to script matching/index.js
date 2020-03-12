const nconf = require('nconf');

//***Change after movie index is added***
const indexDefinition = require('./hotels_quickstart_index.json');
//Brings in AzureSearchClient module
const AzureSearchClient = require('./AzureSearchClient.js');

//Checks that configuration info has been properly set
function getAzureConfiguration() {
    const config = nconf.file({ file: 'azure_search_config.json' });
    if (config.get('serviceName') === '[SEARCH_SERVICE_NAME]' ) {
        throw new Error("You have not set the values in your azure_search_config.json file. Change them to match your search service's values.");
    }
    return config;
}

//Creates a promise that resolves after an undefined time, allowing the app to pause while asynchronous operations complete
//Apparently, this delay is supposed to be removed (?)
function sleep(ms) {
    return(
        new Promise(function(resolve, reject) {
            setTimeout(function() { resolve(); }, ms);
        })
    );
}

const run = async () => {
    try {
        //Retrieve the configuration
        const cfg = getAzureConfiguration();

        //Create a new AzureSearchClient instance, with values from config
        const client = new AzureSearchClient(cfg.get("serviceName"), cfg.get("adminKey"), cfg.get("queryKey"), cfg.get("indexName"));
        
        //If index exists, delete it
        const exists = await client.indexExistsAsync();
        await exists ? client.deleteIndexAsync() : Promise.resolve();
        // Deleting index can take a few seconds
        await sleep(2000);

        //Create an index using the definiton
        await client.createIndexAsync(indexDefinition);
    } catch (x) {
        console.log(x);
    }
}

run();