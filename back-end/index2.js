const speech =require('@google-cloud/speech');//import client library
const fs = require('fs');

async function main(){
    const client = new speech.SpeechClient();//creates client object
    const fileName ='./resources/audio.raw';//ERROR


    const file = fs. readFileSync(fileName);//reads file
    const audioBytes= file.toString('base64');//converts JSON key to base64(binar data the computer can understand)

    const audio={
       content: audioBytes 
    };
    const config={
        encoding : 'LINEAR16',
        samplesRateHertz: 16000,//rate of speech
        languageCode: 'en-US'//set audio language
    };

    const request={
        audio: audio,
        config: config
    };

    //detects speech
    const [response]=await client.recognize(request);

    const transcription= response.results.map(result=>result.alternatives[0].transcript).join('\n');
    console.log(`Transcription: ${transcription}`);
}
main().catch(console.error);