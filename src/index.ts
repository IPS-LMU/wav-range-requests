import { WavRangeReq } from './wavrangereq.worker';

async function init(){
  const wavUrl = new URL("http://localhost:9000/please_call_stella.wav");
  // construct class
  const wavrangereq = await new WavRangeReq();
  
  // using setter for now
  await wavrangereq.setURL(wavUrl.href);
  // get info about the wav file (most importantly )
  let fileInfo = await wavrangereq.getWavFileInfo();
  console.log("fileInfo:");
  console.log(fileInfo);
  
  let wavRangeObj = await wavrangereq.getRange(44100, 441000);
  console.log("wavRangeObj");
  console.log(wavRangeObj);
  
  // parse requested range
  let offlineCtx = new window.OfflineAudioContext(
    wavRangeObj.numberOfChannels,
    wavRangeObj.length,
    wavRangeObj.sampleRate
  );
  
  // test decode (this has to be done on the main thread)
  let audioBuffer: AudioBuffer = await offlineCtx.decodeAudioData(wavRangeObj.buffer);
  console.log(audioBuffer);
  
  
  // test append to audio element
  console.log(wavRangeObj.buffer);
  const blob: Blob = new Blob([wavRangeObj.buffer], { type: "audio/wav" });
  const url = window.URL.createObjectURL(blob);
  console.log(url);
  // const audioElement: HTMLAudioElement | null = <HTMLAudioElement>document.getElementById("audioel"); 
  // audioElement.src = url;

}

init();

export function numToString(num: number): string {
  return(num.toString());
}
